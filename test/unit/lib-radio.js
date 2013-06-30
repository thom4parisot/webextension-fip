"use strict";

suite('Radio', function(){
  var radio;

  setup(function(){
    radio = new Radio();
  });

  test('#volume.get', function(){
    expect(radio.playbackVolume).to.equal(100);
    expect(radio.volume()).to.be(radio.playbackVolume);
  });

  test('#volume.set - normal', function(){
    radio.volume(50);
    expect(radio.playbackVolume).to.equal(50);
    expect(radio.volume()).to.be(50);
  });

  test('#volume.set - invalid inputs', function(){
    ["null", null, undefined].forEach(function(volumeValue){
      radio.volume(volumeValue);
      expect(radio.playbackVolume).to.equal(100);
      expect(radio.volume()).to.be(100);
    })
  });
});
