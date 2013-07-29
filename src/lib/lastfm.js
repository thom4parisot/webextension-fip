"use strict";

/* globals md5 */

function LastfmAPI(token) {
  this.secret = "5bfff253b047941723be093331809c12";
  this.api_key = "5c12c1ed71a519ee5a4ddb140d28f55b";
  this.session_key = token || null;
  this.api_url = "https://ws.audioscrobbler.com/2.0/";
}

/**
 * Supported API Methods.
 * Enables `sendRequest` autoconf.
 *
 * @type {Object}
 */
LastfmAPI.methods = {
  "track.scrobble": "POST",
  "track.updateNowPlaying": "POST",
  "track.love": "POST",
  "auth.getSession": "GET"
};

/**
 * Indicate if we have the permission to use the API.
 *
 * @returns {Boolean}
 */
LastfmAPI.prototype.isConfigured = function isConfigured() {
  return this.secret && this.api_key && this.session_key;
};

/**
 * Send a raw HTTP request to Last.fm.
 * Also applies some signature magic.
 *
 * @param {Object} data
 * @param {Function=} done
 */
LastfmAPI.prototype.sendRequest = function sendRequest(data, done) {
  var xhr = new XMLHttpRequest();
  var method = LastfmAPI.methods[data.method];
  var url = this.api_url;
  var querydata;

  data.api_key = this.api_key;

  if (this.session_key) {
    data.sk = this.session_key;
  }

  this.applySignature(data);

  if (method === "GET") {
    url += Object.keys(data).reduce(function (previous, key) {
      return previous + [key, data[key]].join('=') + '&';
    }, '?');
  }
  else if (method === "POST") {
    querydata = new FormData();

    Object.keys(data).forEach(function (key) {
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
LastfmAPI.prototype.getSessionKey = function getSessionKey(token, done) {
  this.sendRequest({ method: 'auth.getSession', token: token }, function (response) {
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
LastfmAPI.prototype.scrobble = function scrobble(params, done) {
  var data = {
    method: 'track.scrobble',
    "artist[0]": params.artist,
    "track[0]": params.track,
    "timestamp[0]": parseInt((params.when || Date.now()) / 1000, 10),
    "chosenByUser[0]": false
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
LastfmAPI.prototype.nowPlaying = function nowPlaying(params, done) {
  var data = {
    method: 'track.updateNowPlaying',
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
LastfmAPI.prototype.applySignature = function applySignature(params) {
  delete params.api_sig;

  params.api_sig = LastfmAPI.generateSignature(params, this.secret);
};

/**
 * Generate a signature for the HTTP Call
 *
 * @see http://www.last.fm/api/authspec#8
 * @param {Object} params Objects to sign
 * @param {String} secret
 * @returns {String}
 */
LastfmAPI.generateSignature = function generateSignature(params, secret) {
  var signature = Object.keys(params).sort().reduce(function (previous, key) {
    return previous + key + params[key];
  }, "");

  return md5(signature + secret);
};