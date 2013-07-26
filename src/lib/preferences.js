"use strict";

/**
 * Strategy storage manager.
 *
 * @param {String} strategy
 * @constructor
 */
function Preferences(strategy){
  /**
   * Instance storage key prefix.
   * @type {string}
   */
  this.namespace = Preferences.NAMESPACE;

  /**
   * Strategy used to persist and access data.
   * @type {Object}
   */
  this.strategy = Preferences.strategies[strategy] || Preferences.strategies.localStorage;
}

/**
 * Preference key prefix
 *
 * @type {string}
 */
Preferences.NAMESPACE = "";

/**
 * Retrieve any stored data, or returns the default value.
 *
 * @param {String} key
 * @param {Mixed=} default_value
 * @returns {String|Mixed}
 */
Preferences.prototype.get = function get(key, default_value){
  var value = this.strategy.get(this.namespace + key, default_value);

  return typeof value !== undefined && value !== null ? value : (default_value || null);
};

/**
 * Persis a value; overwriting if already existing.
 *
 * @param {String} key
 * @param {Mixed} value (will be casted to String with some storage strategies like `localStorage`)
 */
Preferences.prototype.set = function set(key, value){
  this.strategy.set(this.namespace + key, value);
};

/**
 * Provided strategies to persist data across user session.
 *
 * @static
 * @type {Object}
 */
Preferences.strategies = {
  "localStorage": {
    /**
     * @see Preferences.prototype.get
     */
    "get": function getPreference(key){
      return JSON.parse(localStorage.getItem(key));
    },
    /**
     * @see Preferences.prototype.set
     */
    "set": function setPreference(key, value){
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  }
};

