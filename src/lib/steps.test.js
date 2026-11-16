import Steps from './steps.js';
import {withLivemetaResponse} from './stations.js';
import fixtures from '../../resources/fixtures/livemeta.json';
import sinon from 'sinon';

describe('Steps', function(){
  const data = withLivemetaResponse(fixtures);

  describe('getAll', () => {
    it('should return an ascending ordered list', () => {
      const titles = Steps.getAll(data).map(d => d.title);

      expect(titles).toEqual([
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

      expect(step.title).toEqual('Switched-on');
    });

    it('should return a step starting at a numeric UNIX timestamp', () => {
      const step = Steps.atTime(data, 1794830297000);

      expect(step.title).toEqual('Switched-on');
    });

    it('should return a step based on a Date object', () => {
      const step = Steps.atTime(data, new Date('2026-11-16T12:03:20.000Z'));

      expect(step.title).toEqual('Carousel');
    });
  });

  describe('getCurrent', () => {
    let clock;

    afterEach(() => {
      clock && clock.restore();
    });

    it('should return a step played at the moment', () => {
      clock = sinon.useFakeTimers(1794830600000);
      const step = Steps.getCurrent(data);

      expect(step.title).toEqual('Carousel');
    });
  });
});
