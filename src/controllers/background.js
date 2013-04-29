"use strict";

/* global FIPRadio, chrome */

function Background(){}

Background.prototype.bootstrap = function bootstrap(){
  this.radio = new FIPRadio();
  this.radio.bootstrap();

  this.registerEvents();
};

Background.prototype.registerEvents = function registerEvents(){
  var radio = this.radio;

  radio.audio.addEventListener("pause", function(){
    chrome.browserAction.setBadgeText({ text: '' });
  });
  radio.audio.addEventListener("canplaythrough", function(){
    chrome.browserAction.setBadgeBackgroundColor({ color: '#080' });
    chrome.browserAction.setBadgeText({ text: '▶' });
  });
  radio.audio.addEventListener("play", function(){
    chrome.browserAction.setBadgeBackgroundColor({ color: '#fc0' });
    chrome.browserAction.setBadgeText({ text: '~' });
  });
  radio.audio.addEventListener("stalled", function(){
    chrome.browserAction.setBadgeBackgroundColor({ color: '#fc0' });
    chrome.browserAction.setBadgeText({ text: '~' });
  });
  radio.audio.addEventListener("error", function(){
    if (radio.isPaused()){
      return;
    }

    chrome.browserAction.setBadgeBackgroundColor({ color: '#c00' });
    chrome.browserAction.setBadgeText({ text: '!' });
  });

  // @todo do a toggle and let the radio determine what to do
  chrome.browserAction.onClicked.addListener(function(){
    if (radio.isPlaying()){
      radio.stop();
    }
    else if (radio.isPaused()){
      radio.play();
    }
  });
};

Background.init = function init(){
  var instance = new Background();

  instance.bootstrap();

  return instance;
};