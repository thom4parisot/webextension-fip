"use strict";

/* global FIPRadio, chrome */

function Background(){}

Background.prototype.bootstrap = function bootstrap(){
  this.radio = new FIPRadio();

  this.registerEvents();
};

Background.prototype.registerEvents = function registerEvents(){
  var radio = this.radio;

  // @todo decouple this part
  chrome.browserAction.onClicked.addListener(function(){
    if (radio.isPlaying()){
      radio.stop();
      chrome.browserAction.setBadgeText({ text: '' });
    }
    else if (radio.isPaused()){
      radio.play();
      chrome.browserAction.setBadgeBackgroundColor({ color: '#080' });
      chrome.browserAction.setBadgeText({ text: '▶' });
    }
  });
};

Background.init = function init(){
  var instance = new Background();

  instance.bootstrap();

  return instance;
};