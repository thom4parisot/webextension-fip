import browser from 'webextension-polyfill';

import debug from '../lib/debug.js';
import {states} from '../lib/radio.js';
import Steps from '../lib/steps.js';
import Preferences from '../lib/preferences.js';
import {getStationBroadcasts, getStationFeed} from '../lib/stations.js';

/*
 "Securely" provided by .travis.yml + envify transform
 */
const LAST_FM_KEY = process.env.LAST_FM_KEY;


/**
 * Badge appearance and behavior on click.
 * Mainly tricking the fact the `onClicked` event is fired when no popup file is bound to the browserAction.
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
 * @param {PlayerStrategy} options.player Plays the audio stream, depending on the browser capabilities
 */
export default class Background {
  constructor({ player }){
    this.channel = process.env.BUILD_CHANNEL || "stable";
    this.preferences = new Preferences(browser.storage);
    this.player = player;
  }

  /**
   * Factory constructor to build and initialize the process in a single line.
   *
   * @returns {Background}
   */
  static init(options) {
    const instance = new Background(options);

    // listeners are registered right away, to catch the event which woke the background page up
    instance.registerEvents();
    instance.ready = instance.preferences.ready().then(() => instance.bootstrap(options));

    return instance;
  }

  /**
   * Bootstraping process, once preferences are loaded.
   *
   * @api
   * @param {Object} options
   * @param {ScrobblingController} options.lastfm
   */
  bootstrap({ lastfm }) {
    const {preferences, player} = this;

    const station = preferences.get('playback.station', 'fip-paris');
    const quality = preferences.get('playback.quality', 'hd');

    this.lastfm = lastfm.init({ preferences });
    player.setUrl(getStationFeed(station, quality));
    preferences.set('radio.state', player.state);

    this.setupChannelBadge();
    this.enableBroadcastUpdates();
    this.requestBroadcasts();
  }

  /**
   * Event registration.
   * Mostly to control the Chrome UI according to the state of the radio.
   *
   * @api
   */
  registerEvents() {
    // Listening to radio events and dispatch them through the app
    this.player.onStateChange(state => this.dispatchRadioState(state));

    browser.runtime.onConnect.addListener(port => {
      port.onMessage.addListener(message => {
        this.ready.then(() => this.handleMessage(message)).catch(debug);
      });
    });

    this.preferences.onChange(['playback.station', 'playback.quality'], () => {
      this.ready.then(() => this.reloadPlayback()).catch(debug);
    });

    browser.alarms.onAlarm.addListener(alarm => {
      if (alarm.name === "broadcasts"){
        this.ready.then(() => this.requestBroadcasts()).catch(debug);
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
   *
   * @param {Function=} done If not defined, will trigger the data in the "broadcasts" channel
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
   * Enables broadcasting data collection.
   * It might not only happen on play as we could eventually display a view without playing the radio.
   *
   * Part of whitelist actions.
   */
  enableBroadcastUpdates() {
    const alarmName = "broadcasts";

    //workaround due to the `browser.alarms.get` uncatchable exception bug
    //@see https://code.google.com/p/chromium/issues/detail?id=265800
    browser.alarms.getAll().then(alarms => {
      const exists = alarms.some(alarm => alarm.name === alarmName);

      if (!exists){
        browser.alarms.create(alarmName, { periodInMinutes: 0.5 });
      }

      return this.requestBroadcasts();
    }).catch(debug);
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
   * Switches to the station and quality saved in the preferences.
   */
  reloadPlayback() {
    const {preferences} = this;

    const station = preferences.get('playback.station', 'fip-paris');
    const quality = preferences.get('playback.quality', 'hd');
    this.player.setUrl(getStationFeed(station, quality));
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
    browser.browserAction.setBadgeText({ text: String(text) });

    if (color){
      browser.browserAction.setBadgeBackgroundColor({ color });
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
    const path = `/resources/${iconName}.png`;

    browser.browserAction.setIcon({ path });
    this.setBadge('');
  }
}
