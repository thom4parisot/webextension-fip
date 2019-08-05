import Radio, {states} from './radio.js';

describe('Radio', function(){

  it('should provide a ready-to-be played radio object', () => {
    const r = new Radio();

    expect(r.initialState).toEqual(states.STOPPED);
  });

});
