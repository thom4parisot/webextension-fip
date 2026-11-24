import debug from '../lib/debug.js';
import { LastfmError } from '../lib/lastfm.js';
import { artistOf, trackKey } from '../lib/steps.js';

/** @typedef {import('../lib/lastfm.js').ScrobblingTrack} ScrobblingTrack */

/**
 * Whether the user loves a track.
 *
 * @typedef {Object} LoveState
 * @property {Boolean} loved State shown to the user
 * @property {Boolean=} confirmed State last confirmed by Last.fm; undefined until Last.fm confirms a first one
 * @property {Number} updatedAt Last change, in milliseconds
 */

/**
 * How long we trust a loved state, before asking Last.fm again.
 */
export const LOVED_TTL = 7 * 24 * 60 * 60 * 1000;

const MAX_STATES = 200;

/**
 * A state is pending until Last.fm confirms it.
 *
 * @param {LoveState} state
 * @returns {Boolean}
 */
const isPending = state => state.loved !== state.confirmed;

/**
 * A pending state is always fresh: it must reach Last.fm, whatever its age.
 *
 * @param {LoveState} state
 * @returns {Boolean}
 */
const isFresh = state => isPending(state) || Date.now() - state.updatedAt < LOVED_TTL;

/**
 * Loved tracks, cached in the `scrobbling.loved` preference.
 *
 * User actions update the cache right away, then are sent to Last.fm in the background.
 * Last.fm is only asked about tracks missing from the cache, or not checked for a week.
 */
export default class LovedTracks {
  /**
   * @param {Object} options
   * @param {Preferences} options.preferences
   * @param {LastfmAPI} options.client
   */
  constructor ({ preferences, client }) {
    this.preferences = preferences;
    this.client = client;
    this.syncing = Promise.resolve();
  }

  /**
   * Love states, by track key (see `trackKey()`).
   *
   * @returns {Object.<String, ScrobblingTrack & LoveState>}
   */
  get states () {
    return this.preferences.get('scrobbling.loved', {});
  }

  love (step) {
    return this.toggle(step, true);
  }

  unlove (step) {
    return this.toggle(step, false);
  }

  toggle (step, loved) {
    const key = trackKey(step);

    this.saveState(key, { artist: artistOf(step), track: step.title, loved, confirmed: this.states[key]?.confirmed });

    return this.flush();
  }

  /**
   * Asks Last.fm whether the user loves the tracks missing from the cache.
   *
   * @param {Array.<Step>} steps
   * @returns {Promise}
   */
  lookup (steps) {
    const username = this.preferences.get('lastfm.username');

    if (!this.client.isConfigured() || !username) {
      return Promise.resolve();
    }

    return steps
      .filter(step => step.authors && !this.isKnown(step))
      .reduce((previous, step) => previous
        .then(() => this.client.isLoved({ artist: artistOf(step), track: step.title, username }))
        .then(loved => this.remember(step, loved))
        // a track unknown to Last.fm cannot be loved: no need to ask again before the TTL
        .catch(error => error instanceof LastfmError ? this.remember(step, false) : debug(error)), Promise.resolve());
  }

  /**
   * Saves the state told by Last.fm, unless the user changed it in the meantime.
   *
   * @param {Step} step
   * @param {Boolean} loved State told by Last.fm
   */
  remember (step, loved) {
    if (!this.isKnown(step)) {
      this.saveState(trackKey(step), { artist: artistOf(step), track: step.title, loved, confirmed: loved });
    }
  }

  isKnown (step) {
    const state = this.states[trackKey(step)];

    return Boolean(state) && isFresh(state);
  }

  /**
   * Sends the pending states to Last.fm, one flush after the other.
   *
   * @returns {Promise}
   */
  flush () {
    this.syncing = this.syncing.then(() => this.sync());

    return this.syncing;
  }

  /**
   * Sends each pending state to Last.fm, one request after the other.
   *
   * - accepted: the state is confirmed as it is;
   * - refused by Last.fm (`LastfmError`): the state goes back to the confirmed one;
   * - network failure: the state stays pending, until the next flush.
   *
   * States are read when the sync starts: a click made meanwhile waits for the next flush.
   *
   * @returns {Promise}
   */
  sync () {
    if (!this.client.isConfigured()) {
      return Promise.resolve();
    }

    return Object.entries(this.states)
      .filter(([, state]) => isPending(state))
      .reduce((previous, [key, { artist, track, loved }]) => previous
        .then(() => loved ? this.client.love({ artist, track }) : this.client.unlove({ artist, track }))
        .then(() => this.updateState(key, { confirmed: loved }))
        .catch(error => error instanceof LastfmError ? this.revertState(key) : debug(error)), Promise.resolve());
  }

  /**
   * Changes some values of a cached state; nothing happens when the state is gone.
   *
   * @param {String} key Track key
   * @param {Partial<LoveState>} values
   */
  updateState (key, values) {
    const state = this.states[key];

    if (state) {
      this.saveState(key, { ...state, ...values });
    }
  }

  /**
   * Restores the state last confirmed by Last.fm, or forgets the track when none was.
   *
   * @param {String} key Track key
   */
  revertState (key) {
    const { confirmed } = this.states[key] ?? {};

    if (confirmed === undefined) {
      this.persist(Object.fromEntries(Object.entries(this.states).filter(([other]) => other !== key)));
    }
    else {
      this.updateState(key, { loved: confirmed });
    }
  }

  /**
   * Adds or replaces a cached state, dated now.
   *
   * @param {String} key Track key
   * @param {ScrobblingTrack & Omit<LoveState, 'updatedAt'>} state
   */
  saveState (key, state) {
    this.persist({ ...this.states, [key]: { ...state, updatedAt: Date.now() } });
  }

  /**
   * Stores the states in the `scrobbling.loved` preference.
   * Expired states are dropped, and only the most recent `MAX_STATES` are kept.
   *
   * @param {Object.<String, ScrobblingTrack & LoveState>} states
   */
  persist (states) {
    const kept = Object.entries(states)
      .filter(([, state]) => isFresh(state))
      .sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_STATES);

    this.preferences.set('scrobbling.loved', Object.fromEntries(kept)).catch(debug);
  }
}
