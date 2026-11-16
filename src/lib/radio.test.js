import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it, mock } from 'node:test';

import Radio, {states} from './radio.js';

/**
 * Minimal <audio> double: events are dispatched by the tests.
 */
class FakeAudio extends EventTarget {
  play () {}
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
    radio = new Radio({ url: 'https://icecast.radiofrance.fr/fip-midfi.mp3' });
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

  it('goes back to buffering when the network goes offline', () => {
    radio.play();
    radio.playbackObject.dispatchEvent(new Event('canplaythrough'));
    radio.handle('network.offline');

    assert.deepStrictEqual(radio.state, states.BUFFERING);
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
});
