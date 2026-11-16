import browser from 'webextension-polyfill';

import debug from '../../lib/debug.js';
import {states} from '../../lib/radio.js';

const PAGE_URL = browser.runtime.getURL('now-playing/index.html');

/**
 * Player strategy for Android: the browser only plays audio after a tap in the page which plays it,
 * so the now-playing page opens in a tab, instead of a popup, and plays the stream there.
 *
 * The radio keeps playing while browsing other tabs, and stops once its tab is closed.
 *
 * @implements {PlayerStrategy}
 */
export default class TabStrategy {
  constructor () {
    this.url = '';
    this.volume = 1;
    this.state = states.STOPPED;
    this.tabId = null;

    browser.action.setPopup({ popup: '' });
    browser.action.onClicked.addListener(() => this.showTab().catch(debug));
  }

  /**
   * Calls `listener` with the current state, then on each state change.
   *
   * @param {Function} listener
   */
  onStateChange (listener) {
    const update = state => {
      this.state = state;
      listener(state);
    };

    browser.runtime.onMessage.addListener((message, sender) => {
      if (message.target === 'background') {
        this.tabId = sender.tab?.id ?? this.tabId;
        update(message.state);
      }
    });

    browser.tabs.onRemoved.addListener(tabId => {
      if (tabId === this.tabId) {
        this.tabId = null;
        update(states.STOPPED);
      }
    });

    this.send('getState').then(state => update(state ?? states.STOPPED)).catch(debug);
  }

  /**
   * Starting needs a tap: the autoplay when opening the page is ignored.
   */
  play () {}

  stop () {
    this.send('stop').catch(debug);
  }

  /**
   * Sent right after the tap on the playback button, so the browser allows the tab to play.
   */
  toggle () {
    this.send('toggle').catch(debug);
  }

  reload () {
    this.send('reload').catch(debug);
  }

  setUrl (url) {
    this.url = url;
  }

  setVolume (volume) {
    this.volume = volume;
    this.send('setVolume').catch(debug);
  }

  hasTab () {
    return browser.extension.getViews({ type: 'tab' }).some(view => view.location.href === PAGE_URL);
  }

  showTab () {
    return this.tabId === null
      ? browser.tabs.create({ url: PAGE_URL })
      : browser.tabs.update(this.tabId, { active: true });
  }

  /**
   * Sends a command to the now-playing tab, with the current url and volume.
   *
   * @param {String} command
   * @returns {Promise.<Mixed>} Command result, `undefined` when the tab is closed
   */
  send (command) {
    const { url, volume } = this;

    return this.hasTab()
      ? browser.runtime.sendMessage({ target: 'tab', command, url, volume })
      : Promise.resolve();
  }
}
