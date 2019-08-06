import machina from 'machina';
import {log} from './debug.js';

export const states = Object.freeze({
  STOPPED: 'STOPPED',
  PLAYING: 'PLAYING',
  BUFFERING: 'BUFFERING',
  ERRORED: 'ERRORED',
});

/**
 * Radio State Machine.
 * Handles the transitions from a state to another in a very clean way.
 *
 * @type {Radio}
 */
const Radio = machina.Fsm.extend({
  "initialState": states.STOPPED,

  // Behavior config
  "playbackUrl": '',

  // It should be fine since this point
  "playbackObject": '',
  "initialize": function({ url }){
    this.setPlaybackUrl(url);

    // publicly exposing audio states change
    this.on('transition', transition => {
      if (transition.fromState !== transition.toState){
        /* jshint devel:true */
        this.emit(transition.toState, transition);
        log("State changed from '%s' to '%s'.", transition.fromState, transition.toState);
      }
    });
  },

  // State transitioning
  "states": {
    [states.PLAYING]: {
      stop: function stopOnPlaying(){
        this.transition(states.STOPPED);

        this.playbackObject.pause();
        this.playbackObject.src = '';
      },
      "audio.error": states.ERRORED,
      "audio.stalled": states.BUFFERING,
      "network.offline": states.BUFFERING
    },
    [states.STOPPED]: {
      play: function playOnStopped(){
        this.transition(states.BUFFERING);

        this.playbackObject.play();
      }
    },
    [states.BUFFERING]: {
      stop: function stopOnBuffering(){
        this.transition(states.STOPPED);

        this.playbackObject.pause();
      },
      "audio.error": states.ERRORED,
      "audio.canplaythrough": states.PLAYING,
      "audio.stalled": states.BUFFERING,
      "network.offline": states.BUFFERING
    },
    [states.ERRORED]: {
      play: function playOnErrored(){
        this.transition(states.BUFFERING);

        this.playbackObject.play();
      },
      "stop": states.STOPPED,
      "network.offline": states.STOPPED
    }
  },

  /**
   * Play the radio
   * @api
   */
  "play": function(){
    if (this.state !== 'playing') {
      this.preparePlaybackObject();
    }

    this.handle('play');
  },
  /**
   * Reload the radio
   * @api
   */
  "reload": function(){
    if (this.state !== states.STOPPED) {
      this.stop();
      this.play();
    }
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
    this.state !== states.STOPPED ? this.stop() : this.play();
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

    // the audio object is already constructed; don't need to go further
    if (this.playbackObject){
      return;
    }

    ['error', 'stalled', 'progress', 'waiting', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'durationchange', 'loadstart', 'emptied'].forEach(type => {
      audio.addEventListener(type, event => this.handle(`audio.${event.type}`));
    });

    this.playbackObject = audio;
  },

  "setPlaybackUrl": function(url){
    this.playbackUrl = url;
  },

  "setVolume": function(newVolume) {
    if (this.playbackObject) {
      this.playbackObject.volume = newVolume;
    }
  }
});

export default Radio;
