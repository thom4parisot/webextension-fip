import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

import LovedTracks, { LOVED_TTL } from './loved-tracks.js';
import { LastfmError } from '../lib/lastfm.js';
import Preferences from '../lib/preferences.js';
import { createStorage } from '../lib/test-doubles.js';

const LADIES = { authors: 'Lee Fields', title: 'Ladies' };
const CAROUSEL = { authors: 'Vulfpeck', title: 'Carousel' };
const DAY = 24 * 60 * 60 * 1000;

function createClient () {
  return {
    isConfigured: () => true,
    love: mock.fn(() => Promise.resolve({})),
    unlove: mock.fn(() => Promise.resolve({})),
    isLoved: mock.fn(() => Promise.resolve(true)),
  };
}

describe('LovedTracks', function(){
  let preferences, client, lovedTracks;

  beforeEach(async function(){
    preferences = new Preferences(createStorage(), { length: 0 });
    await preferences.ready();
    await preferences.set('lastfm.username', 'jane');

    client = createClient();
    lovedTracks = new LovedTracks({ preferences, client });
  });

  describe('#love', () => {
    it('should love a track, then remember it as synced', async () => {
      await lovedTracks.love(LADIES);

      assert.equal(client.love.mock.callCount(), 1);
      assert.deepStrictEqual(client.love.mock.calls[0].arguments, [{ artist: 'Lee Fields', track: 'Ladies' }]);
      assert.partialDeepStrictEqual(lovedTracks.states['lee fields|ladies'], { loved: true, confirmed: true });
    });

    it('should only send the last state of a burst of actions', async () => {
      lovedTracks.love(LADIES);
      lovedTracks.unlove(LADIES);
      await lovedTracks.love(LADIES);

      assert.equal(client.love.mock.callCount(), 1);
      assert.equal(client.unlove.mock.callCount(), 0);
    });

    it('should keep the action queued after a network failure', async () => {
      client.love.mock.mockImplementationOnce(() => Promise.reject(new TypeError('fetch failed')));

      await lovedTracks.love(LADIES);
      assert.partialDeepStrictEqual(lovedTracks.states['lee fields|ladies'], { loved: true, confirmed: undefined });

      await lovedTracks.flush();
      assert.equal(client.love.mock.callCount(), 2);
      assert.partialDeepStrictEqual(lovedTracks.states['lee fields|ladies'], { loved: true, confirmed: true });
    });

    it('should forget an action refused by Last.fm', async () => {
      client.love.mock.mockImplementationOnce(() => Promise.reject(new LastfmError({ error: 6, message: 'Track not found' })));

      await lovedTracks.love(LADIES);

      assert.equal(lovedTracks.states['lee fields|ladies'], undefined);
    });

    it('should restore the last synced state when Last.fm refuses an action', async () => {
      await lovedTracks.love(LADIES);
      client.unlove.mock.mockImplementationOnce(() => Promise.reject(new LastfmError({ error: 9, message: 'Invalid session key' })));

      await lovedTracks.unlove(LADIES);

      assert.partialDeepStrictEqual(lovedTracks.states['lee fields|ladies'], { loved: true, confirmed: true });
    });

    it('should wait for Last.fm to be configured', async () => {
      client.isConfigured = () => false;

      await lovedTracks.love(LADIES);

      assert.equal(client.love.mock.callCount(), 0);
      assert.partialDeepStrictEqual(lovedTracks.states['lee fields|ladies'], { loved: true, confirmed: undefined });
    });
  });

  describe('#lookup', () => {
    it('should ask Last.fm about unknown tracks only', async () => {
      await lovedTracks.love(LADIES);
      await lovedTracks.lookup([LADIES, CAROUSEL, { title: 'Jingle' }]);

      assert.equal(client.isLoved.mock.callCount(), 1);
      assert.deepStrictEqual(client.isLoved.mock.calls[0].arguments, [{ artist: 'Vulfpeck', track: 'Carousel', username: 'jane' }]);
      assert.partialDeepStrictEqual(lovedTracks.states['vulfpeck|carousel'], { loved: true, confirmed: true });
    });

    it('should remember a track unknown to Last.fm as not loved', async () => {
      client.isLoved.mock.mockImplementationOnce(() => Promise.reject(new LastfmError({ error: 6, message: 'Track not found' })));

      await lovedTracks.lookup([CAROUSEL]);
      await lovedTracks.lookup([CAROUSEL]);

      assert.equal(client.isLoved.mock.callCount(), 1);
      assert.partialDeepStrictEqual(lovedTracks.states['vulfpeck|carousel'], { loved: false, confirmed: false });
    });

    it('should ask again after a network failure', async () => {
      client.isLoved.mock.mockImplementationOnce(() => Promise.reject(new TypeError('fetch failed')));

      await lovedTracks.lookup([CAROUSEL]);
      await lovedTracks.lookup([CAROUSEL]);

      assert.equal(client.isLoved.mock.callCount(), 2);
    });

    it('should ask again once a state is older than a week', async (t) => {
      t.mock.timers.enable({ apis: ['Date'], now: 0 });
      await lovedTracks.lookup([CAROUSEL]);

      t.mock.timers.setTime(6 * DAY);
      await lovedTracks.lookup([CAROUSEL]);
      assert.equal(client.isLoved.mock.callCount(), 1);

      t.mock.timers.setTime(LOVED_TTL + 1);
      await lovedTracks.lookup([CAROUSEL]);
      assert.equal(client.isLoved.mock.callCount(), 2);
    });

    it('should keep queued actions, even older than a week', async (t) => {
      t.mock.timers.enable({ apis: ['Date'], now: 0 });
      client.isConfigured = () => false;
      await lovedTracks.love(LADIES);

      t.mock.timers.setTime(8 * DAY);
      client.isConfigured = () => true;
      await lovedTracks.lookup([LADIES, CAROUSEL]);

      assert.deepStrictEqual(client.isLoved.mock.calls.map(call => call.arguments[0].track), ['Carousel']);
      assert.partialDeepStrictEqual(lovedTracks.states['lee fields|ladies'], { loved: true, confirmed: undefined });
    });

    it('should drop expired states when saving', async (t) => {
      t.mock.timers.enable({ apis: ['Date'], now: 0 });
      await lovedTracks.lookup([CAROUSEL]);

      t.mock.timers.setTime(8 * DAY);
      await lovedTracks.love(LADIES);

      assert.deepStrictEqual(Object.keys(lovedTracks.states), ['lee fields|ladies']);
    });

    it('should not override an action made while asking Last.fm', async () => {
      let answer;
      client.isLoved.mock.mockImplementationOnce(() => new Promise(resolve => answer = resolve));

      const lookup = lovedTracks.lookup([LADIES]);
      await lovedTracks.unlove(LADIES);
      answer(true);
      await lookup;

      assert.partialDeepStrictEqual(lovedTracks.states['lee fields|ladies'], { loved: false });
    });
  });

});
