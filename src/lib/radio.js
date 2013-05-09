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
  "maxRetry": 3,
  "retryTimeout": 150,

  // It should be fine since this point
  "playbackObject": '',
  "initialize": function(){
    var self = this;

    // publicly exposing audio states change
    self.on('transition', function transitionHandler(transition){
      if (transition.fromState !== transition.toState){
        self.emit(transition.toState, transition);
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
      error: "errored"
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
      error: "errored"
    },
    "errored": {
      play: function playOnErrored(){
        this.transition('buffering');

        this.playbackObject.play();
      }
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

    // the audio object is already constructed; don't need to go further
    if (self.playbackObject){
      return;
    }

    audio.addEventListener('canplaythrough', function(){
      self.transition('playing');
    });

    audio.addEventListener('stalled', function(){
      self.handle('buffer');
    });

    audio.addEventListener('error', function(){
      self.handle('error');
    });

    ['error', 'stalled', 'waiting', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'durationchange', 'loadstart', 'emptied', 'play', 'pause'].forEach(function(type){
      audio.addEventListener(type, function logEvent(event){
        /* jshint devel:true */
        console.log("Audio Element State: %s", event.type);
      });
    });

    self.playbackObject = audio;
  }
});