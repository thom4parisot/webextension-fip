"use strict";

suite('Broadcast', function(){
  test('new Broadcast', function(){
    expect(new Broadcast()).to.only.have.keys("title", "album", "artist", "cover", "status", "date");
    expect(new Broadcast({ title: "test"}).title).to.equal("test");
  });

  test('#extend', function(){
    var result;

    result = {test: true};
    Broadcast.extend(result);
    expect(result).to.only.have.keys("test");

    result = {test: true};
    Broadcast.extend(result, {test:false, mamie: "nova"});
    expect(result).to.only.have.keys("test");
    expect(result.test).to.equal(false);
  });

  test('#createNodeSelector', function(){
    var select = Broadcast.createNodeSelector(document.querySelector("#node-selector"));

    expect(select(".album")).to.equal("");
    expect(select(".title")).to.equal("I Never Came");
    expect(select(".fake")).to.equal("");
    expect(select("body")).to.equal("");
  });

  test('#parseHtmlResponse', function(){
    expect(Broadcast.parseHtmlResponse(document.querySelectorAll("#empty-list div"))).to.be.empty();
    expect(Broadcast.parseHtmlResponse(document.querySelectorAll("#empty-response div"))).to.be.empty();
  });

  test('#getPositionTracker', function(){
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
