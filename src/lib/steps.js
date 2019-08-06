const collection = timelineItems => {
  return timelineItems
    .map(timelineItem => Object.assign({}, timelineItem,
      {
        title: timelineItem.subtitle,
        authors: timelineItem.title,
        start_time: timelineItem.start_time * 1000,
        end_time: timelineItem.end_time * 1000,
      }
    ))
    .sort((a, b) => a.start_time - b.start_time);
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
