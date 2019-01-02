import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';

export const plugins = [
  resolve({
    preferBuiltins: false
  }),
  builtins(),
  commonjs(),
  json(),
  babel({
    babelrc: true,
    runtimeHelpers: true,
  }),
];

export default [
  {
    input: 'src/background/app.js',
    output: {
      file: 'src/background/bundle.js',
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
