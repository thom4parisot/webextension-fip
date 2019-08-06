import angular from 'angular';
import {isBefore, isCurrent, isAfter} from '../steps.js';

const STATUSES = {
  previous: isBefore,
  current: isCurrent,
  next: isAfter,
};

const toMinutes = milliseconds => {
  return Math.ceil(milliseconds / 1000 / 60);
};

export default angular.module('StepsFilters', [])
  .filter('status', function(){
    return step => {
      let status = '';
      const date = new Date();

      Object.keys(STATUSES).some(d => {
        if (STATUSES[d](step, date)) {
          status = d;
          return true;
        }
      });

      return status;
    };
  })
  .filter('ago', function(){
    const relativeTime = new Intl.RelativeTimeFormat();
    return start_time => {
      const now = new Date();
      const started = new Date(start_time);

      return relativeTime.format(toMinutes(started.getTime() - now.getTime()), 'minute');
    };
  });
