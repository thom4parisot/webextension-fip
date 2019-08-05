import {fetch as request} from 'whatwg-fetch';
import {getStationBroadcasts} from './stations.js';
import data from '../../resources/fixtures/livemeta.json';

jest.mock('whatwg-fetch');

describe('getStationBroadcasts()', function(){
  request.mockImplementation(() => Promise.resolve({json: () => data}));

  test('bring back 10 tracks', () => {
    return getStationBroadcasts('fip-paris').then(broadcasts => {
      return expect(broadcasts).toHaveLength(10);
    });
  });
});
