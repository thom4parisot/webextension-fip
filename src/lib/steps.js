const collection = timelineItems => {
  return [...timelineItems].sort((a, b) => a.start_time - b.start_time);
};

const withinBoundaries = date => {
  return timelineItem => (
    date.getTime() >= new Date(timelineItem.start_time).getTime() &&
    date.getTime() < new Date(timelineItem.end_time).getTime()
  );
};

export default class Steps {
  static getAll(response) {
    return collection(response);
  }

  static atTime(response, timestampOrDate) {
    const date = new Date(timestampOrDate);

    return collection(response).find(withinBoundaries(date));
  }

  static getCurrent(response) {
    return this.atTime(response, new Date());
  }
}

export function isBefore (timelineItem, date = new Date()) {
  return new Date(timelineItem.end_time).getTime() < date.getTime();
}

export function isCurrent (timelineItem, date = new Date()) {
  return withinBoundaries(date)(timelineItem);
}

export function isAfter (timelineItem, date = new Date()) {
  return new Date(timelineItem.start_time).getTime() > date.getTime();
}

/**
 * The artist shown in the popup, and sent to scrobbling.
 * `authors` lists every credit, sometimes twice: Last.fm does not know such an artist.
 *
 * @param {{interpreters: Array.<String>=, authors: String}} timelineItem
 * @returns {String}
 */
export function artistOf ({ interpreters, authors }) {
  return interpreters?.[0] || authors;
}
