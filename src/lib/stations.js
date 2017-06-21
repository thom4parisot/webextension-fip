"use strict";

import stations from '../stations.json';

const feedUrl = id => `http://www.fipradio.fr/livemeta/${id}`;

export function getStationBroadcasts (station) {
  const {channelId} = stations[station];

  return feedUrl(channelId);
}

export function getStationFeed (station, quality) {
  const {streams} = stations[station];

  return streams[quality] ? streams[quality] : streams['sd'];
}
