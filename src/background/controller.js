"use strict";

/* global Radio, chrome */

/**
 * Background process handling the radio stuff
 *
 * @constructor
 */
function Background(){}

/**
 * Bootstraping process
 *
 * @api
 */
Background.prototype.bootstrap = function bootstrap(){
  this.radio = new Radio();

  this.registerEvents();
  this.registerNowPlayingPopup();
};

/**
 * Event registration.
 * Mostly to control the Chrome UI according to the state of the radio.
 *
 * @api
 */
Background.prototype.registerEvents = function registerEvents(){
  var self = this;
  var radio = this.radio;

  radio.on('stopped', function(){     self.setBadge('');          });
  radio.on('playing', function(){     self.setBadge('▶', '#080'); });
  radio.on('buffering', function(){   self.setBadge('~', '#fc0'); });
  radio.on('errored', function(){     self.setBadge('!', '#c00'); });

  // Handling `network.online` or `network.offline` states
  ['online', 'offline'].forEach(function(eventType){
    window.addEventListener(eventType, function handleNetworkEvent(event){
      radio.handle('network.' + event.type);
    });
  });
};

/**
 * Handles the click on the browser action icon.
 * By default, plays the radio, then displays the popup.
 *
 * The reason is because we first want to play the radio, not looking at what's on air.
 *
 * @api
 */
Background.prototype.registerNowPlayingPopup = function registerNowPlayingPopup(){
  chrome.browserAction.onClicked.addListener(this.radio.play.bind(this.radio));

  chrome.browserAction.onClicked.addListener(function(){
    chrome.browserAction.setPopup({ popup: 'now-playing/popup.html' });
  });
};

/**
 * Change badge text and color, the easy way.
 *
 * @param {String} text
 * @param {String|Array=} color
 */
Background.prototype.setBadge = function setBadge(text, color){
  chrome.browserAction.setBadgeText({ text: text+'' });

  if (color){
    chrome.browserAction.setBadgeBackgroundColor({ color: color });
  }
};

/**
 * Factory constructor to build and initialize the process in a single line.
 *
 * @returns {Background}
 */
Background.init = function init(){
  var instance = new Background();

  instance.bootstrap();

  return instance;
};