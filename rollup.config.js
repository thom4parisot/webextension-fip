import { cp, glob } from 'node:fs/promises';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';

import loadEnv from './scripts/load-env.js';

loadEnv();

/**
 * Environment variables inlined in the bundles.
 */
const ENV_VARIABLES = ['BUILD_CHANNEL', 'LAST_FM_KEY', 'LAST_FM_SECRET', 'PREFERENCES_NAMESPACE'];

const plugins = [
  resolve({
    preferBuiltins: false
  }),
  commonjs(),
  json(),
  replace({
    preventAssignment: true,
    values: Object.fromEntries(ENV_VARIABLES.map(name => [`process.env.${name}`, JSON.stringify(process.env[name] ?? '')])),
  }),
  copyStaticFiles(),
];

/**
 * Files loaded by the browser as they are: manifest, HTML, CSS, icons and translations.
 * JavaScript and `stations.json` are processed by Rollup instead.
 */
const isStaticFile = path => !path.endsWith('.js') && path !== 'src/stations.json';

function copyStaticFiles () {
  return {
    name: 'copy-static-files',
    async buildStart () {
      for await (const path of glob('src/**/*.*')) {
        if (isStaticFile(path)) {
          this.addWatchFile(path);
        }
      }
    },
    writeBundle () {
      return cp('src', 'build', { recursive: true, filter: isStaticFile });
    },
  };
}

/**
 * One file per module, in `build/`, mirroring `src/`.
 * npm dependencies go in `build/vendor/`, so reviewers can compare them with the published packages.
 */
export default {
  input: [
    'src/background/service-worker.js',
    'src/players/background/index.js',
    'src/players/offscreen/index.js',
    'src/now-playing/app.js',
    'src/options/app.js',
  ],
  output: {
    dir: 'build',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: 'src',
    // Chrome rejects paths starting with `_`, like Rollup's default `_virtual/`
    virtualDirname: 'vendor/virtual',
    entryFileNames: ({ name }) => `${name.replace(/^node_modules\//, 'vendor/')}.js`,
  },
  plugins,
};

