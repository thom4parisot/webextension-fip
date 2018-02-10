# FIP Radio for Chrome [![Build Status][]](https://travis-ci.org/oncletom/chrome-fip) ![][rating badge] ![][downloads badge] ![][version badge]

> *FIP Radio for Chrome* is a [Chrome extension][] providing a minimalistic UI to play the excellent [FIP Radio](https://www.fip.fr/) and to scrobble at the same time.

![Extension Showcase](resources/showcase.png)

The goals of this extension are the following:

- recover from loss of network connection or FIP hickups;
- accessing the *Now Playing* info screen within a single click
- scrobbling to last.fm or libre.fm

## Install

If you just want to install the extension to use it:
simply access the [Chrome Web Store extension page][Chrome extension],
review and install it.

## Contribute

Contributions are friendly welcomed, either they are code, ideas or bug reports.

The developer toolchain relies on:
- [Angular](http://angularjs.org/) for dynamic HTML templating;
- [Machina.js](https://github.com/ifandelse/machina.js) for State Machine management;
- [Chrome Extension API](http://developer.chrome.com/extensions/), obviously to glue the whole stuff in your browser :-)

If you don't know them much… well it's a good occasion to learn!

### Checkout

1. `git clone` your fork of the repository
1. `npm install` in the project folder
1. [load the unpacked extension](http://developer.chrome.com/extensions/getstarted.html#unpacked) in Chrome/Chromium

[Chrome Dev Tools](https://developers.google.com/chrome-developer-tools/) will
help you debugging by displaying errors or the various state change of the playback.

### Testing

If you don't know anything about testing, [Travis CI](https://travis-ci.org/oncletom/chrome-fip)
takes care about each commit to ensure the app won't break.

Test should not break (but don't comment them to avoid failures...) and new features should be testable.

Current status is pretty poor but the codebase is solid. More tests will be added soon to
increase contribution safetey. As I'm using the extension everyday, I may be the first to notice any new issue ;-)

[Chrome extension]: 	https://chrome.google.com/webstore/detail/fnhlecpfnocgmmmghkjcipmhdpmpddii
[Build Status]: 	https://travis-ci.org/oncletom/chrome-fip.svg?branch=master
[downloads badge]: 	https://img.shields.io/chrome-web-store/d/fnhlecpfnocgmmmghkjcipmhdpmpddii.svg
[version badge]: 	https://img.shields.io/chrome-web-store/v/fnhlecpfnocgmmmghkjcipmhdpmpddii.svg
[rating badge]: 	https://img.shields.io/chrome-web-store/rating/fnhlecpfnocgmmmghkjcipmhdpmpddii.svg
