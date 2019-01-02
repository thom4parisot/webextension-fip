import angular from 'angular';
import {isBefore, isCurrent, isAfter} from '../steps.js';

const STATUSES = {
  previous: isBefore,
  current: isCurrent,
  next: isAfter,
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
  });
