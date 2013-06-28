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
      message: function sendMessage(channel, values){
        chrome.runtime.sendMessage({ "channel": channel, "data": values });
      },
      addListener: chrome.runtime.onMessage.addListener.bind(chrome.runtime.onMessage),
      getPreference: function getPreference(key, default_value){
        var value = localStorage.getItem(key);

        return typeof value !== undefined && value !== null ? value : (default_value || null);
      },
      setPreference: function setPreference(key, value){
        localStorage.setItem(key, value);
      }
    };
  });