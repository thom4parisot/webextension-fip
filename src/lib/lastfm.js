import { md5 } from 'blueimp-md5';

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
function generateSignature(params, secret) {
  const signature = Object.keys(params).sort().reduce((previous, key) => {
    return previous + key + params[key];
  }, "");

  return md5(signature + secret);
}

export default class LastfmAPI {
  constructor(token) {
    this.secret = process.env.LAST_FM_SECRET;
    this.api_key = process.env.LAST_FM_KEY;
    this.session_key = token || null;
    this.api_url = "https://ws.audioscrobbler.com/2.0/";

    if (!this.api_key) {
      throw new Error('No Last.fm API key was provided');
    }

    if (!this.secret) {
      throw new Error('No Last.fm secret key was provided');
    }
  }

  /**
   * Indicate if we have the permission to use the API.
   *
   * @returns {Boolean}
   */
  isConfigured() {
    return this.secret && this.api_key && this.session_key;
  };

  /**
   * Send a raw HTTP request to Last.fm.
   * Also applies some signature magic.
   *
   * @param {Object} data
   * @param {Function=} done
   */
  sendRequest(data, done) {
    const xhr = new XMLHttpRequest();
    const method = LAST_FM_API_METHODS[data.method];
    let url = this.api_url;
    let querydata;

    data.api_key = this.api_key;

    if (this.session_key) {
      data.sk = this.session_key;
    }

    data.api_sig = this.applySignature(data);

    if (method === "GET") {
      url += Object.keys(data).reduce(function (previous, key) {
        return previous + [key, data[key]].join('=') + '&';
      }, '?');
    }
    else if (method === "POST") {
      querydata = new FormData();

      Object.keys(data).forEach(key => {
        querydata.append(key, data[key]);
      });
    }

    if (typeof done === "function") {
      xhr.addEventListener("load", done);
    }

    xhr.open(method, url);
    xhr.send(querydata instanceof FormData ? querydata : undefined);
  };

  /**
   * Retrieve the session key after a user authentication.
   *
   * @param {string} token
   * @param {function({sessionKey: String, userName: String})} done
   */
  getSessionKey(token, done) {
    this.sendRequest({ method: 'auth.getSession', token: token }, response => {
      var doc = response.target.responseXML;

      done({
        sessionKey: doc.querySelector('key').textContent,
        userName: doc.querySelector('name').textContent
      });
    });
  };

  /**
   * Track the listening of a song.
   *
   * @see http://www.last.fm/api/show/track.updateNowPlaying
   * @param {{artist: String, track: String}} params
   * @param {Function=} done Success callback
   */
  scrobble(params, done) {
    const data = {
      "method": 'track.scrobble',
      "artist": params.artist,
      "track": params.track,
      "timestamp": parseInt((params.when || Date.now()) / 1000, 10),
      "chosenByUser": 0
    };

    this.sendRequest(data, done);
  };

  /**
   * Update the "Now Playing" status.
   *
   * @see http://www.last.fm/api/show/track.updateNowPlaying
   * @param {{artist: String, track: String}} params
   * @param {Function=} done Success callback
   */
  nowPlaying(params, done) {
    var data = {
      "method": 'track.updateNowPlaying',
      "artist": params.artist,
      "track": params.track
    };

    this.sendRequest(data, done);
  };

  /**
   * Mutate the parameters with a signature argument.
   *
   * @see http://www.last.fm/api/authspec#8
   * @param {Object} params Objects to sign
   */
  applySignature(params) {
    delete params.api_sig;

    return generateSignature(params, this.secret);
  }
}


