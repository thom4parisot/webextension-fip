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
];

export default [
  {
    input: 'src/players/background/index.js',
    output: {
      file: 'src/players/background/bundle.js',
      format: 'esm',
    },
    plugins,
  },
  {
    input: 'src/now-playing/app.js',
    output: {
      file: 'src/now-playing/bundle.js',
      format: 'esm',
    },
    plugins,
  },
  {
    input: 'src/options/app.js',
    output: {
      file: 'src/options/bundle.js',
      format: 'esm',
    },
    plugins,
  },
];
