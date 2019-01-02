import lastFm from '../../src/lib/lastfm.js';

describe('Last.fm', function(){
  it('should have API and Secret configured', () => {
    expect(lastFm.isEnabled()).to.be.true;
  });
});
