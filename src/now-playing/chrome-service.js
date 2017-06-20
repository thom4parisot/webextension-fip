import angular from 'angular';
import browser from 'webextension-polyfill';
import Preferences from '../lib/preferences.js';

/**
 * Chrome API Abstraction.
 * Especially used to enables unit/function tests without relying on Chrome API direct access.
 */
export default angular.module('ChromeService', [])
  .filter('i18n', function(){
    return browser.i18n.getMessage.bind(browser.i18n);
  })
  .factory('preferences', () => new Preferences("localStorage"))
  .factory('chrome', function(){
    return {
      on: (channel, callback) => {
        browser.runtime.onConnect.addListener(port => {
          port.onMessage.addListener(message => {
            if (message.channel === channel){
              console.log('chrome.on#' + channel, message);
              callback(message.data);
            }
          });
        });
      },
      notify: (channel, data = null) => {
        const port = browser.runtime.connect();
        port.postMessage({ [channel]: data });
      },
      addListener: done => {
        browser.runtime.onConnect.addListener(port => {
          port.onMessage.addListener(message => done(message));
        });
      },
      getRedirectURL: browser.identity.getRedirectURL.bind(browser.identity),
      getUrl: path => browser.runtime.getURL(path),
      newTab: url => browser.tabs.create({ url, active: true }),
    };
  });
