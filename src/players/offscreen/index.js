import debug from '../../lib/debug.js';
import Radio from '../../lib/radio.js';

/**
 * Offscreen document (Chrome): plays the stream on behalf of the service worker.
 * @see ./strategy.js
 */
const radio = new Radio({ url: '' });

const commands = {
  play: () => radio.play(),
  stop: () => radio.stop(),
  toggle: () => radio.toggle(),
  reload: () => radio.reload(),
  setVolume: () => {},
  getState: () => radio.state,
};

radio.onTransition(({ toState }) => {
  chrome.runtime.sendMessage({ target: 'background', state: toState }).catch(debug);
});

chrome.runtime.onMessage.addListener(({ target, command, url, volume }, sender, sendResponse) => {
  if (target !== 'offscreen') {
    return;
  }

  radio.setPlaybackUrl(url);
  const result = commands[command]();

  // after the command, as playing creates the <audio> element
  radio.setVolume(volume);
  sendResponse(result);
});

['online', 'offline'].forEach(type => {
  window.addEventListener(type, () => radio.handle(`network.${type}`));
});
