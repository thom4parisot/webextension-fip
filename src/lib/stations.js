import stations from '../stations.json' with { type: 'json' };

export {stations};

const getJSON = url => fetch(url, {
  method: 'GET',
  mode: 'cors',
  headers: {
    'Accept': 'application/json',
  }
})
.then(res => res.json());

/**
 * Fetches the latest tracks played on a station.
 * Stations without `history` only provide the track currently played.
 *
 * @param {String} station Station key, as found in `stations.json`
 * @returns {Promise.<Array.<Object>>}
 */
export function getStationBroadcasts (station) {
  const {stationId, history} = stations[station];

  return history
    ? getJSON(`https://api.radiofrance.fr/livemeta/pull/${stationId}`).then(withLivemetaResponse)
    : getJSON(`https://api.radiofrance.fr/livemeta/live/${stationId}/webrf_fip_player`).then(withLiveResponse);
}

/**
 * Converts livemeta steps into timeline items, as expected by `Steps`.
 *
 * @param {Object} response
 * @returns {Array.<Object>}
 */
export function withLivemetaResponse({steps}) {
  return Object.values(steps)
    .filter(step => step.embedType === 'song')
    .map(step => ({
      title: step.authors,
      subtitle: step.title,
      start_time: step.start,
      end_time: step.end,
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
 * Converts the live player response into timeline items, as expected by `Steps`.
 * Items without `startTime` are the station placeholder, not a track.
 *
 * @param {Object} response
 * @returns {Array.<Object>}
 */
export function withLiveResponse({prev, now}) {
  return [...prev, now]
    .filter(item => item.startTime)
    .map(item => ({
      title: item.secondLine,
      subtitle: item.firstLine,
      start_time: item.startTime,
      end_time: item.endTime,
      cover: `https://www.radiofrance.fr/pikapi/images/${item.cover}/400x400`,
      external_links: {},
    }));
}

/**
 * Every station has a `hd` stream; others depend on the station.
 */
export function getStationFeed (station, quality) {
  const {streams} = stations[station];

  return streams[quality] || streams.hd;
}

export function getStation (station) {
  return stations[station];
}
