"use strict";

/**
 *
 * @param strategy
 * @constructor
 */
function Preferences(strategy){
  this.strategy = Preferences.strategies[strategy] || Preferences.strategies.localStorage;
}

/**
 *
 * @param key
 * @param default_value
 * @returns {*}
 */
Preferences.prototype.get = function get(key, default_value){
  return this.strategy.get(key, default_value);
};

/**
 *
 * @param key
 * @param value
 */
Preferences.prototype.set = function set(key, value){
  this.strategy.set(key, value);
};

/**
 *
 * @type {{localStorage: {get: Function, set: Function}}}
 */
Preferences.strategies = {
  "localStorage": {
    /**
     *
     * @param key
     * @param default_value
     * @returns {*}
     */
    "get": function getPreference(key, default_value){
      var value = localStorage.getItem(key);

      return typeof value !== undefined && value !== null ? value : (default_value || null);
    },
    /**
     *
     * @param key
     * @param value
     */
    "set": function setPreference(key, value){
      localStorage.setItem(key, value);
    }
  }
};

