/**
 * Minimal in-memory `browser.storage` double.
 * As Firefox does, it reports every key which is set, even with an unchanged value.
 */
export function createStorage (items = {}) {
  const listeners = [];
  const notify = changes => listeners.forEach(listener => listener(changes, 'local'));

  return {
    items,
    onChanged: { addListener: listener => listeners.push(listener) },
    local: {
      get: () => Promise.resolve({ ...items }),
      set: values => {
        const changes = Object.fromEntries(Object.entries(values).map(([key, newValue]) => [key, { oldValue: items[key], newValue }]));

        Object.assign(items, values);
        notify(changes);
        return Promise.resolve();
      },
      remove: key => {
        const changes = { [key]: { oldValue: items[key] } };

        delete items[key];
        notify(changes);
        return Promise.resolve();
      },
    },
  };
}
