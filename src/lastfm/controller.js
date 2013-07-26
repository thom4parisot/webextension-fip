"use strict";

/* globals chrome, LastfmAPI */

function ScrobblingController(process){
  this.setupClient();
  this.setupEvents(process);
}

ScrobblingController.init = function init(process){
  var instance = new ScrobblingController(process);

  return instance;
};

ScrobblingController.prototype.setupClient = function setupClient(){
  var self = this;

  this.client = new LastfmAPI(process.preferences.get("lastfm.token"));

  chrome.runtime.onMessage.addListener(function(request){
    if (request.data && request.data.key === "lastfm.token"){
      self.client.session_key = request.data.value;
    }
  });
};

ScrobblingController.prototype.setupEvents = function setupClient(process){
  process.radio.on("playing", this.startScrobbling.bind(this));
  process.radio.on("stopped", this.stopScrobbling.bind(this));
};

ScrobblingController.prototype.startScrobbling = function startScrobbling(){
  if (!this.client.isConfigured()){
    return;
  }

  console.log("start scrobbling");
};

ScrobblingController.prototype.stopScrobbling = function startScrobbling(){
  if (!this.client.isConfigured()){
    return;
  }

  console.log("stop scrobbling");
};