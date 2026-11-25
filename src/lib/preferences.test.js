import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

import Preferences from './preferences.js';
import {createStorage} from './test-doubles.js';

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

  it('#onChange ignores a value set again, unchanged', async function(){
    const other = new Preferences(storage, legacyStorage);
    const callback = mock.fn();

    await manager.ready();
    await other.set("playback.station", "theme-jazz");
    manager.onChange(["playback.station"], callback);
    await other.set("playback.station", "theme-jazz");
    await other.set("broadcasts", [{title: "Ladies"}]);
    manager.onChange(["broadcasts"], callback);
    await other.set("broadcasts", [{title: "Ladies"}]);

    assert.equal(callback.mock.callCount(), 0);
  });

  it('#setAll persists several values as a single change', async function(){
    const other = new Preferences(storage, legacyStorage);
    const callback = mock.fn();

    await manager.ready();
    manager.onChange(["playback.station", "playback.quality"], callback);
    await other.setAll({"playback.station": "theme-jazz", "playback.quality": "hifi"});

    assert.equal(callback.mock.callCount(), 1);
    assert.equal(other.get("playback.station"), "theme-jazz");
    assert.equal(manager.get("playback.quality"), "hifi");
    assert.equal(storage.items[manager.namespace + "playback.quality"], "hifi");
  });
});
