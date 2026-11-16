/**
 * web-ext settings, for both Firefox and Chrome.
 * @see https://extensionworkshop.com/documentation/develop/web-ext-command-reference/
 */
export default {
  sourceDir: 'src',
  artifactsDir: 'dist',
  ignoreFiles: [
    '**/!(bundle).js',
    'stations.json',
    'lastfm',
    'lib',
  ],
  build: {
    filename: 'webextension-fip-v{version}.zip',
    overwriteDest: true,
  },
};
