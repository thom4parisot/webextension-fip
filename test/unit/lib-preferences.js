"use strict";

suite('Preferences - localStorage', function(){
  var manager;

  setup(function(){
    manager = new Preferences();
    manager.namespace = "test_";    //@todo in the future, use a Symbol
  });

  teardown(function(){
    var keyMatcher = new RegExp("^" + manager.namespace);

    Object.keys(localStorage).forEach(function(key){
      if (key.match(keyMatcher)){
        localStorage.removeItem(key);
      }
    });
  });

  test('#constructor', function(){
    expect(Preferences.NAMESPACE).to.equal("");
    expect(manager.namespace).to.not.equal(Preferences.NAMESPACE);
    expect(manager.strategy).to.be(Preferences.strategies.localStorage);
    expect(new Preferences('localStorage').strategy).to.be(Preferences.strategies.localStorage);
  });

  test('#get', function(){
    expect(manager.get("non-existing key")).to.equal(null);
    expect(manager.get(null)).to.equal(null);
    expect(manager.get("")).to.equal(null);
  });

  test('#set', function(){
    expect(manager.get("future key")).to.equal(null);
    manager.set("future key", {foo: "bar"});
    expect(manager.get("future key")).to.eql("[object Object]");
    expect(localStorage.getItem(manager.namespace + "future key")).to.be(({foo: "bar"}).toString());
  });

  test('#del', function(){
    manager.set("future key", {foo: "bar"});
    manager.del("future key");
    expect(manager.get("future key")).to.eql(null);
  });
});
