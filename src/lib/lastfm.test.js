import lastFm from './lastfm.js';
import fixtures from '../../resources/fixtures/history.json';

import {withHistoryResponse} from './stations.js';
import Steps from './steps.js';

describe('Last.fm', function(){
  const song = Steps.getAll(withHistoryResponse(fixtures))[0];

  it('should have API and Secret configured', () => {
    expect(lastFm.isEnabled()).toBe(true);
  });

  it('should try to hint a _now playing_ tune', () => {
    const client = new lastFm('dummy token');

    return client.nowPlaying({
      artist: song.authors,
      track: song.title,
    })
    .catch(({message}) => {
      // it proves the payload is okay
      expect(message).toMatch(/Invalid session key/);
    });
  });

  it('should try to scroll a tune', () => {
    const client = new lastFm('dummy token');

    return client.scrobble({
      artist: song.authors,
      track: song.title,
      when: Date.now() - 120 * 1000
    })
    .catch(({message}) => {
      // it proves the payload is okay
      expect(message).toMatch(/Invalid session key/);
    });
  });
});
