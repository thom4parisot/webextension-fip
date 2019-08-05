import angular from 'angular';

import ChromeService from '../lib/angular/chrome-service.js';

import OptionsController from './options-controller.js';
import ScrobblingController from './scrobbling-controller.js';


const App = angular.module('options', ['ChromeService']).run(() => {
  document.documentElement.setAttribute('lang', navigator.language);
});

App.controller('OptionsController', OptionsController);
App.controller('ScrobblingController', ScrobblingController);
