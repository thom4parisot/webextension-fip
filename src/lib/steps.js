'use strict';

const NEVER = 0;
const BEFORE = 1;
const DURING = 2;
const AFTER = 4;

const collection = response => {
  return Object.keys(response.steps)
    .map(id => response.steps[id])
    .filter(step => step.embedType && step.embedType === 'song')
    .sort((a, b) => a.start - b.start);
};

const withinBoundaries = date => {
  return step => (
    new Date(step.start * 1000).getTime() <= date.getTime() &&
    new Date(step.end * 1000).getTime() > date.getTime()
  );
};

export default class Steps {
  static getAll(response) {
    return collection(response);
  }

  static atTime(response, timestampOrDate) {
    const date = Number.isFinite(timestampOrDate)
      ? new Date(timestampOrDate * 1000)
      : new Date(timestampOrDate);

    return collection(response).find(withinBoundaries(date));
  }

  static getCurrent(response) {
    return this.atTime(response, Date.now());
  }
}

export class Step {
  static isBefore (step, date = Date.now()) {
    return new Date(step.end * 1000).getTime() < date.getTime();
  }

  static isNow (step, date = Date.now()) {
    return withinBoundaries(date)(step);
  }

  static isAfter (step, date = Date.now()) {
    return new Date(step.start * 1000).getTime() > date.getTime();
  }
}
