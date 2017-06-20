import Preferences from '../../src/lib/preferences';

process.env.PREFERENCES_NAMESPACE = Symbol('test').toString();

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
      expect(manager.namespace).to.equal(process.env.PREFERENCES_NAMESPACE);
    });

    it('should have localStorage as a default  strategy', function(){
      expect(manager.strategy.name).to.equal('localStorage');
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
    expect(manager.get("future key")).to.eql({foo: "bar"});
    expect(localStorage.getItem(manager.namespace + "future key")).to.equal(JSON.stringify({foo: "bar"}));
  });

  it('#del', function(){
    manager.set("future key", {foo: "bar"});
    manager.del("future key");
    expect(manager.get("future key")).to.eql(null);
  });
});
