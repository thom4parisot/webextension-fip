import angular from 'angular';
import browser from 'webextension-polyfill';

import Preferences from '../preferences.js';

/**
 * Indicates if the browser has a certain API available, or not
 * Not all WebExtension APIs are available at a given time (Safari 14 does not have browser.identity for instance).
 *
 * @param {String} cap
 * @returns {Boolean}
 */
const hasCapability = (cap) => cap in browser;

/**
 * Chrome API Abstraction.
 * Especially used to enables unit/function tests without relying on Chrome API direct access.
 */
export default angular.module('ChromeService', [])
  .filter('i18n', function(){
    return (key, ...args) => browser.i18n.getMessage(key, args);
  })
  .factory('preferences', () => new Preferences("localStorage"))
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
      hasCapability,
      getRedirectURL: (...args) => hasCapability('identity') && browser.identity.getRedirectURL(...args),
      getUrl: path => browser.runtime.getURL(path),
    };
  });
