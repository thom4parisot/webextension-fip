import debug from '../../lib/debug.js';
import {states} from '../../lib/radio.js';

const DOCUMENT_URL = 'players/offscreen/index.html';

/**
 * Player strategy for Chrome: a service worker cannot play audio,
 * so the stream plays in an offscreen document driven by messages.
 *
 * Chrome closes the offscreen document by itself once the audio stops for 30 seconds.
 *
 * @implements {PlayerStrategy}
 */
export default class OffscreenStrategy {
  constructor () {
    this.url = '';
    this.volume = 1;
  }

  /**
   * Calls `listener` with the current state, then on each state change.
   *
   * @param {Function} listener
   */
  onStateChange (listener) {
    chrome.runtime.onMessage.addListener(message => {
      if (message.target === 'background') {
        listener(message.state);
      }
    });

    this.getState().then(listener).catch(debug);
  }

  /**
   * @returns {Promise.<String>} STOPPED when the offscreen document is closed
   */
  getState () {
    return this.send('getState', { create: false }).then(state => state ?? states.STOPPED);
  }

  play () {
    this.send('play').catch(debug);
  }

  stop () {
    this.send('stop', { create: false }).catch(debug);
  }

  toggle () {
    this.send('toggle').catch(debug);
  }

  reload () {
    this.send('reload', { create: false }).catch(debug);
  }

  setUrl (url) {
    this.url = url;
  }

  setVolume (volume) {
    this.volume = volume;
    this.send('setVolume', { create: false }).catch(debug);
  }

  /**
   * Sends a command to the offscreen document, with the current url and volume.
   * The document may have been closed since, so it does not keep them.
   *
   * @param {String} command
   * @param {Object} options
   * @param {Boolean} options.create Opens the document when it is closed; otherwise the command is dropped
   * @returns {Promise.<Mixed>} Command result, `undefined` when dropped
   */
  send (command, { create = true } = {}) {
    const { url, volume } = this;

    return (create ? this.openDocument() : this.hasDocument())
      .then(isOpen => isOpen ? chrome.runtime.sendMessage({ target: 'offscreen', command, url, volume }) : undefined);
  }

  hasDocument () {
    return chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [chrome.runtime.getURL(DOCUMENT_URL)],
    })
    .then(contexts => contexts.length > 0);
  }

  /**
   * Opens the offscreen document, once, even when called several times in a row.
   *
   * @returns {Promise.<Boolean>}
   */
  openDocument () {
    this.opening ??= this.hasDocument()
      .then(isOpen => isOpen || chrome.offscreen.createDocument({
        url: DOCUMENT_URL,
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Plays the FIP radio stream.',
      }))
      .then(() => true)
      .finally(() => { this.opening = null; });

    return this.opening;
  }
}
