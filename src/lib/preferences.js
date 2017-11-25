/**
 * Provided strategies to persist data across user session.
 *
 * @static
 * @type {Object}
 */
const STORAGE_STRATEGIES = {
  "localStorage": {
    get name () {
      return 'localStorage';
    },
    /**
     * @see Preferences.prototype.get
     */
    get (key){
      return JSON.parse(localStorage.getItem(key));
    },
    /**
     * @see Preferences.prototype.set
     */
    set (key, value){
      localStorage.setItem(key, JSON.stringify(value));
    },
    /**
     * @see Preferences.prototype.delete
     */
    del (key){
      localStorage.removeItem(key);
    }
  }
};

/**
 * Strategy storage manager.
 *
 * @param {String} strategy
 * @constructor
 */
export default class Preferences{
  constructor (strategy) {
    /**
     * Instance storage key prefix.
     * @type {string}
     */
    this.namespace = process.env.PREFERENCES_NAMESPACE || '';

    /**
     * Strategy used to persist and access data.
     * @type {Object}
     */
    this.strategy = STORAGE_STRATEGIES[strategy] || STORAGE_STRATEGIES.localStorage;
  }

  /**
   * Retrieve any stored data, or returns the default value.
   *
   * @param {String} key
   * @param {Mixed=} default_value
   * @returns {String|Mixed}
   */
  get (key, default_value){
    var value = this.strategy.get(this.namespace + key, default_value);

    return typeof value !== undefined && value !== null ? value : (default_value || null);
  }

  /**
   * Persist a value; overwriting if already existing.
   *
   * @param {String} key
   * @param {Mixed} value (will be casted to String with some storage strategies like `localStorage`)
   */
  set (key, value){
    if (value === null) {
      this.del(key);
    }
    else {
      this.strategy.set(this.namespace + key, value);
    }
  }

  /**
   * Delete a value.
   *
   * @param {String} key
   * @param {Mixed} value (will be casted to String with some storage strategies like `localStorage`)
   */
  del (key){
    this.strategy.del(this.namespace + key);
  }
}
