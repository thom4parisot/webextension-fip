import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {getStationBroadcasts, getStationFeed, withLiveResponse} from './stations.js';
import fixtures from '../../resources/fixtures/livemeta.json' with { type: 'json' };
import liveFixtures from '../../resources/fixtures/live.json' with { type: 'json' };

describe('getStationBroadcasts()', function(){
  test('bring back 5 tracks', async (t) => {
    const request = t.mock.method(globalThis, 'fetch', () => Promise.resolve({json: () => fixtures}));
    const broadcasts = await getStationBroadcasts('fip-paris');

    assert.equal(request.mock.calls[0].arguments[0], 'https://api.radiofrance.fr/livemeta/pull/7');
    assert.equal(broadcasts.length, 5);
  });
});

describe('withLiveResponse()', function(){
  test('keeps the current track, without the station placeholder', () => {
    const [track, ...others] = withLiveResponse(liveFixtures);

    assert.equal(others.length, 0);
    assert.partialDeepStrictEqual(track, { subtitle: 'Glitter', start_time: 1794831504 });
  });
});

describe('getStationFeed()', function(){
  test('falls back on the hd stream', () => {
    assert.deepStrictEqual(getStationFeed('fip-paris', 'sd'), 'https://icecast.radiofrance.fr/fip-lofi.mp3');
    assert.deepStrictEqual(getStationFeed('theme-jazz', 'sd'), 'https://icecast.radiofrance.fr/fipjazz-midfi.mp3');
  });
});
