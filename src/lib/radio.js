"use strict";

import machina from 'machina';

/**
 * Radio State Machine.
 * Handles the transitions from a state to another in a very clean way.
 *
 * @type {Radio}
 */
const Radio = machina.Fsm.extend({
  "initialState": "stopped",

  // Behavior config
  "playbackUrl": "https://direct.fipradio.fr/live/fip-midfi.mp3",
  //"playbackUrl": "https://direct.fipradio.fr/live/fip-lofi.mp3",
  //"playbackUrl": "https://direct.fipradio.fr/live/fip-webradio1.mp3",
  //"playbackUrl": "https://direct.fipradio.fr/live/fip-webradio2.mp3",
  //"playbackUrl": "https://direct.fipradio.fr/live/fip-webradio3.mp3",
  //"playbackUrl": "https://direct.fipradio.fr/live/fip-webradio4.mp3",
  //"playbackUrl": "https://direct.fipradio.fr/live/fip-webradio5.mp3",
  //"playbackUrl": "https://direct.fipradio.fr/live/fip-webradio6.mp3",
  //"playbackUrl": "https://direct.fipradio.fr/live/fip-webradio8.mp3",

  // It should be fine since this point
  "playbackObject": '',
  "initialize": function(){
    // publicly exposing audio states change
    this.on('transition', transition => {
      if (transition.fromState !== transition.toState){
        /* jshint devel:true */
        this.emit(transition.toState, transition);
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
        //this.playbackObject.play();
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

        //this.playbackObject.play();
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
   * Prepare the audio object to be played.
   * Also plugs events to drive the State Machine according to its internal events.
   *
   * @api
   */
  "preparePlaybackObject": function(){
    const audio = this.playbackObject || new Audio();

    audio.src = this.playbackUrl;
    audio.preload = false;
    audio.volume = 1;

    // the audio object is already constructed; don't need to go further
    if (this.playbackObject){
      return;
    }

    ['error', 'stalled', 'progress', 'waiting', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'durationchange', 'loadstart', 'emptied'].forEach(type => {
      audio.addEventListener(type, event => this.handle(`audio.${event.type}`));
    });

    this.playbackObject = audio;
  }
});

export default Radio;
