A great way to listen to the fabulous and ad-free FIP Radio within you browser.

Its simple and neat interface provides you a one-click playback, automatic scrobbling and on air informations display.

Issues and features roadmap are tracked on this page:
> https://github.com/oncletom/webextension-fip/issues

# Quoi de neuf ?

## Version 1.5.2

- fix last.fm scrobbling (I broke it)

## Version 1.5.0

- display station name
- display volume control
- display relative time for previous tracks
- adjust to new FIP data feed

## Version 1.4.0

- display iTunes, Amazon and YouTube links, if available
- navigation buttons use arrow icons to be more explicit
- display last.fm scrobbling status

## Version 1.3.0

- the 'Archives' is now related to your current radio channel
- when you change the radio channel while its playing, the playback will switch to this channel

## Version 1.2.8

- fix last.fm scrobbling
- restore last.fm setup on the options page
- Chrome : fix responsive layout (broken in 1.2.5)

## Version 1.2.5

- Firefox: responsive layout to make it work when the extension is located in the _additional tools_ menu
- fix a typo in the french translation
- add a privacy policy

## Version 1.2.3

- fix last.fm connection
- rework the software tooling to conform to the distribution platforms policy

## Version 1.1.7

- fix broken interface due to fipradio.fr being permanently redirected to fip.fr [#79](https://github.com/oncletom/webextension-fip/issues/79)

## Version 1.1.6

- enable logging on network requests errors (mostly to ease troubleshooting)

## Version 1.1.5

- set Manifest `permissions` to target `fipradio.fr` resources
- fix last.fm authentication which was mistakenly broken

## Version 1.1.4

- update dependencies (fixes display issues in Firefox)

## Version 1.1.3

- add CHANGELOG
- fix Previous/Next buttons (they did not work in Firefox) [#72](https://github.com/oncletom/webextension-fip/issues/72)

## Version 1.1.2

- fix last.fm scrobbling authentication URL for Chrome 60+

## Version 1.1.0

- last.fm scrobbling is back — head to the extension options page :-)
- cleaner artists, albums and tracks labels
- last.fm links to artists, albums and tracks search should give more accurate results

## Version 1.0.0

- choose amongst the various webradios

## Version 0.9.1

- long overdue bugfixes
- last.fm scrobbling is disabled for now (can't make it work anymore)

## Version 0.8.0
- Christmas is ahead of schedule: Last.fm scrobbling is back!
- the extension requires less user permissions

## Version 0.7.7
- playback URL update (cf. http://espacepublic.radiofrance.fr/23-juin-2015-inaccessibilit-de-nos-antennes-tunein-et-itunes) /via https://github.com/cbonnissent

## Version 0.7.6
- compatibility fix with the new FIP website

## Version 0.7.5
- scrobbling feature is back!

## Version 0.7.3
- scrobbling temporarily disabled because of a last.fm bug

## Version 0.7
- automatic scrobbling of the listened tracks

## Version 0.6
- beautiful history navigation
- fixed the album title and date overlapping

## Version 0.5.1
- fixing initial volume level
- fixing layout display bugs

## Version 0.5.0
- new audio volume control
- less text + more icons = prettier

## Version 0.4.3
- better play/pause icons

## Version 0.4.2
- better display of a composed artist name

## Version 0.4.1
- display bug fixes
- artifacts cleanup in artist and album labels

## Version 0.4.0
- hyperlink towards FIP archives
- hyperlink towards last.fm artist, track and album

## Version 0.3.0
- `now playing` informations display

## Version 0.2.0
- better player's state management (playing, pause, error)
- network connectivity handling
- code cleanup

Next step: to display what's currently on air.

## Version 0.1.3
- providing French translation

## Version 0.1.2
- resetting status icon when the browser is opened again
- error icon is not shown anymore when pausing the radio

## Version 0.1.1
- improve stability on error/laptop asleep
- loading indicator when the music is not yet ready to play

## Version 0.1.0
- first release!
