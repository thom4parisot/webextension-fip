import Radio from '../lib/radio';
import Broadcast from '../lib/broadcast';
import Preferences from '../lib/preferences';

/**
 * Whitelist of actions doable by messaging the "action" channel.
 *
 * @type {Array}
 */
const BACKGROUND_ACTIONS = [
  "enableBroadcastUpdates"
];

/**
 * Badge appearance and behavior on click.
 * Mainly tricking the fact the `onClicked` event is fired when no popup file is bound to the browserAction.
 * We basically display the popup when it's needed, so during the radio playback.
 *
 * @type {Object} Items containing badge behavior data
 */
const BADGE_STATES = {
  'stopped': {
    text: "",
    popup: false
  },
  'playing': {
    text: ":-)",
    color: '#080'
  },
  'buffering': {
    text: '...',
    color: '#fc0'
  },
  'errored': {
    text: ':-/',
    color: '#c00',
    popup: false
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
    this.radio.volume(this.preferences.get("player.volume", 100));

    this.setupChannelBadge();
    this.registerEvents();
    this.registerNowPlayingPopup();
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
    radio.on('transition', this.dispatchRadioState.bind(this));
    radio.on('playing', this.enableBroadcastUpdates.bind(this));
    chrome.runtime.onMessage.addListener(this.radioStateBadgeHandler.bind(this));
    chrome.runtime.onMessage.addListener(this.radioVolumeHandler.bind(this));
    chrome.runtime.onMessage.addListener(this.radioStateHandler.bind(this));
    chrome.runtime.onMessage.addListener(this.radioToggleStateHandler.bind(this));
    chrome.runtime.onMessage.addListener(this.actionChannelHandler.bind(this));
    chrome.runtime.onMessage.addListener(this.preferenceChannelHandler.bind(this));

    // Handling `network.online` or `network.offline` states
    ['online', 'offline'].forEach(eventType => {
      window.addEventListener(eventType, event => radio.handle('network.' + event.type));
    });

    chrome.alarms.onAlarm.addListener(alarm => {
      if (alarm.name !== "broadcasts"){
        return;
      }

      this.requestBroadcasts();
    });
  }

  /**
   * Handles the click on the browser action icon.
   * By default, plays the radio, then displays the popup.
   *
   * The reason is because we first want to play the radio, not looking at what's on air.
   *
   * @api
   */
  registerNowPlayingPopup() {
    chrome.browserAction.onClicked.addListener(this.radio.play.bind(this.radio));
  }

  /**
   * Request broadcasts and do something afterwards.
   * Generally broadcasting the values to let them bubble everywhere.
   *
   * @param {Function=} done If not defined, will trigger the data in the "broadcasts" channel
   */
  requestBroadcasts() {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.addEventListener("load", response => {
      const broadcasts = Broadcast.parseResponse(response.target.response);

      this.dispatchBroadcasts(broadcasts);
    });

    xhr.open("GET", Broadcast.getUri() + "?_=" + Date.now());
    xhr.send();
  }

  /**
   * Handle any preferences request changes.
   *
   * @api
   * @param {Object} request
   */
  preferenceChannelHandler(request) {
    if (request.channel === "preferences"){
      this.preferences.set(request.data.key, request.data.value);
    }
  }

  /**
   * Execute a local method execution based on a remote call.
   *
   * @api
   * @param {Object} request
   */
  actionChannelHandler(request) {
    if (request.channel === "action" && BACKGROUND_ACTIONS.indexOf(request.data) !== -1){
      this[request.data]();
    }
  }

  /**
   * Spread a radio status through the app.
   *
   * @api
   * @param {String} radioState
   */
  dispatchRadioState(transition) {
    chrome.runtime.sendMessage({ state: transition.toState });
  }

  /**
   * Enables broadcasting data collection.
   * It might not only happen on play as we could eventually display a view without playing the radio.
   *
   * Part of whitelist actions.
   */
  enableBroadcastUpdates() {
    const alarmName = "broadcasts";

    //workaround due to the `chrome.alarms.get` uncatchable exception bug
    //@see https://code.google.com/p/chromium/issues/detail?id=265800
    chrome.alarms.getAll(alarms => {
      const exists = alarms.some(alarm => alarm.name === alarmName);

      if (!exists){
        chrome.alarms.create(alarmName, { periodInMinutes: 0.5 });
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
    chrome.runtime.sendMessage({ channel: "broadcasts", data: broadcasts });
  }

  /**
   * Handles an app message and changes the badge accordingly.
   *
   * @api
   * @param {Object} message
   */
  radioStateBadgeHandler(message) {
    if (!message.state){
      return;
    }

    Object.keys(BADGE_STATES).some(state => {
      if (message.state !== state){
        return false;
      }

      const stateCase = BADGE_STATES[state];

      chrome.browserAction.setPopup({
        popup: (stateCase.popup === false) ? '' : 'now-playing/popup.html'
      });

      this.setBadge(stateCase.text, stateCase.color || '');

      return true;
    });
  }

  /**
   * Returns relevant informations about the state of the current radio playback
   *
   * @api
   * @param {Object} message
   */
  radioStateHandler(message, sender, sendResponse) {
    if (message.channel === "radio.get"){
      sendResponse({
        volume: this.radio.volume(),
        state: this.radio.state
      });
    }
  }

  /**
   * Toggle the radio on or off
   *
   * @api
   * @param {Object} message
   */
  radioToggleStateHandler(message) {
    if (message.channel === "radio.toggle"){
      this.radio.toggle();
    }
  }

  /**
   * Handles any volume change request and adjust it accordingly.
   *
   * @api
   * @param {Object} message
   */
  radioVolumeHandler(message) {
    if (!message.data || (message.channel !== "preferences" && message.data.key !== "player.volume")){
      return;
    }

    this.radio.volume(message.data.value);
  }

  /**
   * Change badge text and color, the easy way.
   *
   * @param {String} text
   * @param {String|Array=} color
   */
  setBadge(text, color) {
    chrome.browserAction.setBadgeText({ text: text+'' });

    if (color){
      chrome.browserAction.setBadgeBackgroundColor({ color });
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
    const path = chrome.runtime.getURL(`resources/${iconName}.png`);

    chrome.browserAction.setIcon({ path });
    this.setBadge('');
  }
}
