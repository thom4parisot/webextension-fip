import browser from 'webextension-polyfill';

import Radio from '../lib/radio';
import Broadcast from '../lib/broadcast';
import Preferences from '../lib/preferences';

/**
 * Badge appearance and behavior on click.
 * Mainly tricking the fact the `onClicked` event is fired when no popup file is bound to the browserAction.
 * We basically display the popup when it's needed, so during the radio playback.
 *
 * @type {Object} Items containing badge behavior data
 */
const BADGE_STATES = {
  'stopped': {
    text: '',
    color: '#080'
  },
  'playing': {
    text: ">",
    color: '#080'
  },
  'buffering': {
    text: '~',
    color: '#fc0'
  },
  'errored': {
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
  constructor(){
    this.channel = process.env.BUILD_CHANNEL || "stable";
    this.preferences = new Preferences("localStorage");
  }

  /**
   * Factory constructor to build and initialize the process in a single line.
   *
   * @returns {Background}
   */
  static init() {
    const instance = new Background();

    instance.bootstrap();

    return instance;
  }

  /**
   * Bootstraping process
   *
   * @api
   */
  bootstrap() {
    this.radio = new Radio();

    this.setupChannelBadge();
    this.registerEvents();
    this.enableBroadcastUpdates();
  };

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
    fetch(`${Broadcast.getUri()}?_=${Date.now()}`)
      .then(response => response.json())
      .then(response => {
        const broadcasts = Broadcast.parseResponse(response);

        this.dispatchBroadcasts(broadcasts);
      });
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

      this.requestBroadcasts();
    });
  }

  /**
   * Dispatch some broadcasts to the whole app.
   *
   * @param {Array.<Broadcast>} broadcasts
   */
  dispatchBroadcasts(broadcasts) {
    const {preferences} = this;
    const bus = browser.runtime.connect();

    preferences.set('broadcasts', broadcasts);
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
