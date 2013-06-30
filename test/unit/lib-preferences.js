"use strict";

suite('Preferences - localStorage', function(){
  var manager;

  setup(function(){
    manager = new Preferences();
    manager.namespace = "test_";
  });

  test('#constructor', function(){
    expect(Preferences.NAMESPACE).to.equal("");
    expect(manager.namespace).to.not.equal(Preferences.NAMESPACE);
    expect(manager.strategy).to.be(Preferences.strategies.localStorage);
    expect(new Preferences('localStorage').strategy).to.be(Preferences.strategies.localStorage);
  });

  test('#get', function(){
  });

  test('#set', function(){
  });
});
