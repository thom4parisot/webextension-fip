"use strict";

import angular from 'angular';
import ChromeService from '../lib/angular/chrome-service';
import TextCleanerFilters from '../lib/angular/text-cleaner-service';

import OptionsController from './options-controller';
import ScrobblingController from './scrobbling-controller';

const App = angular.module('options', ['ChromeService', 'TextCleanerFilters']).run(() => {
  document.documentElement.setAttribute('lang', navigator.language);
});

App.filter('unsafe', $sce => $sce.trustAsHtml);

App.controller('OptionsController', OptionsController);
App.controller('ScrobblingController', ScrobblingController);
