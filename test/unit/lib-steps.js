import Steps, {extendLinks} from '../../src/lib/steps.js';
import data from '../fixtures/livemeta.json';
import sinon from 'sinon';

describe('Steps', function(){

  describe('getAll', () => {
    it('should return an ascending ordered list', () => {
      const titles = Steps.getAll(data).map(d => d.title)

      expect(titles).to.deep.equal([
        'THE GIRL WITH THE SUN IN HER HAIR',
        'COVER ME OVER',
        'LE SOLEIL EST PRES DE MOI',
        'ON THE BEACH',
        'RICKY S THEME',
        'EVERYBODY LOVES THE SUNSHINE',
      ]);
    });
  });

  describe('atTime', () => {
    it('should return a step overlapping a numeric UNIX timestamp', () => {
      const step = Steps.atTime(data, 1497986000);

      expect(step.title).to.deep.equal('COVER ME OVER');
    });

    it('should return a step starting at a numeric UNIX timestamp', () => {
      const step = Steps.atTime(data, 1497986145);

      expect(step.title).to.deep.equal('LE SOLEIL EST PRES DE MOI');
    });

    it('should return a step based on a Date object', () => {
      const step = Steps.atTime(data, new Date('2017-06-20T19:13:20.000Z'));

      expect(step.title).to.deep.equal('COVER ME OVER');
    });
  });

  describe('getCurrent', () => {
    let clock;

    afterEach(() => {
      clock && clock.restore();
    });

    it('should return a step played at the moment', () => {
      clock = sinon.useFakeTimers(1497986700000);
      const step = Steps.getCurrent(data);

      expect(step.title).to.deep.equal('ON THE BEACH');
    });
  });

  describe('extendLinks', () => {
    it('should be resilient if path does not match a provider', () => {
      expect(extendLinks(null)).to.deep.equal({});
      expect(extendLinks(undefined)).to.deep.equal({});
      expect(extendLinks('')).to.deep.equal({});
      expect(extendLinks('http://example.com/test')).to.deep.equal({});
    });

    it('should detect an Amazon link', () => {
      const link = 'https://www.amazon.fr/Its-Plain-See-Karen-Martin/dp/B00F2W0JWU?SubscriptionId=191V8YQPZDJAWP75C6R2&tag=RF&linkCode=xm2&camp=2025&creative=165953&creativeASIN=B00F2W0JWU';
      expect(extendLinks(link)).to.deep.equal({lienAmazon: link});
    });

    it('should detect an iTunes link', () => {
      const link = 'https://itunes.apple.com/fr/album/i-want-your-love-dimitri-from-paris-remix/401572547?i=401572552&uo=4';
      expect(extendLinks(link)).to.deep.equal({lienItunes: link});
    });
  });
});
