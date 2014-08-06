"use strict";

/* global Radio, chrome, _, Preferences, Broadcast */

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
 * Whitelist of actions doable by messaging the "action" channel.
 *
 * @type {Array}
 */
Background.actions = [
  "enableBroadcastUpdates"
];

/**
 * Bootstraping process
 *
 * @api
 */
Background.prototype.bootstrap = function bootstrap(){
  this.radio = new Radio();
  this.radio.volume(this.preferences.get("player.volume", 100));

  this.setupChannel();
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
  radio.on('playing', self.enableBroadcastUpdates.bind(self));
  chrome.runtime.onMessage.addListener(self.radioStateBadgeHandler.bind(self));
  chrome.runtime.onMessage.addListener(self.radioVolumeHandler.bind(self));
  chrome.runtime.onMessage.addListener(self.actionChannelHandler.bind(self));
  chrome.runtime.onMessage.addListener(self.preferenceChannelHandler.bind(self));

  // Handling `network.online` or `network.offline` states
  ['online', 'offline'].forEach(function(eventType){
    window.addEventListener(eventType, function handleNetworkEvent(event){
      radio.handle('network.' + event.type);
    });
  });

  chrome.alarms.onAlarm.addListener(function(alarm){
    if (alarm.name !== "broadcasts"){
      return;
    }

    self.requestBroadcasts();
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
 * Request broadcasts and do something afterwards.
 * Generally broadcasting the values to let them bubble everywhere.
 *
 * @param {Function=} done If not defined, will trigger the data in the "broadcasts" channel
 */
Background.prototype.requestBroadcasts = function requestBroadcasts(){
  var self = this;

  var xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.addEventListener("load", function broadcastHttpGetSuccess(response){
    var broadcasts = Broadcast.parseResponse(response.target.response);

    self.dispatchBroadcasts(broadcasts);
  });

  xhr.open("GET", Broadcast.defaultUri + "?_=" + Date.now());
  xhr.send();
};

/**
 * Handle any preferences request changes.
 *
 * @api
 * @param {Object} request
 */
Background.prototype.preferenceChannelHandler = function preferenceChannelHandler(request){
  if (request.channel === "preferences"){
    this.preferences.set(request.data.key, request.data.value);
  }
};

/**
 * Execute a local method execution based on a remote call.
 *
 * @api
 * @param {Object} request
 */
Background.prototype.actionChannelHandler = function actionChannelHandler(request){
  if (request.channel === "action" && ~Background.actions.indexOf(request.data)){
    this[request.data]();
  }
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
 * Enables broadcasting data collection.
 * It might not only happen on play as we could eventually display a view without playing the radio.
 *
 * Part of whitelist actions.
 */
Background.prototype.enableBroadcastUpdates = function enableBroadcastUpdates(){
  var alarmName = "broadcasts";
  var self = this;

  //workaround due to the `chrome.alarms.get` uncatchable exception bug
  //@see https://code.google.com/p/chromium/issues/detail?id=265800
  chrome.alarms.getAll(function(alarms){
    var exists = alarms.some(function(alarm){
      return alarm.name === alarmName;
    });

    if (!exists){
      chrome.alarms.create(alarmName, { periodInMinutes: 0.5 });
    }

    self.requestBroadcasts();
  });
};

/**
 * Dispatch some broadcasts to the whole app.
 *
 * @param {Array.<Broadcast>} broadcasts
 */
Background.prototype.dispatchBroadcasts = function dispatchRadioState(broadcasts){
  chrome.runtime.sendMessage({ channel: "broadcasts", data: broadcasts });
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
  if (!message.data || (message.channel !== "preferences" && message.data.key !== "player.volume")){
    return;
  }

  this.radio.volume(message.data.value);
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