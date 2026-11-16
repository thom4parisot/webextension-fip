import stations from '../stations.json' with { type: 'json' };

export {stations};

/**
 * Gives up on requests which do not answer, so a broken connection does not leave them pending.
 */
const REQUEST_TIMEOUT = 10 * 1000;

const getJSON = url => fetch(url, {
  headers: {
    'Accept': 'application/json',
  },
  signal: AbortSignal.timeout(REQUEST_TIMEOUT),
})
.then(res => {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
});

/**
 * Fetches the latest tracks played on a station.
 * Stations without `history` only provide the track currently played.
 *
 * @param {String} station Station key, as found in `stations.json`
 * @returns {Promise.<Array.<Object>>}
 */
export function getStationBroadcasts (station) {
  const {stationId, history} = getStation(station);

  return history
    ? getJSON(`https://api.radiofrance.fr/livemeta/pull/${stationId}`).then(withLivemetaResponse)
    : getJSON(`https://api.radiofrance.fr/livemeta/live/${stationId}/webrf_fip_player`).then(withLiveResponse);
}

/**
 * Converts livemeta songs into steps. Times are in milliseconds.
 *
 * @param {Object} response
 * @returns {Array.<Object>}
 */
export function withLivemetaResponse({steps}) {
  return Object.values(steps)
    .filter(step => step.embedType === 'song')
    .map(step => ({
      title: step.title,
      authors: step.authors,
      start_time: step.start * 1000,
      end_time: step.end * 1000,
      cover: step.visual,
      album: step.titreAlbum,
      label: step.label,
      year: step.anneeEditionMusique,
      interpreters: step.highlightedArtists,
      external_links: {
        itunes: step.path && { link: step.path },
        youtube: step.lienYoutube && { link: step.lienYoutube },
      },
    }));
}

/**
 * Converts the live player response into steps. Times are in milliseconds.
 * Items without `startTime` are the station placeholder, not a track.
 *
 * @param {Object} response
 * @returns {Array.<Object>}
 */
export function withLiveResponse({prev, now}) {
  return [...prev, now]
    .filter(item => item.startTime)
    .map(item => ({
      title: item.firstLine,
      authors: item.secondLine,
      start_time: item.startTime * 1000,
      end_time: item.endTime * 1000,
      cover: `https://www.radiofrance.fr/pikapi/images/${item.cover}/400x400`,
      external_links: {},
    }));
}

/**
 * Every station has a `hd` stream; others depend on the station.
 */
export function getStationFeed (station, quality) {
  const {streams} = getStation(station);

  return streams[quality] || streams.hd;
}

/**
 * Unknown stations, such as a removed webradio still saved in the preferences, fall back on FIP.
 */
export function getStation (station) {
  return stations[station] ?? stations['fip-paris'];
}
