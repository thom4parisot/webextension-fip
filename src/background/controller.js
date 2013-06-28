"use strict";

/* global Radio, chrome, _, Preferences */

/**
 * Background process handling the radio stuff
 *
 * @constructor
 */
function Background(){
  this.channel = "stable";
  this.preferences = new Preferences("localStorage");
}

/**
 * Bootstraping process
 *
 * @api
 */
Background.prototype.bootstrap = function bootstrap(){
  this.radio = new Radio();

  this.setupChannel();
  this.registerEvents();
  this.registerPreferencesHandler();
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
  chrome.runtime.onMessage.addListener(self.radioVolumeHandler.bind(self));

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
};

/**
 * Handle any preferences request changes.
 */
Background.prototype.registerPreferencesHandler = function registerPreferencesHandler(){
  var self = this;

  chrome.runtime.onMessage.addListener(function(request){
    if (request.channel === "preferences"){
      self.preferences.set(request.data.key, request.data.value);
    }
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
  if (!message.state){
    return;
  }

  var self = this;

  Object.keys(Background.badgeStates).some(function(state){
    if (message.state !== state){
      return false;
    }

    var stateCase = Background.badgeStates[state];

    chrome.browserAction.setPopup({
      popup: (stateCase.popup === false) ? '' : 'now-playing/popup.html'
    });

    self.setBadge(stateCase.text, stateCase.color || '');

    return true;
  });
};

/**
 * Handles any volume change request and adjust it accordingly.
 *
 * @api
 * @param {Object} message
 */
Background.prototype.radioVolumeHandler = function radioVolumeHandler(message){
  if (message.channel !== "preferences" && message.data.key !== "player.volume"){
    return;
  }

  this.radio.playbackObject.volume = message.data.value / 100;
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
 * Setting up channel data
 * Used only to distinguish stable extension from development.
 *
 * Basically it tries to load a file present only when we are not using the extension loading from the Store.
 */
Background.prototype.setupChannel = function setupChannel(){
  var self = this;
  var request = new XMLHttpRequest();

  request.open("GET", chrome.extension.getURL("channel.json"));
  request.addEventListener("load", function(event){
    try{
      _.assign(self, JSON.parse(event.target.responseText));

      self.setupChannelBadge();
    }
    catch(e){}
  });

  request.send();
};

Background.prototype.setupChannelBadge = function setupChannelBadge(){
  var src = "resources/fip-%channel%.png".replace("%channel%", this.channel).replace("-stable", "");

  chrome.browserAction.setIcon({
    "path": chrome.extension.getURL(src)
  });
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

/**
 * Badge appearance and behavior on click.
 * Mainly tricking the fact the `onClicked` event is fired when no popup file is bound to the browserAction.
 * We basically display the popup when it's needed, so during the radio playback.
 *
 * @type {Object} Items containing badge behavior data
 */
Background.badgeStates = {
  'stopped': {
    text: '',
    popup: false
  },
  'playing': {
    text: '▶',
    color: '#080'
  },
  'buffering': {
    text: '~',
    color: '#fc0'
  },
  'errored': {
    text: '!',
    color: '#c00',
    popup: false
  }
};