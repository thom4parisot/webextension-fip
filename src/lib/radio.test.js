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

  beforeAll(() => {
    globalThis.Audio = FakeAudio;
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    delete globalThis.Audio;
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    radio = new Radio({ url: 'https://icecast.radiofrance.fr/fip-midfi.mp3' });
  });

  it('should provide a ready-to-be played radio object', () => {
    expect(radio.state).toEqual(states.STOPPED);
  });

  it('buffers, then plays once the stream can play through', () => {
    radio.play();
    expect(radio.state).toEqual(states.BUFFERING);
    expect(radio.playbackObject.src).toEqual('https://icecast.radiofrance.fr/fip-midfi.mp3');

    radio.playbackObject.dispatchEvent(new Event('canplaythrough'));
    expect(radio.state).toEqual(states.PLAYING);
  });

  it('toggles between playing and stopped', () => {
    radio.toggle();
    radio.playbackObject.dispatchEvent(new Event('canplaythrough'));
    radio.toggle();

    expect(radio.state).toEqual(states.STOPPED);
    expect(radio.playbackObject.src).toEqual('');
  });

  it('goes back to buffering when the network goes offline', () => {
    radio.play();
    radio.playbackObject.dispatchEvent(new Event('canplaythrough'));
    radio.handle('network.offline');

    expect(radio.state).toEqual(states.BUFFERING);
  });

  it('can play again after an error', () => {
    radio.play();
    radio.playbackObject.dispatchEvent(new Event('error'));
    expect(radio.state).toEqual(states.ERRORED);

    radio.play();
    expect(radio.state).toEqual(states.BUFFERING);
  });

  it('reports each state change', () => {
    const transitions = [];
    radio.onTransition(({ fromState, toState }) => transitions.push([fromState, toState]));

    radio.play();
    radio.playbackObject.dispatchEvent(new Event('canplaythrough'));
    radio.stop();

    expect(transitions).toEqual([
      [states.STOPPED, states.BUFFERING],
      [states.BUFFERING, states.PLAYING],
      [states.PLAYING, states.STOPPED],
    ]);
  });
});
