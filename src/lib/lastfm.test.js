import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import lastFm from './lastfm.js';
import fixtures from '../../resources/fixtures/livemeta.json' with { type: 'json' };

import {withLivemetaResponse} from './stations.js';
import Steps from './steps.js';

describe('Last.fm', function(){
  const song = Steps.getAll(withLivemetaResponse(fixtures))[0];

  it('should have API and Secret configured', () => {
    assert.equal(lastFm.isEnabled(), true);
  });

  it('should try to hint a _now playing_ tune', () => {
    const client = new lastFm('dummy token');

    return client.nowPlaying({
      artist: song.authors,
      track: song.title,
    })
    .catch(({message}) => {
      // it proves the payload is okay
      assert.match(message, /Invalid session key/);
    });
  });

  it('should try to scroll a tune', () => {
    const client = new lastFm('dummy token');

    return client.scrobble({
      artist: song.authors,
      track: song.title,
      when: Date.now() - 120
    })
    .catch(({message}) => {
      // it proves the payload is okay
      assert.match(message, /Invalid session key/);
    });
  });
});
