import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import lastFm from './lastfm.js';
import fixtures from '../../resources/fixtures/livemeta.json' with { type: 'json' };

import {withLivemetaResponse} from './stations.js';
import Steps from './steps.js';

describe('Last.fm', function(){
  const song = Steps.getAll(withLivemetaResponse(fixtures))[0];

  /**
   * Replaces `fetch`, and returns the parameters of the request it received.
   */
  const mockRequest = t => {
    const request = t.mock.method(globalThis, 'fetch', () => Promise.resolve({json: () => ({})}));

    return () => {
      const [url, options] = request.mock.calls[0].arguments;

      return { url, method: options.method, params: Object.fromEntries(options.body) };
    };
  };

  it('should have API and Secret configured', () => {
    assert.equal(lastFm.isEnabled(), true);
  });

  it('should hint a _now playing_ tune', async (t) => {
    const getRequest = mockRequest(t);

    await new lastFm('dummy token').nowPlaying({
      artist: song.authors,
      track: song.title,
    });

    const { url, method, params } = getRequest();

    assert.equal(url, 'https://ws.audioscrobbler.com/2.0/?');
    assert.equal(method, 'POST');
    assert.match(params.api_sig, /^[0-9a-f]{32}$/);
    assert.partialDeepStrictEqual(params, {
      method: 'track.updateNowPlaying',
      artist: 'Lee Fields',
      track: 'Ladies',
      sk: 'dummy token',
      format: 'json',
    });
  });

  it('should scrobble a tune', async (t) => {
    const getRequest = mockRequest(t);

    await new lastFm('dummy token').scrobble({
      artist: song.authors,
      track: song.title,
      when: 1794830063000,
    });

    assert.partialDeepStrictEqual(getRequest().params, {
      method: 'track.scrobble',
      artist: 'Lee Fields',
      track: 'Ladies',
      timestamp: '1794830063',
      sk: 'dummy token',
    });
  });

  it('should love a tune', async (t) => {
    const getRequest = mockRequest(t);

    await new lastFm('dummy token').love({ artist: song.authors, track: song.title });

    assert.equal(getRequest().method, 'POST');
    assert.partialDeepStrictEqual(getRequest().params, {
      method: 'track.love',
      artist: 'Lee Fields',
      track: 'Ladies',
      sk: 'dummy token',
    });
  });

  it('should unlove a tune', async (t) => {
    const getRequest = mockRequest(t);

    await new lastFm('dummy token').unlove({ artist: song.authors, track: song.title });

    assert.equal(getRequest().method, 'POST');
    assert.partialDeepStrictEqual(getRequest().params, {
      method: 'track.unlove',
      artist: 'Lee Fields',
      track: 'Ladies',
      sk: 'dummy token',
    });
  });

  it('should tell if a user loves a tune', async (t) => {
    const request = t.mock.method(globalThis, 'fetch', () => Promise.resolve({
      json: () => ({ track: { userloved: '1' } }),
    }));

    const loved = await new lastFm('dummy token').isLoved({ artist: song.authors, track: song.title, username: 'jane' });
    const [url, options] = request.mock.calls[0].arguments;

    assert.equal(loved, true);
    assert.equal(options.method, 'GET');
    assert.partialDeepStrictEqual(Object.fromEntries(new URL(url).searchParams), {
      method: 'track.getInfo',
      artist: 'Lee Fields',
      track: 'Ladies',
      username: 'jane',
    });
  });

  it('should reject a request refused by Last.fm', async (t) => {
    t.mock.method(globalThis, 'fetch', () => Promise.resolve({
      json: () => ({ error: 9, message: 'Invalid session key' }),
    }));

    await assert.rejects(new lastFm('dummy token').love({ artist: song.authors, track: song.title }), {
      name: 'LastfmError',
      code: 9,
    });
  });
});
