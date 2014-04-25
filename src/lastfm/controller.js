"use strict";

/* globals chrome, LastfmAPI, Broadcast, TextCleaner */

function ScrobblingController(process) {
  this.previousBroadcast = new Broadcast();

  this.setupClient(process);
  this.setupEvents(process);
}

ScrobblingController.init = function init(process) {
  var instance = new ScrobblingController(process);

  return instance;
};

ScrobblingController.prototype.setupClient = function setupClient(process) {
  this.client = new LastfmAPI(process.preferences.get("lastfm.token"));
};

ScrobblingController.prototype.updateUserInfos = function updateUserInfos(process, token){
  var self = this;

  this.client.getSessionKey(token, function (data) {
    self.client.session_key = data.sessionKey;

    process.preferences.set("lastfm.token", data.sessionKey);
    process.preferences.set("lastfm.username", data.userName);
    process.preferences.set("lastfm.scrobbling", true);

    chrome.runtime.sendMessage({ "channel": "lastfm.auth.success", "data": data });
  });
};

ScrobblingController.prototype.setupEvents = function setupClient(process) {
  var self = this;

  chrome.runtime.onMessage.addListener(function (request) {
    if (request.channel === "broadcasts" && process.radio.state === "playing") {
      var current = Broadcast.getCurrent(request.data);

      self.processNowPlaying(current);
      self.processScrobbling(current);

      if (current && current.title !== self.previousBroadcast.title) {
        self.previousBroadcast = current;
      }
    }
  });

  chrome.runtime.onMessage.addListener(function(request){
    if (request.channel === "lastfm.auth.response" && request.data){
      var token = null;

      request.data.replace(/token=([a-z0-9]{32})/, function(m, value){
        token = value;
      });

      if (token){
        self.updateUserInfos(process, token);
      }
    }
  });

  chrome.runtime.onMessage.addListener(function(request){
    if (request.channel === "lastfm.auth.request" && request.data) {
      chrome.identity.launchWebAuthFlow({
        interactive: true,
        url: request.data
      }, self.handleAuthResponse.bind(self, process));
    }
  });
};

ScrobblingController.prototype.handleAuthResponse = function(process, url){
  var token = null;

  url.replace(/token=([a-z0-9]{32})/, function(m, value){
    token = value;
  });

  if (token){
    this.updateUserInfos(process, token);
  }
};

ScrobblingController.prototype.processNowPlaying = function processNowPlaying(current) {
  if (!this.client.isConfigured() || !current instanceof Broadcast) {
    return;
  }

  var previous = this.previousBroadcast;

  if (current && current.artist && current.title !== previous.title && current.artist !== previous.artist) {
    this.client.nowPlaying({
      artist: TextCleaner.getMainArtistName(current.artist),
      track: TextCleaner.doTrackTitle(current.title)
    });
  }
};

ScrobblingController.prototype.processScrobbling = function processScrobbling(current) {
  if (!this.client.isConfigured() || !current instanceof Broadcast) {
    return;
  }

  var previous = this.previousBroadcast;

  if (current && previous.artist && current.title !== previous.title && current.artist !== previous.artist) {
    this.client.scrobble({
      artist: TextCleaner.getMainArtistName(previous.artist),
      track: TextCleaner.doTrackTitle(previous.title),
      when: Date.now() - 120 * 1000 // let's pretend we listened to it 2 minutes ago
    });
  }
};
