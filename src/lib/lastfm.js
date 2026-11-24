import md5 from 'blueimp-md5';

const LAST_FM_KEY = process.env.LAST_FM_KEY;
const LAST_FM_SECRET = process.env.LAST_FM_SECRET;

/**
 * Supported API Methods.
 * Enables `sendRequest` autoconf.
 *
 * @type {Object}
 */
const LAST_FM_API_METHODS = {
  "track.scrobble": "POST",
  "track.updateNowPlaying": "POST",
  "track.love": "POST",
  "track.unlove": "POST",
  "track.getInfo": "GET",
  "auth.getSession": "GET"
};

/**
 * Generate a signature for the HTTP Call
 *
 * @see http://www.last.fm/api/authspec#8
 * @param {Object} params Objects to sign
 * @param {String} secret
 * @returns {String}
 */
function generateSignature(params, secret = LAST_FM_SECRET) {
  delete params.api_sig;

  params.api_key = LAST_FM_KEY;

  const signature = Object.keys(params).sort().reduce((previous, key) => {
    return previous + key + params[key];
  }, '');

  return md5(signature + secret);
}

/**
 * A track as known to scrobbling services.
 *
 * @typedef {Object} ScrobblingTrack
 * @property {String} artist
 * @property {String} track Track title
 */

/**
 * Request refused by Last.fm, as opposed to a network failure.
 *
 * @see https://www.last.fm/api/errorcodes
 */
export class LastfmError extends Error {
  constructor({ error, message }) {
    super(message);
    this.name = 'LastfmError';
    this.code = error;
  }
}

export default class LastfmAPI {
  constructor(token) {
    this.session_key = token || null;
    this.api_url = "https://ws.audioscrobbler.com/2.0/";
  }

  /**
   * Indicate if we have the permission to use the API.
   *
   * @returns {Boolean}
   */
  isConfigured() {
    return Boolean(LAST_FM_SECRET && LAST_FM_KEY && this.session_key);
  }

  static isEnabled() {
    return Boolean(LAST_FM_SECRET && LAST_FM_KEY);
  }

  /**
   * Send a raw HTTP request to Last.fm.
   * Also applies some signature magic.
   *
   * @param {Object} data
   * @param {Function=} done
   */
  sendRequest(data) {
    const method = LAST_FM_API_METHODS[data.method];

    if (this.session_key) {
      data.sk = this.session_key;
    }

    return Promise.resolve()
      .then(() => Object.assign({}, data, {
        format: 'json',
        api_sig: generateSignature(data)
      }))
      .then((payload) => {
        const params = new URLSearchParams(payload);
        const options = {
          method,
          mode: 'cors',
          body: method === 'POST' ? params : null,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
        return fetch(`${this.api_url}?${method === 'GET' ? params : ''}`, options);
      })
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          throw new LastfmError(response);
        }

        return response;
      });
  }

  /**
   * Retrieve the session key after a user authentication.
   *
   * @param {string} token
   */
  getSessionKey(token) {
    return this.sendRequest({ method: 'auth.getSession', token: token })
      .then(response => {
        return {
          sessionKey: response.session.key,
          userName: response.session.name
        };
      });
  }

  /**
   * Track the listening of a song.
   *
   * @see http://www.last.fm/api/show/track.updateNowPlaying
   * @param {ScrobblingTrack & {when: Number=}} params
   */
  scrobble(params) {
    const data = {
      "method": 'track.scrobble',
      "artist": params.artist,
      "track": params.track,
      "timestamp": parseInt((params.when || Date.now()) / 1000, 10),
      "chosenByUser": 0
    };

    return this.sendRequest(data);
  }

  /**
   * Update the "Now Playing" status.
   *
   * @see http://www.last.fm/api/show/track.updateNowPlaying
   * @param {ScrobblingTrack} params
   * @param {Function=} done Success callback
   */
  nowPlaying(params) {
    const data = {
      "method": 'track.updateNowPlaying',
      "artist": params.artist,
      "track": params.track
    };

    return this.sendRequest(data);
  }

  /**
   * Add a track to the user loved tracks.
   *
   * @see https://www.last.fm/api/show/track.love
   * @param {ScrobblingTrack} params
   */
  love({ artist, track }) {
    return this.sendRequest({ method: 'track.love', artist, track });
  }

  /**
   * Remove a track from the user loved tracks.
   *
   * @see https://www.last.fm/api/show/track.unlove
   * @param {ScrobblingTrack} params
   */
  unlove({ artist, track }) {
    return this.sendRequest({ method: 'track.unlove', artist, track });
  }

  /**
   * Tell if a user loves a track.
   *
   * @see https://www.last.fm/api/show/track.getInfo
   * @param {ScrobblingTrack & {username: String}} params
   * @returns {Promise.<Boolean>}
   */
  isLoved({ artist, track, username }) {
    return this.sendRequest({ method: 'track.getInfo', artist, track, username })
      .then(response => response.track.userloved === '1');
  }
}
