import angular from 'angular';
import browser from 'webextension-polyfill';

/**
 * Chrome API Abstraction.
 * Especially used to enables unit/function tests without relying on Chrome API direct access.
 */
export default angular.module('ChromeService', [])
  .filter('i18n', function(){
    return browser.i18n.getMessage.bind(chrome.i18n);
  })
  .factory('chrome', function(){

    return {
      on: (channel, callback) => {
        console.log('chrome.on.' + channel);

        browser.runtime.onConnect.addListener(port => {
          port.onMessage.addListener(message => {
            console.log('chrome.on.' + channel, message);

            if (message.channel === channel){
              callback(message.data);
            }
          });
        });
      },
      message: (channel, data) => {
        const port = browser.runtime.connect(browser.runtime.id);

        port.postMessage({ channel, data });
      },
      addListener: done => {
        browser.runtime.onConnect.addListener(port => {
          port.onMessage.addListener(message => done(message));
        });
      },
      getPreference: function getPreference(key, default_value){
        var value = localStorage.getItem(key);

        return typeof value !== undefined && value !== null ? value : (default_value || null);
      },
      getRedirectURL: browser.identity.getRedirectURL.bind(browser.identity),
      setPreference: function setPreference(key, value){
        localStorage.setItem(key, value);
      },
      getUrl: function getUrl(path){
        return browser.runtime.getURL(path);
      },
      newTab: function newTab(url){
        browser.tabs.create({
          url: url,
          active: true
        });
      }
    };
  });
