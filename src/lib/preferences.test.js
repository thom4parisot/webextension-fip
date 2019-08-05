import Preferences from '../../src/lib/preferences.js';

describe('Preferences - localStorage', function(){
  var manager;

  beforeEach(function(){
    manager = new Preferences();
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
    it('it should have switched over a new test namespace', function(){
      expect(manager.namespace).not.toBeFalsy();
      expect(manager.namespace).toEqual(process.env.PREFERENCES_NAMESPACE);
    });

    it('should have localStorage as a default  strategy', function(){
      expect(manager.strategy.name).toEqual('localStorage');
    });
  });

  it('#get', function(){
    expect(manager.get("non-existing key")).toEqual(null);
    expect(manager.get(null)).toEqual(null);
    expect(manager.get("")).toEqual(null);
  });

  it('#set', function(){
    expect(manager.get("future key")).toEqual(null);
    manager.set("future key", {foo: "bar"});
    expect(manager.get("future key")).toEqual({foo: "bar"});
    expect(localStorage.getItem(manager.namespace + "future key")).toEqual(JSON.stringify({foo: "bar"}));
  });

  it('#del', function(){
    manager.set("future key", {foo: "bar"});
    manager.del("future key");
    expect(manager.get("future key")).toEqual(null);
  });
});
