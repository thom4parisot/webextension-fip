"use strict";

import angular from 'angular';
import ChromeService from '../lib/angular/chrome-service';
import TextCleanerFilters from '../lib/angular/text-cleaner-service';
import StepsFilters from '../lib/angular/steps-service';

import BroadcastController from './broadcast-controller';
import RadioController from './radio-controller';

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
