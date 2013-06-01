"use strict";

/* globals angular */

/**
 * Now Playing App module.
 * Used to cleanly configure the popup.
 */
angular.module('now-playing', ['BroadcastService', 'ChromeService', 'TextCleanerFilters'])
  .run(function appRun($rootScope, translate){
    $rootScope.title = translate('extension_name');

    $rootScope.label = {
      album: translate('album'),
      artist: translate('artist'),
      archives: translate('archives')
    };

    document.documentElement.setAttribute('lang', navigator.language);
  });