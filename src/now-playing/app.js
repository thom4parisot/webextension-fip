"use strict";

import angular from 'angular';
import ChromeService from './chrome-service';
import TextCleanerFilters from '../lib/text-cleaner-service';

import BroadcastController from './broadcast-controller';
import RadioController from './radio-controller';
import ScrobblingController from './scrobbling-controller';

/**
 * Now Playing App module.
 * Used to cleanly configure the popup.
 */
const App = angular.module('now-playing', ['ChromeService', 'TextCleanerFilters']).run(function appRun(){
  document.documentElement.setAttribute('lang', navigator.language);
});

App.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

App.controller('BroadcastController', BroadcastController);
App.controller('RadioController', RadioController);
App.controller('ScrobblingController', ScrobblingController);