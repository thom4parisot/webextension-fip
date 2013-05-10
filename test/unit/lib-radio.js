"use strict";

suite('Radio', function(){
  var radio;

  setup(function(){
    radio = new Radio();
  });

  test('Health Check', function(){
    expect(radio.playbackObject).to.be(5);
  });
});