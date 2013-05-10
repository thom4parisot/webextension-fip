"use strict";

/**
 * Now Playing App module.
 * Used to cleanly configure the popup.
 */
angular.module('now-playing', ['NowPlayingService'])
  .run(function($rootScope){
    $rootScope.title = chrome.i18n.getMessage('extension_name');

    $rootScope.label = {
      album: chrome.i18n.getMessage('album'),
      artist: chrome.i18n.getMessage('artist')
    };
  });