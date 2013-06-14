/**
 * Broadcast object constructor.
 *
 * @param {Object=} data
 * @constructor
 */
function Broadcast(data){
  this.date = "";
  this.artist = "";
  this.album = "";
  this.title = translate('no_information');
  this.cover = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  angular.extend(this, data);
}

/**
 * Service Uri config.
 * Enables to monkey patch for testing purpose.
 *
 * @type {string}
 */
Broadcast.defaultUri = 'http://www.fipradio.fr/sites/default/files/direct-large.json?_=:date';

/**
 * Returns a new Broadcast from the remote service.
 *
 * @api
 * @returns {Broadcast}
 */
Broadcast.get = function broadcastGet(){
  return $http.get(Broadcast.defaultUri, {date: Date.now()})
    .then(function broadcastHttpGetSuccess(response){
      return new Broadcast(parseHtmlResponse(response.data));
    });
};

/**
 * Returns a stub broadcast example.
 * @returns {Broadcast}
 */
Broadcast.stub = function broadcastStub(){
  return new Broadcast({
    date: "2012",
    artist: "La Danse qui Pense (cd Promo)",
    album: "Morro",
    title: "L'insomnie"
  });
};

Broadcast.getNodeValue = function getNodeValue(container, selector, attribute){
  var node = container.querySelector(selector);

  return node ? node[attribute || 'textContent'] : '';
}

/**
 * Parses the remote service response.
 * Deals with complicated stuff to update the UI.
 *
 * @param {{html: String}} responseData
 */
Broadcast.parseHtmlResponse = function parseHtmlResponse(responseData){
  var tags = $compile(responseData.html)({});
  var data = {};
  var getNodeValue = Broadcast.getNodeValue;

  var broadcasts = Array.prototype.slice.call(tags).map(function tagParser(tag){
    var current = tag.querySelector('.direct-current');

    if (current){
      try{
	data.artist = getNodeValue(current, '.artiste');
	data.title = getNodeValue(current, '.titre');
	data.album = getNodeValue(current, '.album');
	data.date = getNodeValue(current, '.annee').replace(/[\(\)]/g, '');
	data.cover = getNodeValue(current, 'img', 'src');

	if (!/http/.test(data.cover)){
	  delete data.cover;
	}

	return data
      }
      catch(e){
	/* jshint devel:true */
	console.error("Parsing error", data);
      }

      return true;
    }
  });

  return data;
}