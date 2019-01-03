import lastFm from '../../src/lib/lastfm.js';
import fixtures from '../fixtures/livemeta.json';

describe('Last.fm', function(){
  it('should have API and Secret configured', () => {
    expect(lastFm.isEnabled()).to.be.true;
  });

  it('should try to hint a _now playing_ tune', () => {
    const song = fixtures.steps['7f6c3935b7d12360ec7f14c772edea9a7'];
    const client = new lastFm('dummy token');

    return client.nowPlaying({
      artist: song.authors,
      track: song.title,
    })
    .catch(({message}) => {
      // it proves the payload is okay
      expect(message).to.match(/Invalid session key/);
    });
  });

  it('should try to scroll a tune', () => {
    const song = fixtures.steps['7f6c3935b7d12360ec7f14c772edea9a7'];
    const client = new lastFm('dummy token');

    return client.scrobble({
      artist: song.authors,
      track: song.title,
      when: Date.now() - 120 * 1000
    })
    .catch(({message}) => {
      // it proves the payload is okay
      expect(message).to.match(/Invalid session key/);
    });
  });
});
