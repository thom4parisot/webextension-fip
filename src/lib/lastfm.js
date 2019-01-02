import md5 from 'blueimp-md5';

/*
 "Securely" provided by .travis.yml + envify transform
 */
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
        const options = {
          method,
          body: method === 'POST' ? payload : null
        };
        const params = new URLSearchParams(method === 'GET' ? payload : '');

        return fetch(`${this.api_url}?${params}`, options);
      })
      .then((response) => response.json());
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
   * @param {{artist: String, track: String}} params
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
   * @param {{artist: String, track: String}} params
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
}
