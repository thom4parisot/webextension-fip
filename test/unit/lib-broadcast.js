"use strict";

describe('Broadcast', function(){
  it('new Broadcast', function(){
    expect(function(){ new Broadcast() }).to.not.throw();
  });

  describe('#extend', function(){

    it('should return an identical object if the second argument is empty', function(){
      var result = {test: true};

      Broadcast.extend(result);
      expect(result).to.deep.equal({ test: true });
    });

    it('should update only the test value', function(){
      var result = {test: true};

      Broadcast.extend(result, {test:false, mamie: "nova"});
      expect(result).to.deep.equal({ test: false });
    });
  });

  describe('#parseResponse', function(){
    it('it should parse a valid JSON response', function(){
      var results = Broadcast.parseResponse(window.__fixtures__['test/fixtures/working']);

      expect(results[0]).to.deep.equal({
        "date": "1996",
        "artist": "PAOLO CONTE",
        "link": "https://itunes.apple.com/fr/album/come-di/id212024925?i=212025067&uo=4",
        "startTime": 1407343605,
        "endTime": 1407343842,
        "title": "COME DI",
        "album": "THE BEST OF",
        "cover": "http://a1.mzstatic.com/us/r30/Music/c7/97/bb/mzi.iqpykysk.100x100-75.jpg",
        "status": Broadcast.STATUS_CURRENT
      });
    });

    it('it should parse a valid empty JSON response', function(){
      var results = Broadcast.parseResponse(window.__fixtures__['test/fixtures/empty-list']);

      expect(results).to.be.an('array').and.to.be.empty;
    });
  });

  it('#getPositionTracker', function(){
    var broadcasts = [new Broadcast(), new Broadcast(), new Broadcast(), new Broadcast({status: Broadcast.STATUS_CURRENT})];
    var tracker = Broadcast.getPositionTracker();

    expect(tracker(broadcasts, 0)).to.equal(3);   //first time, we shift to the current broadcast
    expect(tracker(broadcasts, 3)).to.equal(3);   //we should keep the same index
    expect(tracker(broadcasts, 0)).to.equal(0);   //the user has manually shifted somewhere else

    broadcasts.unshift(new Broadcast());
    expect(tracker(broadcasts, 3)).to.equal(4);   //the array changed, we now ignore the user change
    expect(tracker(broadcasts, 4)).to.equal(4);   //we should keep the same index
    expect(tracker(broadcasts, 2)).to.equal(2);   //the user has manually shifted somewhere else

    broadcasts[4].status = null;
    broadcasts[2].status = Broadcast.STATUS_CURRENT;
    expect(tracker(broadcasts, 4)).to.equal(2);   //the current position changed in the array, we ignore the user change
    expect(tracker(broadcasts, 2)).to.equal(2);   //we should keep the same index
    expect(tracker(broadcasts, 4)).to.equal(4);   //the user has manually shifted somewhere else
  });
});
