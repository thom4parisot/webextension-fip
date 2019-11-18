import {fetch as request} from 'whatwg-fetch';
import stations from '../stations.json';

export {stations};

const encode = (obj) => {
  return Object.entries(obj)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    .join('&');
};

export function getStationHistory (stationId) {
  const params = {
    operationName: 'History',
    variables: JSON.stringify({
      stationId,
      first: 10,
      after: ""
    }),
    extensions: JSON.stringify({
      persistedQuery: {
        version:1,
        sha256Hash: "ce6791c62408f27b9338f58c2a4b6fdfd9d1afc992ebae874063f714784d4129"
      }
    })
  };

  return request(`https://www.fip.fr/latest/api/graphql?${encode(params)}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  })
  .then(res => res.json())
  .then(withHistoryResponse);
}

export function getStationNowPlaying (stationId) {
  const params = {
    operationName: 'Now',
    variables: JSON.stringify({
      stationId,
      previousTrackLimit: 1,
    }),
    extensions: JSON.stringify({
      persistedQuery: {
        version:1,
        sha256Hash: "9551487ee4a6810ec4afa35e70dd1c204fa84db3519d39eb3176e5a3a8b0e482"
      }
    })
  };

  return request(`https://www.fip.fr/latest/api/graphql?${encode(params)}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
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

export function getStation (station) {
  return stations[station];
}
