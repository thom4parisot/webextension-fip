"use strict";

/* globals angular, chrome */

/**
 * Chrome API Abstraction.
 * Especially used to enables unit/function tests without relying on Chrome API direct access.
 */
angular.module('ChromeService', [])
  .factory('translate', function(){
    return chrome.i18n.getMessage.bind(chrome.i18n);
  })
  .factory('chrome', function(){
    return {
      process: chrome.extension.getBackgroundPage().process,
      addListener: chrome.runtime.onMessage.addListener.bind(chrome.runtime.onMessage)
    };
  });