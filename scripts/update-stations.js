/**
 * Generates `src/stations.json` from the FIP stations listed on radiofrance.fr.
 *
 * Usage: npm run update-stations
 */
import { writeFile } from 'node:fs/promises';

const SOURCE_URL = 'https://www.radiofrance.fr/fip/__data.json';
const OUTPUT_FILE = new URL('../src/stations.json', import.meta.url);

/**
 * Keys already saved in users preferences (`playback.station`).
 */
const LEGACY_KEYS = {
  FIP: 'fip-paris',
  FIP_WORLD: 'theme-monde',
  FIP_NOUVEAUTES: 'theme-nouveau',
};

/**
 * Stream file suffix, by quality preference.
 */
const QUALITIES = {
  sd: 'lofi.mp3',
  hd: 'midfi.mp3',
  hifi: 'hifi.aac',
};

/**
 * SvelteKit serialises page data as a flat array, where values point to other indexes.
 * Returns every object of the page, resolved.
 */
function decode (data) {
  const resolved = [];
  const resolve = index => {
    if (index < 0 || !(index in data)) {
      return undefined;
    }

    if (!(index in resolved)) {
      const value = data[index];

      if (value && typeof value === 'object') {
        resolved[index] = Array.isArray(value) ? [] : {};
        Object.entries(value).forEach(([key, child]) => resolved[index][key] = resolve(child));
      }
      else {
        resolved[index] = value;
      }
    }

    return resolved[index];
  };

  return data.map((value, index) => resolve(index));
}

const isAvailable = url => fetch(url, { headers: { Range: 'bytes=0-0' } })
  .then(res => res.body?.cancel().then(() => res.ok) ?? res.ok)
  .catch(() => false);

async function getStreams (brandEnum) {
  const prefix = brandEnum.toLowerCase().replace(/_/g, '');
  const entries = await Promise.all(Object.entries(QUALITIES).map(async ([quality, suffix]) => {
    const url = `https://icecast.radiofrance.fr/${prefix}-${suffix}`;

    return [quality, url, await isAvailable(url)];
  }));

  return Object.fromEntries(entries.filter(([, , available]) => available).map(([quality, url]) => [quality, url]));
}

async function toStation ({ brandEnum, id, shortTitle }) {
  const key = LEGACY_KEYS[brandEnum] || brandEnum.replace(/^FIP_/, 'theme-').replace(/_/g, '-').toLowerCase();

  return [key, {
    name: brandEnum === 'FIP' ? 'FIP' : `FIP ${shortTitle}`,
    stationId: Number(id),
    history: await isAvailable(`https://api.radiofrance.fr/livemeta/pull/${id}`),
    streams: await getStreams(brandEnum),
  }];
}

const { nodes } = await fetch(SOURCE_URL).then(res => res.json());
const items = nodes.flatMap(node => node?.data ? decode(node.data) : []);
const brands = new Map(items
  .filter(item => item?.brandEnum && item.id)
  .map(brand => [brand.brandEnum, brand]));

// the main FIP station lists its webradios names, in the website order (itself first)
const { webradios } = items.find(item => item?.brandEnum === 'FIP' && item.webradios);
const stations = Object.fromEntries(await Promise.all(webradios
  .map(name => toStation(brands.get(name.toUpperCase())))));

await writeFile(OUTPUT_FILE, JSON.stringify(stations, null, 2) + '\n');

console.log(`${Object.keys(stations).length} stations written in ${OUTPUT_FILE.pathname}`);
