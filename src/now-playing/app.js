"use strict";

/* globals angular */

/**
 * Now Playing App module.
 * Used to cleanly configure the popup.
 */
angular.module('now-playing', ['ChromeService', 'TextCleanerFilters'])
  .run(function appRun(){
    document.documentElement.setAttribute('lang', navigator.language);
  });