import angular from 'angular';

import ChromeService from '../lib/angular/chrome-service.js';
import TextCleanerFilters from '../lib/angular/text-cleaner-service.js';
import StepsFilters from '../lib/angular/steps-service.js';

import BroadcastController from './broadcast-controller.js';
import RadioController from './radio-controller.js';

/**
 * Now Playing App module.
 * Used to cleanly configure the popup.
 */
const App = angular.module('now-playing', ['ChromeService', 'TextCleanerFilters', 'StepsFilters']).run(chrome => {
  document.documentElement.setAttribute('lang', navigator.language);

  chrome.notify('radio.play');
});

document.querySelector('a[href="#settings"]').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

App.controller('BroadcastController', BroadcastController);
App.controller('RadioController', RadioController);
