/**
 * Preferences persisted with the WebExtension `storage.local` API.
 *
 * Values are cached in memory so `get()` stays synchronous.
 * Wait for `ready()` before reading anything.
 */
export default class Preferences {
  /**
   * @param {browser.storage} storage `browser.storage` namespace
   * @param {Storage=} legacyStorage Where versions <= 1.6.7 saved preferences
   */
  constructor (storage, legacyStorage = globalThis.localStorage) {
    /**
     * Instance storage key prefix.
     * @type {string}
     */
    this.namespace = process.env.PREFERENCES_NAMESPACE || '';
    this.storage = storage;
    this.legacyStorage = legacyStorage;
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

      // Firefox reports every key which is set, even when its value is unchanged
      const changedKeys = Object.keys(changes)
        .filter(key => JSON.stringify(changes[key].oldValue) !== JSON.stringify(changes[key].newValue));

      this.listeners
        .filter(({ keys }) => keys.some(key => changedKeys.includes(key)))
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
    const { legacyStorage } = this;

    if (!legacyStorage?.length) {
      return {};
    }

    const keys = Array.from({ length: legacyStorage.length }, (_, index) => legacyStorage.key(index));
    const items = Object.fromEntries(keys.map(key => [key, JSON.parse(legacyStorage.getItem(key))]));

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

    return this.setAll({ [key]: value });
  }

  /**
   * Persist several values at once, as a single storage change.
   *
   * @param {Object} values
   * @returns {Promise}
   */
  setAll (values) {
    const items = Object.fromEntries(Object.entries(values).map(([key, value]) => [this.namespace + key, value]));

    Object.assign(this.cache, items);

    return this.storage.local.set(items);
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
