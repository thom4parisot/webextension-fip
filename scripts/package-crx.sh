#!/bin/sh
#
# Signs `build/` into `dist/webextension-fip-v<version>.crx`,
# for the Chrome Web Store "Verified uploads". macOS only.
#
# Usage: npm run package:crx
#
# The private key lives in the macOS keychain, base64 encoded,
# as the "webextension-fip-crx" generic password. One-time setup:
#
#   openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 | base64 | tr -d '\n' \
#     | xargs -0 security add-generic-password -a "$USER" -s webextension-fip-crx -w
#
# Public key, for the "Package" tab of the Chrome Web Store dashboard:
#
#   security find-generic-password -s webextension-fip-crx -w | base64 --decode | openssl rsa -pubout

set -eu

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
KEY_FILE="$(mktemp)"

# the key only exists on disk while Chrome signs the package
trap 'rm -f "$KEY_FILE"' EXIT

security find-generic-password -s webextension-fip-crx -w | base64 --decode > "$KEY_FILE"

# Chrome writes `build.crx` next to the `build/` folder
"$CHROME" --pack-extension="$PWD/build" --pack-extension-key="$KEY_FILE"
mkdir -p dist
mv build.crx "dist/webextension-fip-v${npm_package_version}.crx"
