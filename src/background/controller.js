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

  // Listening to radio events and dispatch them through the app
  radio.on('transition', self.dispatchRadioState.bind(self));
  chrome.runtime.onMessage.addListener(self.radioStateBadgeHandler.bind(self));

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
 * Spread a radio status through the app.
 *
 * @api
 * @param {String} radioState
 */
Background.prototype.dispatchRadioState = function dispatchRadioState(transition){
  chrome.runtime.sendMessage({ state: transition.toState });
};

/**
 * Handles an app message and changes the badge accordingly.
 *
 * @api
 * @param {Object} message
 */
Background.prototype.radioStateBadgeHandler = function radioStateBadgeHandler(message){
  switch(message.state){
    case 'stopped':   this.setBadge(''); break;
    case 'playing':   this.setBadge('▶', '#080'); break;
    case 'buffering': this.setBadge('~', '#fc0'); break;
    case 'errored':   this.setBadge('!', '#c00'); break;
  }
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