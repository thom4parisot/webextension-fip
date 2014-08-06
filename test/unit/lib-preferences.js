"use strict";

describe('Preferences - localStorage', function(){
  var manager;

  beforeEach(function(){
    manager = new Preferences();
    manager.namespace = "test_";    //@todo in the future, use a Symbol
  });

  afterEach(function(){
    var keyMatcher = new RegExp("^" + manager.namespace);

    Object.keys(localStorage).forEach(function(key){
      if (key.match(keyMatcher)){
        localStorage.removeItem(key);
      }
    });
  });

  describe('#constructor', function(){
    it('should have a blank default namespace', function(){
      expect(Preferences.NAMESPACE).to.equal("");
    });

    it('it should have switched over a new test namespace', function(){
      expect(manager.namespace).to.not.equal(Preferences.NAMESPACE);
    });

    it('should have localStorage as a default  strategy', function(){
      expect(manager.strategy).to.equal(Preferences.strategies.localStorage);
    });
  });

  it('#get', function(){
    expect(manager.get("non-existing key")).to.equal(null);
    expect(manager.get(null)).to.equal(null);
    expect(manager.get("")).to.equal(null);
  });

  it('#set', function(){
    expect(manager.get("future key")).to.equal(null);
    manager.set("future key", {foo: "bar"});
    expect(manager.get("future key")).to.eql("[object Object]");
    expect(localStorage.getItem(manager.namespace + "future key")).to.equal(({foo: "bar"}).toString());
  });

  it('#del', function(){
    manager.set("future key", {foo: "bar"});
    manager.del("future key");
    expect(manager.get("future key")).to.eql(null);
  });
});
