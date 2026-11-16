import browser from 'webextension-polyfill';

import debug from '../../lib/debug.js';
import Radio, {states} from '../../lib/radio.js';

/**
 * Plays the stream in the now-playing tab (Android), on behalf of the background page.
 * A tap on its playback button allows the browser to play audio, in this tab only.
 *
 * @see ./strategy.js
 * @returns {Radio}
 */
export default function servePlayer () {
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

  radio.onTransition(({ toState }) => notify(toState));

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
