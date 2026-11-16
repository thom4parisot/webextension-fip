import angular from 'angular';
import browser from 'webextension-polyfill';

import Preferences from '../preferences.js';

/**
 * Shared instance: wait for `preferences.ready()` before bootstrapping Angular.
 */
export const preferences = new Preferences(browser.storage);

/**
 * Chrome API Abstraction.
 * Especially used to enables unit/function tests without relying on Chrome API direct access.
 */
export default angular.module('ChromeService', [])
  .filter('i18n', function(){
    return (key, ...args) => browser.i18n.getMessage(key, args);
  })
  .factory('preferences', () => preferences)
  .factory('browser', () => browser)
  .factory('chrome', function(){
    return {
      on: (channel, callback) => {
        browser.runtime.onConnect.addListener(port => {
          port.onMessage.addListener(message => {
            if (message === channel || channel in message){
              callback(message[channel]);
            }
          });
        });
      },
      notify: (channel, data = null) => {
        const port = browser.runtime.connect();
        port.postMessage({ [channel]: data });
      },
      // the `identity` API is missing on Firefox for Android
      canAuthenticate: Boolean(browser.identity),
      getRedirectURL: path => browser.identity.getRedirectURL(path),
      getUrl: path => browser.runtime.getURL(path),
    };
  });
