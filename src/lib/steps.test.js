import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Steps, {artistOf, trackKey} from './steps.js';
import {withLivemetaResponse} from './stations.js';
import fixtures from '../../resources/fixtures/livemeta.json' with { type: 'json' };

describe('Steps', function(){
  const data = withLivemetaResponse(fixtures);

  describe('getAll', () => {
    it('should return an ascending ordered list', () => {
      const titles = Steps.getAll(data).map(d => d.title);

      assert.deepStrictEqual(titles, [
        'Ladies',
        'Holiday (radio edit)',
        'Switched-on',
        'Carousel',
        'shérif',
      ]);
    });
  });

  describe('atTime', () => {
    it('should return a step overlapping a numeric UNIX timestamp', () => {
      const step = Steps.atTime(data, 1794830400000);

      assert.deepStrictEqual(step.title, 'Switched-on');
    });

    it('should return a step starting at a numeric UNIX timestamp', () => {
      const step = Steps.atTime(data, 1794830297000);

      assert.deepStrictEqual(step.title, 'Switched-on');
    });

    it('should return a step based on a Date object', () => {
      const step = Steps.atTime(data, new Date('2026-11-16T12:03:20.000Z'));

      assert.deepStrictEqual(step.title, 'Carousel');
    });
  });

  describe('getCurrent', () => {
    it('should return a step played at the moment', (t) => {
      t.mock.timers.enable({ apis: ['Date'], now: 1794830600000 });
      const step = Steps.getCurrent(data);

      assert.deepStrictEqual(step.title, 'Carousel');
    });
  });

  describe('artistOf', () => {
    it('should prefer the highlighted artist to every credit', () => {
      const authors = 'Vincent Taeger & Le Jazz Kamasutra & Vincent Taeger & Le Jazz Kamasutra & Ludovic Bruni';

      assert.equal(artistOf({ authors, interpreters: ['Vincent Taeger & Le Jazz Kamasutra'] }), 'Vincent Taeger & Le Jazz Kamasutra');
      assert.equal(artistOf({ authors: 'Lee Fields' }), 'Lee Fields');
      assert.equal(artistOf({ authors: 'Lee Fields', interpreters: [] }), 'Lee Fields');
    });
  });

  describe('trackKey', () => {
    it('should identify a track regardless of its broadcast time and case', () => {
      const [first] = Steps.getAll(data);

      assert.equal(trackKey(first), 'lee fields|ladies');
      assert.equal(trackKey({ ...first, start_time: 0 }), trackKey(first));
      assert.equal(trackKey({ authors: 'LEE FIELDS', title: 'Ladies' }), trackKey(first));
      assert.equal(trackKey({ authors: 'Vincent Taeger & Le Jazz Kamasutra & Ludovic Bruni', interpreters: ['Vincent Taeger & Le Jazz Kamasutra'], title: '5th' }), 'vincent taeger & le jazz kamasutra|5th');
    });
  });
});

