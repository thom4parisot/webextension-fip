import {fetch as request} from 'whatwg-fetch';
import stations from '../stations.json';

export {stations};

export function getStationBroadcasts (station) {
  const {stationId} = stations[station];

  return request('https://www.fip.fr/latest/api/graphql', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      operationName: 'History',
      variables: {
        stationId,
        first: 10,
        after: ""
      },
      extensions: {
        persistedQuery: {
          version:1,
          sha256Hash: "a7679f6f89afe7e503b0dac11b6c2ff53dcd983f271b630d3e22f7230b1aa6b3"
        }
      }
    })
  })
  .then(res => res.json())
  .then(withResponse);
}

export function withResponse({data}) {
  return data.timelineCursor.edges.map(({node}) => node);
}

export function getStationFeed (station, quality) {
  const {streams} = stations[station];

  return streams[quality] ? streams[quality] : streams['sd'];
}

export function getStationArchiveUrl(station) {
  const {archives} = stations[station];

  return archives;
}
