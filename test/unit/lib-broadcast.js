"use strict";

suite('Broadcast', function(){
  test('new Broadcast', function(){
    expect(new Broadcast()).to.only.have.keys("title", "album", "artist", "cover", "isCurrent", "date");
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
});
