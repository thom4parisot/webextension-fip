import Steps from './steps.js';
import {withHistoryResponse} from './stations.js';
import fixtures from '../../resources/fixtures/history.json';
import sinon from 'sinon';

describe('Steps', function(){
  const data = withHistoryResponse(fixtures);

  describe('getAll', () => {
    it('should return an ascending ordered list', () => {
      const titles = Steps.getAll(data).map(d => d.title);

      expect(titles).toEqual([
        'Igualito que el tango',
        'Sonate en Ré Maj op 3 n°1 : Allegro - pour violoncelle et basse continue',
        'Let\'s call it a day',
        'Get yourself together',
        'Nuits bleues',
        'Night And Day',
        'Make it last',
        'Eternal / Internal peace',
        'Sky Islands',
        'Naima',
      ]);
    });
  });

  describe('atTime', () => {
    it('should return a step overlapping a numeric UNIX timestamp', () => {
      const step = Steps.atTime(data, 1565024242);

      expect(step.title).toEqual('Get yourself together');
    });

    it('should return a step starting at a numeric UNIX timestamp', () => {
      const step = Steps.atTime(data, 1565024247);

      expect(step.title).toEqual('Nuits bleues');
    });

    it('should return a step based on a Date object', () => {
      const step = Steps.atTime(data, new Date('2019-08-05T16:58:00.000Z'));

      expect(step.title).toEqual('Nuits bleues');
    });
  });

  describe('getCurrent', () => {
    let clock;

    afterEach(() => {
      clock && clock.restore();
    });

    it('should return a step played at the moment', () => {
      clock = sinon.useFakeTimers(1565024247000);
      const step = Steps.getCurrent(data);

      expect(step.title).toEqual('Nuits bleues');
    });
  });
});
