"use strict";

describe('Radio', function(){
  var radio;

  beforeEach(function(){
    radio = new Radio();
  });

  it('#volume.get', function(){
    expect(radio.playbackVolume).to.equal(100);
    expect(radio.volume()).to.equal(radio.playbackVolume);
  });

  it('#volume.set - normal', function(){
    radio.volume(50);
    expect(radio.playbackVolume).to.equal(50);
    expect(radio.volume()).to.equal(50);
  });

  it('#volume.set - invalid inputs', function(){
    ["null", null, undefined].forEach(function(volumeValue){
      radio.volume(volumeValue);
      expect(radio.playbackVolume).to.equal(100);
      expect(radio.volume()).to.equal(100);
    })
  });
});
