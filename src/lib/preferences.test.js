import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

import Preferences from './preferences.js';

/**
 * Minimal in-memory `browser.storage` double.
 */
function createStorage (items = {}) {
  const listeners = [];
  const notify = changes => listeners.forEach(listener => listener(changes, 'local'));

  return {
    items,
    onChanged: { addListener: listener => listeners.push(listener) },
    local: {
      get: () => Promise.resolve({ ...items }),
      set: values => {
        Object.assign(items, values);
        notify(Object.fromEntries(Object.entries(values).map(([key, newValue]) => [key, { newValue }])));
        return Promise.resolve();
      },
      remove: key => {
        delete items[key];
        notify({ [key]: {} });
        return Promise.resolve();
      },
    },
  };
}

/**
 * Minimal in-memory Web Storage (`localStorage`) double.
 */
function createLegacyStorage (items = {}) {
  return {
    get length () {
      return Object.keys(items).length;
    },
    key: index => Object.keys(items)[index],
    getItem: key => items[key] ?? null,
    setItem: (key, value) => {
      items[key] = String(value);
    },
  };
}

describe('Preferences', function(){
  let storage, legacyStorage, manager;

  beforeEach(function(){
    storage = createStorage();
    legacyStorage = createLegacyStorage();
    manager = new Preferences(storage, legacyStorage);
  });

  it('should have switched over a new test namespace', function(){
    assert.ok(manager.namespace);
    assert.deepStrictEqual(manager.namespace, process.env.PREFERENCES_NAMESPACE);
  });

  it('#get', async function(){
    await manager.ready();

    assert.deepStrictEqual(manager.get("non-existing key"), null);
    assert.deepStrictEqual(manager.get("non-existing key", "default"), "default");
    assert.deepStrictEqual(manager.get(null), null);
    assert.deepStrictEqual(manager.get(""), null);
  });

  it('#set', async function(){
    await manager.ready();
    await manager.set("future key", {foo: "bar"});

    assert.deepStrictEqual(manager.get("future key"), {foo: "bar"});
    assert.deepStrictEqual(storage.items[manager.namespace + "future key"], {foo: "bar"});
  });

  it('#del', async function(){
    await manager.ready();
    await manager.set("future key", {foo: "bar"});
    await manager.del("future key");

    assert.deepStrictEqual(manager.get("future key"), null);
    assert.deepStrictEqual(storage.items, {});
  });

  it('#ready loads stored values', async function(){
    storage.items[manager.namespace + "playback.station"] = "theme-jazz";

    await manager.ready();

    assert.deepStrictEqual(manager.get("playback.station"), "theme-jazz");
  });

  it('#ready migrates localStorage values when storage is empty', async function(){
    legacyStorage.setItem(manager.namespace + "playback.station", JSON.stringify("theme-jazz"));

    await manager.ready();

    assert.deepStrictEqual(manager.get("playback.station"), "theme-jazz");
    assert.deepStrictEqual(storage.items[manager.namespace + "playback.station"], "theme-jazz");
  });

  it('syncs values changed by another context', async function(){
    const other = new Preferences(storage, legacyStorage);

    await manager.ready();
    await other.set("radio.volume", 0.5);

    assert.deepStrictEqual(manager.get("radio.volume"), 0.5);
  });

  it('#onChange runs once the cache is up to date', async function(){
    const other = new Preferences(storage, legacyStorage);
    const callback = mock.fn(() => manager.get("playback.station"));

    await manager.ready();
    manager.onChange(["playback.station"], callback);
    await other.set("radio.volume", 0.5);
    await other.set("playback.station", "theme-jazz");

    assert.equal(callback.mock.callCount(), 1);
    assert.equal(callback.mock.calls[0].result, "theme-jazz");
  });
});
