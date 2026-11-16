import browser from 'webextension-polyfill';

import Radio, {states} from '../../lib/radio.js';

/**
 * Firefox resets its event page idle timer on any extension API call.
 * Pinging one more often than the 30 seconds timeout keeps the page, and its <audio>, alive.
 *
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=1844041
 */
const KEEP_ALIVE_INTERVAL = 20 * 1000;

/**
 * How the background controller plays the radio, whatever the browser.
 *
 * @typedef {Object} PlayerStrategy
 * @property {function(function(String))} onStateChange Calls the listener with the current state, then with each new one
 * @property {function()} play
 * @property {function()} stop
 * @property {function()} toggle
 * @property {function()} reload Restarts the stream, unless it is stopped
 * @property {function(String)} setUrl
 * @property {function(Number)} setVolume
 */

/**
 * Player strategy playing the stream from the background page itself.
 *
 * @implements {PlayerStrategy}
 */
export default class BackgroundStrategy {
  constructor () {
    this.radio = new Radio({ url: '' });

    this.onStateChange(state => this.keepAlive([states.PLAYING, states.BUFFERING].includes(state)));

    ['online', 'offline'].forEach(type => {
      window.addEventListener(type, () => this.radio.handle(`network.${type}`));
    });
  }

  /**
   * Calls `listener` with the current state, then on each state change.
   *
   * @param {Function} listener
   */
  onStateChange (listener) {
    listener(this.radio.state);
    this.radio.onTransition(({ toState }) => listener(toState));
  }

  play () {
    this.radio.play();
  }

  stop () {
    this.radio.stop();
  }

  toggle () {
    this.radio.toggle();
  }

  reload () {
    this.radio.reload();
  }

  setUrl (url) {
    this.radio.setPlaybackUrl(url);
  }

  setVolume (volume) {
    this.radio.setVolume(volume);
  }

  keepAlive (enabled) {
    clearInterval(this.keepAliveTimer);

    if (enabled) {
      this.keepAliveTimer = setInterval(() => browser.runtime.getPlatformInfo(), KEEP_ALIVE_INTERVAL);
    }
  }
}
