"use strict";

/**
 *
 * @constructor
 */
function FIPRadio(){
  /**
   *
   * @type {string}
   */
  this.url = "http://mp3.live.tv-radio.com/fip/all/fiphautdebit.mp3";

  /**
   *
   * @type {null}
   */
  this.audio = null;

  /**
   *
   * @type {FIPRadio.states}
   */
  this.state = FIPRadio.states.PAUSED;

  this._defineProperty("maxRetry", 3);
  this._defineProperty("retryTimeout", 150);  //in milliseconds
}

/**
 *
 */
FIPRadio.prototype.bootstrap = function bootstrap(){

};

FIPRadio.prototype._defineProperty = function _defineProperty(property, returned_value){
  Object.defineProperty(this, property, {
    get: typeof returned_value === "function" ? returned_value.bind(this) : function(){
      return returned_value;
    }
  });
};

/**
 *
 */
FIPRadio.prototype.configureAudio = function configureAudio(){
  var self = this;
  var audio = new Audio();

  audio.preload = "auto";
  audio.src = this.url;

  audio.addEventListener('error', function(e){
    /* jshint devel:true */
    console.log("An error occured.");
    console.dir(e);

    self.stop();
  });

  ['error', 'stalled', 'waiting', 'loadeddata', 'canplay', 'canplaythrough'].forEach(FIPRadio.logEvent.bind(this));
  ['durationchange', 'loadstart', 'emptied', 'play', 'pause'].forEach(FIPRadio.logEvent.bind(this));

  audio.load();

  this.audio = audio;
};

FIPRadio.prototype.isPlaying = function isPlaying(){
  return this.state === FIPRadio.states.PLAYING;
};

FIPRadio.prototype.isPaused = function isPaused(){
  return this.state === FIPRadio.states.PAUSED;
};

/**
 *
 */
FIPRadio.prototype.play = function play(){
  if (!this.audio){
    this.configureAudio();
  }

  this.audio.src = this.url;
  this.audio.play();
  this.state = FIPRadio.states.PLAYING;   //not really true, should be 'buffering' then async 'playing'
};

/**
 *
 */
FIPRadio.prototype.stop = function stop(){
  this.audio.pause();
  this.audio.src = '';
  this.state = FIPRadio.states.PAUSED;
};

FIPRadio.prototype.pause = FIPRadio.prototype.stop;

FIPRadio.logEvent = function logEvent(event){
  /* jshint devel:true */
  console.log("Audio Element State: %s", event.type);
};

/**
 *
 * @enum {String}
 */
FIPRadio.states = {
  "PAUSED": "paused",     //it should be stopped as we really stop the buffering
  "PLAYING": "playing",
  "ERROR": "error",
  "BUFFERING": "buffering"
};