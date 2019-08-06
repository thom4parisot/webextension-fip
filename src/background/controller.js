import browser from 'webextension-polyfill';

import debug from '../lib/debug.js';
import Radio, {states} from '../lib/radio.js';
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
 */
export default class Background {
  constructor({ lastfm }){
    this.channel = process.env.BUILD_CHANNEL || "stable";
    this.preferences = new Preferences("localStorage");
    this.lastfm = lastfm.init({ preferences: this.preferences });
  }

  /**
   * Factory constructor to build and initialize the process in a single line.
   *
   * @returns {Background}
   */
  static init(options) {
    const instance = new Background(options);

    instance.bootstrap(options);

    return instance;
  }

  /**
   * Bootstraping process
   *
   * @api
   */
  bootstrap() {
    const {preferences} = this;

    const station = preferences.get('playback.station', 'fip-paris');
    const quality = preferences.get('playback.quality', 'hd');

    this.radio = new Radio({ url: getStationFeed(station, quality) });
    preferences.set('radio.state', this.radio.state);

    this.setupChannelBadge();
    this.registerEvents();
    this.enableBroadcastUpdates();
  }

  /**
   * Event registration.
   * Mostly to control the Chrome UI according to the state of the radio.
   *
   * @api
   */
  registerEvents() {
    const { radio } = this;

    // Listening to radio events and dispatch them through the app
    radio.on('transition', transition => {
      this.dispatchRadioState(transition);
    });

    // Debug Messages
    browser.runtime.onConnect.addListener(port => {
      port.onMessage.addListener(message => {
        this.radioStateHandler(message);
      });

      port.onMessage.addListener(message => {
        this.handlePlaybackChanges(message);
      });

      port.onMessage.addListener(message => {
        this.handleLastfmAuth(message);
      });
    });

    // Handling `network.online` or `network.offline` states
    ['online', 'offline'].forEach(eventType => {
      window.addEventListener(eventType, event => radio.handle('network.' + event.type));
    });

    browser.alarms.onAlarm.addListener(alarm => {
      if (alarm.name === "broadcasts"){
        this.requestBroadcasts();
      }
    });
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
   * @param {String} radioState
   */
  dispatchRadioState(transition) {
    const bus = browser.runtime.connect();
    const {preferences} = this;
    const state = transition.toState;

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
      this.radio.toggle();
    }

    if ('radio.play' in message){
      this.radio.play();
    }

    if ('radio.volume' in message){
      const newVolume = parseFloat(message['radio.volume']);
      this.preferences.set('radio.volume', newVolume);
    }

    this.radio.setVolume(this.preferences.get('radio.volume', 1));
  }

  handlePlaybackChanges(message) {
    if ('playback.reload' in message) {
      const {preferences} = this;

      const station = preferences.get('playback.station');
      const quality = preferences.get('playback.quality');
      this.radio.setPlaybackUrl(getStationFeed(station, quality));
      this.radio.reload();
      this.requestBroadcasts();
    }
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
