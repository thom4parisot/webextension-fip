import angular from 'angular';
import browser from 'webextension-polyfill';

import Preferences from '../preferences.js';

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
      getRedirectURL: browser.identity.getRedirectURL.bind(browser.identity),
      getUrl: path => browser.runtime.getURL(path),
      newTab: url => browser.tabs.create({ url, active: true }),
    };
  });
