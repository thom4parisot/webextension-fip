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
};

/**
 * Event registration.
 * Mostly to control the Chrome UI according to the state of the radio.
 *
 * @api
 */
Background.prototype.registerEvents = function registerEvents(){
  var radio = this.radio;

  radio.on('stopped', function(){
    chrome.browserAction.setBadgeText({ text: '' });
  });

  radio.on('playing', function(){
    chrome.browserAction.setBadgeBackgroundColor({ color: '#080' });
    chrome.browserAction.setBadgeText({ text: '▶' });
  });

  radio.on('buffering', function(){
    chrome.browserAction.setBadgeBackgroundColor({ color: '#fc0' });
    chrome.browserAction.setBadgeText({ text: '~' });
  });

  radio.on('errored', function(){
    chrome.browserAction.setBadgeBackgroundColor({ color: '#c00' });
    chrome.browserAction.setBadgeText({ text: '!' });
  });

  chrome.browserAction.onClicked.addListener( radio.toggle.bind(radio) );
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