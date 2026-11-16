import browser from 'webextension-polyfill';

import debug from '../../lib/debug.js';
import Radio, {states} from '../../lib/radio.js';
import Steps from '../../lib/steps.js';

/**
 * Plays the stream in the now-playing tab (Android), on behalf of the background page.
 * A tap on its playback button allows the browser to play audio, in this tab only.
 *
 * @see ./strategy.js
 * @param {Preferences} preferences
 * @returns {Radio}
 */
export default function servePlayer (preferences) {
  const radio = new Radio({ url: '' });

  // the background page learns the tab id from the sender of this message
  const notify = state => browser.runtime.sendMessage({ target: 'background', state }).catch(debug);

  const commands = {
    toggle: () => radio.toggle(),
    stop: () => radio.stop(),
    // switches the stream without stopping: playing again would need another tap
    reload: () => {
      if (radio.state !== states.STOPPED) {
        radio.playbackObject.src = radio.playbackUrl;
        radio.playAudio();
      }
    },
    setVolume: () => {},
    getState: () => {
      notify(radio.state);

      return radio.state;
    },
  };

  radio.onTransition(({ toState }) => {
    notify(toState);
    navigator.mediaSession.playbackState = toState === states.STOPPED ? 'paused' : 'playing';
  });

  // the system media controls (notification, lock screen) show the track on air
  const showCurrentTrack = () => {
    const broadcasts = preferences.get('broadcasts', []);
    // like this tab, the latest track when none is on air (between tracks, or on air times ahead of the stream)
    const { title, authors, cover } = Steps.getCurrent(broadcasts) ?? broadcasts.at(-1) ?? {};

    navigator.mediaSession.metadata = new MediaMetadata({
      title: browser.i18n.getMessage('extension_name'),
      artist: [authors, title].filter(Boolean).join(' 🎵 '),
      artwork: cover ? [{ src: cover, sizes: '400x400' }] : [],
    });
  };

  preferences.ready().then(showCurrentTrack).catch(debug);
  preferences.onChange(['broadcasts'], showCurrentTrack);

  // the browser does not allow playing again from the media controls: they only stop the radio
  navigator.mediaSession.setActionHandler('pause', () => radio.stop());
  navigator.mediaSession.setActionHandler('stop', () => radio.stop());

  browser.runtime.onMessage.addListener(({ target, command, url, volume }) => {
    if (target !== 'tab') {
      return;
    }

    radio.setPlaybackUrl(url);
    const result = commands[command]();

    // after the command, as playing creates the <audio> element
    radio.setVolume(volume);

    return Promise.resolve(result);
  });

  ['online', 'offline'].forEach(type => {
    window.addEventListener(type, () => radio.handle(`network.${type}`));
  });

  notify(radio.state);

  return radio;
}
