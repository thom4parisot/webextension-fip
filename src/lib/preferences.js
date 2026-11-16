/**
 * Preferences persisted with the WebExtension `storage.local` API.
 *
 * Values are cached in memory so `get()` stays synchronous.
 * Wait for `ready()` before reading anything.
 */
export default class Preferences {
  /**
   * @param {browser.storage} storage `browser.storage` namespace
   */
  constructor (storage) {
    /**
     * Instance storage key prefix.
     * @type {string}
     */
    this.namespace = process.env.PREFERENCES_NAMESPACE || '';
    this.storage = storage;
    this.cache = {};
    this.listeners = [];

    // keeps the cache in sync with the other extension contexts (popup, options, background)
    storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') {
        return;
      }

      Object.entries(changes).forEach(([key, { newValue }]) => {
        if (newValue === undefined) {
          delete this.cache[key];
        }
        else {
          this.cache[key] = newValue;
        }
      });

      this.listeners
        .filter(({ keys }) => keys.some(key => key in changes))
        .forEach(({ callback }) => callback());
    });
  }

  /**
   * Loads the stored values once.
   *
   * @returns {Promise.<Preferences>}
   */
  ready () {
    this.loading = this.loading || this.storage.local.get(null)
      .then(items => Object.keys(items).length ? items : this.migrateLocalStorage())
      .then(items => Object.assign(this.cache, items))
      .then(() => this);

    return this.loading;
  }

  /**
   * Copies preferences saved by previous versions (<= 1.6.7) in `localStorage`.
   * `localStorage` is left untouched, in case of a downgrade.
   *
   * @returns {Promise.<Object>}
   */
  migrateLocalStorage () {
    if (typeof localStorage === 'undefined' || !localStorage.length) {
      return {};
    }

    const items = Object.fromEntries(Object.keys(localStorage).map(key => [key, JSON.parse(localStorage.getItem(key))]));

    return this.storage.local.set(items).then(() => items);
  }

  /**
   * Calls `callback` when any of `keys` changes, in any extension context.
   * The cache already holds the new values when `callback` runs.
   *
   * @param {Array.<String>} keys
   * @param {Function} callback
   */
  onChange (keys, callback) {
    this.listeners.push({ keys: keys.map(key => this.namespace + key), callback });
  }

  /**
   * Retrieve any stored data, or returns the default value.
   *
   * @param {String} key
   * @param {Mixed=} default_value
   * @returns {Mixed}
   */
  get (key, default_value = null) {
    return this.cache[this.namespace + key] ?? default_value;
  }

  /**
   * Persist a value; overwriting if already existing.
   *
   * @param {String} key
   * @param {Mixed} value
   * @returns {Promise}
   */
  set (key, value) {
    if (value === null) {
      return this.del(key);
    }

    this.cache[this.namespace + key] = value;

    return this.storage.local.set({ [this.namespace + key]: value });
  }

  /**
   * Delete a value.
   *
   * @param {String} key
   * @returns {Promise}
   */
  del (key) {
    delete this.cache[this.namespace + key];

    return this.storage.local.remove(this.namespace + key);
  }
}
