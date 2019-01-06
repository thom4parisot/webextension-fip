const feedUrl = id => `https://www.fip.fr/livemeta/${id}`;
import stations from '../stations.json';

export {stations};

export function getStationBroadcasts (station) {
  const {channelId} = stations[station];

  return feedUrl(channelId);
}

export function getStationFeed (station, quality) {
  const {streams} = stations[station];

  return streams[quality] ? streams[quality] : streams['sd'];
}

export function getStationArchiveUrl(station) {
  const {archives} = stations[station];

  return archives;
}
