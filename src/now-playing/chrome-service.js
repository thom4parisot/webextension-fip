import angular from 'angular';

/**
 * Chrome API Abstraction.
 * Especially used to enables unit/function tests without relying on Chrome API direct access.
 */
export default angular.module('ChromeService', [])
  .filter('i18n', function(){
    return chrome.i18n.getMessage.bind(chrome.i18n);
  })
  .factory('chrome', function(){
    return {
      on: function onMessage(channel, callback){
        chrome.runtime.onMessage.addListener(function chromeServiceOnMessage(message){
          if (message.channel === channel){
            callback(message.data);
          }
        });
      },
      message: function sendMessage(channel, values, done){
        chrome.runtime.sendMessage({ "channel": channel, "data": values }, done);
      },
      addListener: chrome.runtime.onMessage.addListener.bind(chrome.runtime.onMessage),
      getPreference: function getPreference(key, default_value){
        var value = localStorage.getItem(key);

        return typeof value !== undefined && value !== null ? value : (default_value || null);
      },
      getRedirectURL: chrome.identity.getRedirectURL.bind(chrome.identity),
      setPreference: function setPreference(key, value){
        localStorage.setItem(key, value);
      },
      getUrl: function getUrl(path){
        return chrome.runtime.getURL(path);
      },
      newTab: function newTab(url){
        chrome.tabs.create({
          url: url,
          active: true
        });
      }
    };
  });