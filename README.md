# FIP Live Radio – Chrome Extension

This Chrome extension is dedicated to people who want to listen to
[FIP Radio](http://www.fipradio.fr/) in a very easy way, from their browser.

The goals of this extension are the following:
- recover from loss of network connection or FIP hickups;
- accessing the *Currently playing* within a single click
- scrobbling to last.fm or libre.fm

## Install

If you just want to install the extension to use it:
simply access the [Chrome Web Store extension page](https://chrome.google.com/webstore/detail/fip-live-radio/fnhlecpfnocgmmmghkjcipmhdpmpddii),
review and install it.

## Contribute

*Pull Request* is our best friend.
Feel free to complete existing issues or share your own idea the way you like.

### Checkout

The project relies on JavaScript tools like `node.js` and `bower` to manage dependencies.
Here is the first step to initialize a project locally:
1. fork the repository and clone it on your machine
1. `npm install` will install and prepare everything
1. open Chrome/Chromium > Manage extensions > Active Developer Mode and *load unpacked extension*

Then refer to the [Chrome Extension API documentation](http://developer.chrome.com/extensions/) to fill in the blanks.

### Testing

Continuous Integration will be initiated in a near future.
Test should not break (but don't comment them to avoid failures...) and new features should be testable.

If you don't know how to write tests, contribute, still. It's a good way to learn by looking at the tests I or someone
else will add.