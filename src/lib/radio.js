import { createFsm } from 'machina';
import {log} from './debug.js';

export const states = Object.freeze({
  STOPPED: 'STOPPED',
  PLAYING: 'PLAYING',
  BUFFERING: 'BUFFERING',
  STALLED: 'STALLED',
  ERRORED: 'ERRORED',
});

/**
 * <audio> events forwarded to the state machine, as `audio.<type>` inputs.
 */
const AUDIO_EVENTS = ['error', 'stalled', 'canplaythrough'];

/**
 * Radio playback, driven by a finite state machine.
 * Each state declares the inputs it reacts to, and the state they lead to.
 */
export default class Radio {
  constructor ({ url = '' } = {}) {
    this.playbackUrl = url;
    this.playbackObject = null;

    this.fsm = createFsm({
      id: 'radio',
      initialState: states.STOPPED,
      states: {
        [states.PLAYING]: {
          stop: () => {
            this.playbackObject.pause();
            this.playbackObject.src = '';

            return states.STOPPED;
          },
          "audio.error": states.ERRORED,
          "audio.stalled": states.BUFFERING,
          "network.offline": states.BUFFERING
        },
        [states.STOPPED]: {
          play: () => {
            this.playAudio();

            return states.BUFFERING;
          }
        },
        [states.BUFFERING]: {
          stop: () => {
            this.playbackObject.pause();

            return states.STOPPED;
          },
          "audio.error": states.ERRORED,
          "audio.canplaythrough": states.PLAYING,
          "audio.stalled": states.BUFFERING,
          "network.offline": states.BUFFERING
        },
        [states.ERRORED]: {
          play: () => {
            this.playAudio();

            return states.BUFFERING;
          },
          "stop": states.STOPPED,
          "network.offline": states.STOPPED
        }
      }
    });

    this.onTransition(({ fromState, toState }) => {
      log("State changed from '%s' to '%s'.", fromState, toState);
    });
  }

  get state () {
    return this.fsm.currentState();
  }

  /**
   * @param {Function} callback Receives `{ fromState, toState }` after each state change
   */
  onTransition (callback) {
    this.fsm.on('transitioned', callback);
  }

  /**
   * Sends an input to the state machine, such as `network.offline`.
   *
   * @param {String} input
   */
  handle (input) {
    this.fsm.handle(input);
  }

  /**
   * Play the radio
   * @api
   */
  play () {
    if (this.state !== states.PLAYING) {
      this.preparePlaybackObject();
    }

    this.handle('play');
  }

  /**
   * Reload the radio
   * @api
   */
  reload () {
    if (this.state !== states.STOPPED) {
      this.stop();
      this.play();
    }
  }

  /**
   * Stop the radio
   * @api
   */
  stop () {
    this.handle('stop');
  }

  /**
   * Blindly play or pause the audio
   * @api
   */
  toggle () {
    this.state !== states.STOPPED ? this.stop() : this.play();
  }

  /**
   * The browser may refuse to play (autoplay policy, unreachable stream).
   * A rejection caused by a `stop()` is ignored: `STOPPED` does not handle `audio.error`.
   */
  playAudio () {
    this.playbackObject.play().catch(() => this.handle('audio.error'));
  }

  /**
   * Prepare the audio object to be played.
   * Also plugs events to drive the State Machine according to its internal events.
   *
   * @api
   */
  preparePlaybackObject () {
    if (!this.playbackObject) {
      this.playbackObject = new Audio();

      AUDIO_EVENTS.forEach(type => {
        this.playbackObject.addEventListener(type, () => this.handle(`audio.${type}`));
      });
    }

    this.playbackObject.src = this.playbackUrl;
    this.playbackObject.preload = 'none';
  }

  setPlaybackUrl (url) {
    this.playbackUrl = url;
  }

  setVolume (newVolume) {
    if (this.playbackObject) {
      this.playbackObject.volume = newVolume;
    }
  }
}
