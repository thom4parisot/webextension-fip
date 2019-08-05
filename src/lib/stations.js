import {fetch as request} from 'whatwg-fetch';
import stations from '../stations.json';

export {stations};

export function getStationHistory (stationId) {
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
  .then(withHistoryResponse);
}

export function getStationNowPlaying (stationId) {
  return request('https://www.fip.fr/latest/api/graphql', {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      operationName: 'Now',
      variables: {
        stationId,
        previousTrackLimit: 0,
      },
      extensions: {
        persistedQuery: {
          version:1,
          sha256Hash: "8a931c7d177ff69709a79f4c213bd2403f0c11836c560bc22da55628d8100df8"
        }
      }
    })
  })
  .then(res => res.json())
  .then(withNowPlayingResponse);
}

export function getStationBroadcasts (station) {
  const {stationId} = stations[station];

  return Promise.all([
    getStationNowPlaying(stationId),
    getStationHistory(stationId),
  ])
  .then(([nowPlaying, ...history]) => [nowPlaying].concat(...history))
  .then(items => items.filter(d => d));
}

export function withHistoryResponse({data}) {
  return data.timelineCursor.edges.map(({node}) => node);
}

export function withNowPlayingResponse({data}) {
  return data.now ? Object.assign({}, data.now.song, data.now.playing_item) : null;
}

export function getStationFeed (station, quality) {
  const {streams} = stations[station];

  return streams[quality] ? streams[quality] : streams['sd'];
}

export function getStationArchiveUrl(station) {
  const {archives} = stations[station];

  return archives;
}
