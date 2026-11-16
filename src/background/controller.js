import browser from 'webextension-polyfill';

import debug from '../lib/debug.js';
import {states} from '../lib/radio.js';
import Steps from '../lib/steps.js';
import Preferences from '../lib/preferences.js';
import {getStationBroadcasts, getStationFeed} from '../lib/stations.js';

const LAST_FM_KEY = process.env.LAST_FM_KEY;


/**
 * Badge appearance and behavior on click.
 * Mainly tricking the fact the `onClicked` event is fired when no popup file is bound to the action.
 * We basically display the popup when it's needed, so during the radio playback.
 *
 * @type {Object} Items containing badge behavior data
 */
const BADGE_STATES = {
  [states.STOPPED]: {
    text: '',
    color: '#080'
  },
  [states.PLAYING]: {
    text: ">",
    color: '#080'
  },
  [states.BUFFERING]: {
    text: '~',
    color: '#fc0'
  },
  [states.ERRORED]: {
    text: '!',
    color: '#c00',
  }
};

/**
 * Background process handling the radio stuff
 *
 * @constructor
 * @param {Object} options
 * @param {typeof ScrobblingController} options.lastfm
 * @param {PlayerStrategy} options.player Plays the audio stream, depending on the browser capabilities
 */
export default class Background {
  constructor({ lastfm, player }){
    this.channel = process.env.BUILD_CHANNEL || "stable";
    this.preferences = new Preferences(browser.storage);
    this.ScrobblingController = lastfm;
    this.player = player;
  }

  /**
   * Factory constructor to build and initialize the process in a single line.
   *
   * @returns {Background}
   */
  static init(options) {
    const instance = new Background(options);

    // listeners are registered right away, to catch the event which woke the background up
    instance.ready = instance.preferences.ready().then(() => instance.bootstrap());
    instance.registerEvents();

    return instance;
  }

  /**
   * Bootstraping process, once preferences are loaded.
   *
   * @api
   */
  bootstrap() {
    const {preferences, player} = this;

    this.lastfm = this.ScrobblingController.init({ preferences });
    player.setUrl(this.getFeed());

    this.setupChannelBadge();
    // the popup has something to display, even when the radio is stopped
    this.requestBroadcasts();
  }

  /**
   * Runs `task` once the preferences are loaded.
   *
   * @param {Function} task
   */
  whenReady(task) {
    this.ready.then(() => task()).catch(debug);
  }

  /**
   * Event registration.
   * Mostly to control the Chrome UI according to the state of the radio.
   *
   * @api
   */
  registerEvents() {
    // Listening to radio events and dispatch them through the app
    this.player.onStateChange(state => {
      this.whenReady(() => {
        this.dispatchRadioState(state);
        this.updateBroadcastsAlarm(state);
      });
    });

    browser.runtime.onConnect.addListener(port => {
      port.onMessage.addListener(message => {
        this.whenReady(() => this.handleMessage(message));
      });
    });

    this.preferences.onChange(['playback.station', 'playback.quality'], () => {
      this.whenReady(() => this.reloadPlayback());
    });

    browser.alarms.onAlarm.addListener(alarm => {
      if (alarm.name === "broadcasts"){
        this.whenReady(() => this.requestBroadcasts());
      }
    });
  }

  /**
   * Dispatches a message received from the popup or the options page.
   *
   * @param {Object} message
   */
  handleMessage(message) {
    this.radioStateHandler(message);
    this.handleLastfmAuth(message);
  }

  /**
   * Request broadcasts and do something afterwards.
   * Generally broadcasting the values to let them bubble everywhere.
   */
  requestBroadcasts() {
    const {preferences} = this;
    const station = preferences.get('playback.station', 'fip-paris');

    return getStationBroadcasts(station)
      .then(response => Steps.getAll(response))
      .then(steps => {
        preferences.set('broadcasts', steps);

        return steps;
      })
      .then(steps => {
        this.dispatchBroadcasts(steps);
        this.lastfm.scrobble(steps);

        return steps;
      })
      .catch(debug);
  }

  /**
   * Spread a radio status through the app.
   *
   * @api
   * @param {String} state
   */
  dispatchRadioState(state) {
    const bus = browser.runtime.connect();
    const {preferences} = this;

    preferences.set('radio.state', state);
    this.radioStateBadgeHandler(state);
    bus.postMessage({ state });
  }

  /**
   * Refreshes the broadcasts while the radio plays only,
   * so the background page can sleep once the radio is stopped.
   *
   * @param {String} state
   */
  updateBroadcastsAlarm(state) {
    if (state === states.STOPPED) {
      browser.alarms.clear('broadcasts');
    }
    else {
      browser.alarms.create('broadcasts', { periodInMinutes: 0.5 });
    }
  }

  /**
   * Dispatch some broadcasts to the whole app.
   *
   * @param {Array.<Broadcast>} broadcasts
   */
  dispatchBroadcasts(broadcasts) {
    const bus = browser.runtime.connect();

    bus.postMessage({ broadcasts });
  }

  /**
   * Handles an app message and changes the badge accordingly.
   *
   * @api
   * @param {Object} message
   */
  radioStateBadgeHandler(newState) {
    Object.keys(BADGE_STATES).some(state => {
      if (newState !== state){
        return false;
      }

      const stateCase = BADGE_STATES[state];

      this.setBadge(stateCase.text, stateCase.color || '');

      return true;
    });
  }

  /**
   * Toggle the radio on or off
   *
   * @api
   * @param {Object} message
   */
  radioStateHandler(message) {
    if ('radio.toggle' in message){
      this.player.toggle();
    }

    if ('radio.play' in message){
      this.player.play();
    }

    if ('radio.volume' in message){
      const newVolume = parseFloat(message['radio.volume']);
      this.preferences.set('radio.volume', newVolume);
    }

    this.player.setVolume(this.preferences.get('radio.volume', 1));
  }

  /**
   * Stream of the station and quality saved in the preferences.
   *
   * @returns {String}
   */
  getFeed() {
    const {preferences} = this;

    return getStationFeed(preferences.get('playback.station', 'fip-paris'), preferences.get('playback.quality', 'hd'));
  }

  /**
   * Switches to the station and quality saved in the preferences.
   */
  reloadPlayback() {
    this.player.setUrl(this.getFeed());
    this.player.reload();
    this.requestBroadcasts();
  }

  handleLastfmAuth(message) {
    if ('lastfm.auth.request' in message) {
      const authUrl = message['lastfm.auth.request'];

      browser.identity.launchWebAuthFlow({
        interactive: true,
        url: `${authUrl}&api_key=${LAST_FM_KEY}`
      })
      .then(url => this.lastfm.handleAuthResponse(url))
      .catch(debug);
    }
  }

  /**
   * Change badge text and color, the easy way.
   *
   * @param {String} text
   * @param {String|Array=} color
   */
  setBadge(text, color) {
    browser.action.setBadgeText({ text: String(text) });

    if (color){
      browser.action.setBadgeBackgroundColor({ color });
    }
  }

  /**
   * Setting up channel data
   * Used only to distinguish stable extension from development.
   *
   * Basically it tries to load a file present only when we are not using the extension loading from the Store.
   */

  setupChannelBadge (){
    const iconName = `fip-${this.channel}`.replace('-stable', '');
    const path = {
      16: `/resources/${iconName}-16.png`,
      48: `/resources/${iconName}-48.png`,
      128: `/resources/${iconName}.png`,
    };

    browser.action.setIcon({ path });
    this.setBadge('');
  }
}
