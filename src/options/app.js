import angular from 'angular';

import ChromeService from '../lib/angular/chrome-service.js';
import TextCleanerFilters from '../lib/angular/text-cleaner-service.js';

import OptionsController from './options-controller.js';
import ScrobblingController from './scrobbling-controller.js';


const App = angular.module('options', ['ChromeService', 'TextCleanerFilters']).run(() => {
  document.documentElement.setAttribute('lang', navigator.language);
});

App.filter('unsafe', $sce => $sce.trustAsHtml);

App.controller('OptionsController', OptionsController);
App.controller('ScrobblingController', ScrobblingController);
