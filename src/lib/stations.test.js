import {fetch as request} from 'whatwg-fetch';
import {getStationBroadcasts, getStationFeed, withLiveResponse} from './stations.js';
import fixtures from '../../resources/fixtures/livemeta.json';
import liveFixtures from '../../resources/fixtures/live.json';

jest.mock('whatwg-fetch');

describe('getStationBroadcasts()', function(){
  request.mockImplementationOnce(() => Promise.resolve({json: () => fixtures}));

  test('bring back 5 tracks', () => {
    return getStationBroadcasts('fip-paris').then(broadcasts => {
      expect(request).toHaveBeenCalledWith('https://api.radiofrance.fr/livemeta/pull/7', expect.any(Object));
      return expect(broadcasts).toHaveLength(5);
    });
  });
});

describe('withLiveResponse()', function(){
  test('keeps the current track, without the station placeholder', () => {
    const [track, ...others] = withLiveResponse(liveFixtures);

    expect(others).toHaveLength(0);
    expect(track).toMatchObject({ subtitle: 'Glitter', start_time: 1794831504 });
  });
});

describe('getStationFeed()', function(){
  test('falls back on the hd stream', () => {
    expect(getStationFeed('fip-paris', 'sd')).toEqual('https://icecast.radiofrance.fr/fip-lofi.mp3');
    expect(getStationFeed('theme-jazz', 'sd')).toEqual('https://icecast.radiofrance.fr/fipjazz-midfi.mp3');
  });
});
