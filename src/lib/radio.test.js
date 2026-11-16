import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, it, mock } from 'node:test';

import Radio, {BUFFERING_TIMEOUT, states} from './radio.js';

/**
 * Minimal <audio> double: events are dispatched by the tests.
 */
class FakeAudio extends EventTarget {
  play () {
    return Promise.resolve();
  }
  pause () {}
}

describe('Radio', function(){
  let radio;

  before(() => {
    globalThis.Audio = FakeAudio;
    mock.method(console, 'log', () => {});
  });

  after(() => {
    delete globalThis.Audio;
    mock.restoreAll();
  });

  beforeEach(() => {
    // the buffering timeout must not keep the tests running
    mock.timers.enable({ apis: ['setTimeout'] });
    radio = new Radio({ url: 'https://icecast.radiofrance.fr/fip-midfi.mp3' });
  });

  afterEach(() => {
    mock.timers.reset();
  });

  it('should provide a ready-to-be played radio object', () => {
    assert.deepStrictEqual(radio.state, states.STOPPED);
  });

  it('buffers, then plays once the stream can play through', () => {
    radio.play();
    assert.deepStrictEqual(radio.state, states.BUFFERING);
    assert.deepStrictEqual(radio.playbackObject.src, 'https://icecast.radiofrance.fr/fip-midfi.mp3');

    radio.playbackObject.dispatchEvent(new Event('canplaythrough'));
    assert.deepStrictEqual(radio.state, states.PLAYING);
  });

  it('toggles between playing and stopped', () => {
    radio.toggle();
    radio.playbackObject.dispatchEvent(new Event('canplaythrough'));
    radio.toggle();

    assert.deepStrictEqual(radio.state, states.STOPPED);
    assert.deepStrictEqual(radio.playbackObject.src, '');
  });

  it('waits for the network when it goes offline', () => {
    radio.play();
    radio.playbackObject.dispatchEvent(new Event('canplaythrough'));
    radio.handle('network.offline');

    assert.equal(radio.state, states.OFFLINE);
  });

  it('reconnects to the stream once the network is back', () => {
    radio.play();
    radio.handle('network.offline');
    radio.playbackObject.src = '';
    radio.handle('network.online');

    assert.equal(radio.state, states.BUFFERING);
    assert.equal(radio.playbackObject.src, 'https://icecast.radiofrance.fr/fip-midfi.mp3');
  });

  it('waits for the network after an error', () => {
    radio.play();
    radio.playbackObject.dispatchEvent(new Event('error'));
    radio.handle('network.offline');

    assert.equal(radio.state, states.OFFLINE);
  });

  it('waits for the network when played offline', (t) => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    t.after(() => delete navigator.onLine);

    radio.play();

    assert.equal(radio.state, states.OFFLINE);
  });

  it('stops while waiting for the network', () => {
    radio.play();
    radio.handle('network.offline');
    radio.stop();

    assert.equal(radio.state, states.STOPPED);
    assert.equal(radio.playbackObject.src, '');
  });

  it('is errored when the stream does not start in time', () => {
    radio.play();
    mock.timers.tick(BUFFERING_TIMEOUT);

    assert.equal(radio.state, states.ERRORED);
  });

  it('does not time out once the stream plays', () => {
    radio.play();
    radio.playbackObject.dispatchEvent(new Event('canplaythrough'));
    mock.timers.tick(BUFFERING_TIMEOUT);

    assert.equal(radio.state, states.PLAYING);
  });

  it('can play again after an error', () => {
    radio.play();
    radio.playbackObject.dispatchEvent(new Event('error'));
    assert.deepStrictEqual(radio.state, states.ERRORED);

    radio.play();
    assert.deepStrictEqual(radio.state, states.BUFFERING);
  });

  it('reports each state change', () => {
    const transitions = [];
    radio.onTransition(({ fromState, toState }) => transitions.push([fromState, toState]));

    radio.play();
    radio.playbackObject.dispatchEvent(new Event('canplaythrough'));
    radio.stop();

    assert.deepStrictEqual(transitions, [
      [states.STOPPED, states.BUFFERING],
      [states.BUFFERING, states.PLAYING],
      [states.PLAYING, states.STOPPED],
    ]);
  });

  it('does not preload the stream', () => {
    radio.play();

    assert.equal(radio.playbackObject.preload, 'none');
  });

  it('is errored when the browser refuses to play', async (t) => {
    t.mock.method(FakeAudio.prototype, 'play', () => Promise.reject(new Error('NotAllowedError')));

    radio.play();
    await new Promise(resolve => setImmediate(resolve));

    assert.equal(radio.state, states.ERRORED);
  });

  it('ignores a playback interrupted by a stop', async (t) => {
    t.mock.method(FakeAudio.prototype, 'play', () => Promise.reject(new Error('AbortError')));

    radio.play();
    radio.stop();
    await new Promise(resolve => setImmediate(resolve));

    assert.equal(radio.state, states.STOPPED);
  });
});
