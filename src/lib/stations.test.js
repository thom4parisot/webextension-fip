import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {getStationBroadcasts, getStationFeed, withLiveResponse, withLivemetaResponse} from './stations.js';
import fixtures from '../../resources/fixtures/livemeta.json' with { type: 'json' };
import liveFixtures from '../../resources/fixtures/live.json' with { type: 'json' };

const respondWith = (t, response) => t.mock.method(globalThis, 'fetch', () => Promise.resolve(response));

describe('getStationBroadcasts()', function(){
  test('bring back 5 tracks', async (t) => {
    const request = respondWith(t, {ok: true, json: () => fixtures});
    const broadcasts = await getStationBroadcasts('fip-paris');

    assert.equal(request.mock.calls[0].arguments[0], 'https://api.radiofrance.fr/livemeta/pull/7');
    assert.equal(broadcasts.length, 5);
  });

  test('falls back on the main station when the station is unknown', async (t) => {
    const request = respondWith(t, {ok: true, json: () => fixtures});

    await getStationBroadcasts('theme-gone');

    assert.equal(request.mock.calls[0].arguments[0], 'https://api.radiofrance.fr/livemeta/pull/7');
  });

  test('rejects when the API responds with an error', async (t) => {
    respondWith(t, {ok: false, status: 503, json: () => ({})});

    await assert.rejects(getStationBroadcasts('fip-paris'), /503/);
  });
});

describe('withLivemetaResponse()', function(){
  test('converts songs into steps', () => {
    const steps = withLivemetaResponse(fixtures);

    assert.equal(steps.length, 5);
    assert.partialDeepStrictEqual(steps[0], {
      title: 'Ladies',
      authors: 'Lee Fields',
      start_time: 1794829808000,
      end_time: 1794830063000,
      album: 'My world',
      year: 2009,
    });
  });
});

describe('withLiveResponse()', function(){
  test('keeps the current track, without the station placeholder', () => {
    const [track, ...others] = withLiveResponse(liveFixtures);

    assert.equal(others.length, 0);
    assert.partialDeepStrictEqual(track, {
      title: 'Glitter',
      authors: 'Tyler The Creator',
      start_time: 1794831504000,
      end_time: 1794831727000,
    });
  });
});

describe('getStationFeed()', function(){
  test('returns the stream of the requested quality', () => {
    assert.equal(getStationFeed('fip-paris', 'sd'), 'https://icecast.radiofrance.fr/fip-lofi.mp3');
  });

  test('falls back on the hd stream', () => {
    assert.equal(getStationFeed('theme-jazz', 'sd'), 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3');
  });

  test('falls back on the main station when the station is unknown', () => {
    assert.equal(getStationFeed('theme-gone', 'hd'), 'https://icecast.radiofrance.fr/fip-midfi.mp3');
  });
});
