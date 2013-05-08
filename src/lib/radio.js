"use strict";

/* globals machina */

/**
 * Radio State Machine.
 * Handles the transitions from a state to another in a very clean way.
 *
 * @type {Radio}
 */
//exported Radio
var Radio = machina.Fsm.extend({
  "initialState": "stopped",

  // Behavior config
  "playbackUrl": "http://mp3.live.tv-radio.com/fip/all/fiphautdebit.mp3",
  "maxRetry": 3,
  "retryTimeout": 150,

  // It should be fine since this point
  "playbackObject": null,
  "initialize": function(){
    var self = this;
    var audio = new Audio();
    audio.preload = false;

    audio.addEventListener('canplaythrough', function(){
      self.transition('playing');
    });

    this.playbackObject = audio;
  },

  // States Transitionning
  "states": {
    "playing": {
      stop: function(){
        this.transition('stopped');

        this.playbackObject.pause();
      }
    },
    "stopped": {
      play: function(){
        this.transition('buffering');

        this.playbackObject.src = this.playbackUrl;
        this.playbackObject.play();
      }
    },
    "buffering": {
      stop: function(){
        this.transition('stopped');

        this.playbackObject.pause();
      }
    },
    "errored": {
      play: function(){
        this.transition('buffering');

        this.playbackObject.play();
      }
    }
  },

  // Public API
  "play": function(){
    this.handle('play');
  },
  "stop": function(){
    this.handle('stop');
  },
  "toggle": function(){
    //jshint expr:true
    this.state !== 'stopped' ? this.handle('stop') : this.handle('play');
  }
});

/**
 *
 * @constructor
 */
function FIPRadio(){

}

/**
 *
 */
FIPRadio.prototype.bootstrap = function bootstrap(){
  this.configureAudio();
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
  var audio = new Audio();

  audio.preload = "auto";

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
  this.connectEvents();
  this.audio.src = this.url;
  this.audio.load();

  this.audio.play();
  this.state = FIPRadio.states.PLAYING;   //not really true, should be 'buffering' then async 'playing'
};

/**
 *
 */
FIPRadio.prototype.stop = function stop(){
  var self = this;

  this.audio.pause();
  this.state = FIPRadio.states.PAUSED;

  setTimeout(function(){
    self.disconnectEvents();
    self.audio.src = '';
  }, 100);
};

FIPRadio.prototype.pause = FIPRadio.prototype.stop;

FIPRadio.prototype.stopOnError = function stopOnError(){
  this.stop();
};

FIPRadio.prototype.logEvent = function logEvent(event){
  /* jshint devel:true */
  console.log("Audio Element State: %s", event.type);
};

FIPRadio.prototype.disconnectEvents = function disconnectEvents(){
  var self = this;
  var audio = self.audio;

  audio.removeEventListener('error', self.stopOnError);

  ['error', 'stalled', 'progress', 'waiting', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'durationchange', 'loadstart', 'emptied', 'play', 'pause'].forEach(function(type){
    audio.removeEventListener(type, self.logEvent);
  });
};

FIPRadio.prototype.connectEvents = function connectEvents(){
  var self = this;
  var audio = self.audio;

  audio.addEventListener('error', self.stopOnError);

  ['error', 'stalled', 'progress', 'waiting', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'durationchange', 'loadstart', 'emptied', 'play', 'pause'].forEach(function(type){
    audio.addEventListener(type, self.logEvent);
  });
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