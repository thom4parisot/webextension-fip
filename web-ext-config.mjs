/**
 * web-ext settings, for both Firefox and Chrome.
 * @see https://extensionworkshop.com/documentation/develop/web-ext-command-reference/
 */
export default {
  // built by `npm run build`
  sourceDir: 'build',
  artifactsDir: 'dist',
  build: {
    filename: 'webextension-fip-v{version}.zip',
    overwriteDest: true,
  },
};
