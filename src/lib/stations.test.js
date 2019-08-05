import {fetch as request} from 'whatwg-fetch';
import {getStationBroadcasts} from './stations.js';
import historyFixtures from '../../resources/fixtures/history.json';
import nowFixtures from '../../resources/fixtures/now.json';

jest.mock('whatwg-fetch');

describe('getStationBroadcasts()', function(){
  request
    .mockImplementationOnce(() => Promise.resolve({json: () => nowFixtures}))
    .mockImplementationOnce(() => Promise.resolve({json: () => historyFixtures}));

  test('bring back 11 tracks', () => {
    return getStationBroadcasts('fip-paris').then(broadcasts => {
      return expect(broadcasts).toHaveLength(11);
    });
  });
});
