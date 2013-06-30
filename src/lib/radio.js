"use strict";

/* globals machina */
/* exported Radio */

/**
 * Radio State Machine.
 * Handles the transitions from a state to another in a very clean way.
 *
 * @type {Radio}
 */
var Radio = machina.Fsm.extend({
  "initialState": "stopped",

  // Behavior config
  "playbackUrl": "http://mp3.live.tv-radio.com/fip/all/fiphautdebit.mp3",
  "playbackVolume": 100,

  // It should be fine since this point
  "playbackObject": '',
  "initialize": function(){
    var self = this;

    // publicly exposing audio states change
    self.on('transition', function transitionHandler(transition){
      if (transition.fromState !== transition.toState){
        /* jshint devel:true */
        self.emit(transition.toState, transition);
        console.log("State changed from '%s' to '%s'.", transition.fromState, transition.toState);
      }
    });
  },

  // State transitioning
  "states": {
    "playing": {
      stop: function stopOnPlaying(){
        this.transition('stopped');

        this.playbackObject.pause();
        this.playbackObject.src = '';
      },
      "audio.error": "errored",
      "audio.stalled": "buffering",
      "network.offline": "buffering"
    },
    "stopped": {
      play: function playOnStopped(){
        this.transition('buffering');

        this.preparePlaybackObject();
        this.playbackObject.play();
      }
    },
    "buffering": {
      stop: function stopOnBuffering(){
        this.transition('stopped');

        this.playbackObject.pause();
      },
      "audio.error": "errored",
      "audio.canplaythrough": "playing",
      "audio.stalled": "buffering",
      "network.offline": "buffering"
    },
    "errored": {
      play: function playOnErrored(){
        this.transition('buffering');

        this.playbackObject.play();
      },
      "stop": "stopped",
      "network.offline": "stopped"
    }
  },

  /**
   * Play the radio
   * @api
   */
  "play": function(){
    this.handle('play');
  },
  /**
   * Stop the radio
   * @api
   */
  "stop": function(){
    this.handle('stop');
  },
  /**
   * Blindly play or pause the audio
   * @api
   */
  "toggle": function(){
    //jshint expr:true
    this.state !== 'stopped' ? this.handle('stop') : this.handle('play');
  },
  /**
   * Volume management
   */
  "volume": function (value){
    if (value !== undefined){
      this.playbackVolume = parseInt(value, 10);

      if (this.audio){
        this.audio.volume = this.playbackVolume / 100;
      }
    }

    return this.playbackVolume;
  },

  /**
   * Prepare the audio object to be played.
   * Also plugs events to drive the State Machine according to its internal events.
   *
   * @api
   */
  "preparePlaybackObject": function(){
    var self = this;
    var audio = self.playbackObject || new Audio();

    audio.src = self.playbackUrl;
    audio.preload = false;
    audio.volume = self.playbackVolume / 100;

    // the audio object is already constructed; don't need to go further
    if (self.playbackObject){
      return;
    }

    ['error', 'stalled', 'progress', 'waiting', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'durationchange', 'loadstart', 'emptied'].forEach(function(type){
      audio.addEventListener(type, function logEvent(event){
        self.handle('audio.'+event.type);
      });
    });

    self.playbackObject = audio;
  }
});