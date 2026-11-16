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

describe('Preferences', function(){
  let storage, manager;

  beforeEach(function(){
    localStorage.clear();
    storage = createStorage();
    manager = new Preferences(storage);
  });

  it('should have switched over a new test namespace', function(){
    expect(manager.namespace).not.toBeFalsy();
    expect(manager.namespace).toEqual(process.env.PREFERENCES_NAMESPACE);
  });

  it('#get', async function(){
    await manager.ready();

    expect(manager.get("non-existing key")).toEqual(null);
    expect(manager.get("non-existing key", "default")).toEqual("default");
    expect(manager.get(null)).toEqual(null);
    expect(manager.get("")).toEqual(null);
  });

  it('#set', async function(){
    await manager.ready();
    await manager.set("future key", {foo: "bar"});

    expect(manager.get("future key")).toEqual({foo: "bar"});
    expect(storage.items[manager.namespace + "future key"]).toEqual({foo: "bar"});
  });

  it('#del', async function(){
    await manager.ready();
    await manager.set("future key", {foo: "bar"});
    await manager.del("future key");

    expect(manager.get("future key")).toEqual(null);
    expect(storage.items).toEqual({});
  });

  it('#ready loads stored values', async function(){
    storage.items[manager.namespace + "playback.station"] = "theme-jazz";

    await manager.ready();

    expect(manager.get("playback.station")).toEqual("theme-jazz");
  });

  it('#ready migrates localStorage values when storage is empty', async function(){
    localStorage.setItem(manager.namespace + "playback.station", JSON.stringify("theme-jazz"));

    await manager.ready();

    expect(manager.get("playback.station")).toEqual("theme-jazz");
    expect(storage.items[manager.namespace + "playback.station"]).toEqual("theme-jazz");
  });

  it('syncs values changed by another context', async function(){
    const other = new Preferences(storage);

    await manager.ready();
    await other.set("radio.volume", 0.5);

    expect(manager.get("radio.volume")).toEqual(0.5);
  });

  it('#onChange runs once the cache is up to date', async function(){
    const other = new Preferences(storage);
    const callback = jest.fn(() => manager.get("playback.station"));

    await manager.ready();
    manager.onChange(["playback.station"], callback);
    await other.set("radio.volume", 0.5);
    await other.set("playback.station", "theme-jazz");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveReturnedWith("theme-jazz");
  });
});
