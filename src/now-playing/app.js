import angular from 'angular';

import ChromeService from '../lib/angular/chrome-service.js';
import StepsFilters from '../lib/angular/steps-service.js';
import TextFilters from '../lib/angular/text-service.js';

import BroadcastController from './broadcast-controller.js';
import RadioController from './radio-controller.js';

/**
 * Now Playing App module.
 * Used to cleanly configure the popup.
 */
const App = angular.module('now-playing', ['ChromeService', 'StepsFilters', 'TextFilters']).run(chrome => {
  document.documentElement.setAttribute('lang', navigator.language);

  // autoplay in production only
  // it's annoying to have autoplay when developping
  if (process.env.BUILD_CHANNEL !== 'dev') {
    chrome.notify('radio.play');
  }
});

document.querySelector('a[href="#settings"]').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

App.controller('BroadcastController', BroadcastController);
App.controller('RadioController', RadioController);
