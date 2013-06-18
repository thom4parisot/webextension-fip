/**
 * Broadcast object constructor.
 *
 * @param {Object=} data
 * @constructor
 */
function Broadcast(data){
  var self = this;

  this.date = "";
  this.artist = "";
  this.album = "";
  this.title = 'no_information';
  this.cover = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  this.isCurrent = false;

  Broadcast.extend(self, data);
}

/**
 * Extends a base object with new values
 *
 * @param {Object|Broadcast} object
 * @param {Object} data
 */
Broadcast.extend = function extend(object, data){
  Object.keys(data).forEach(function extend(key){
    if (key in object && data[key] !== ""){
      object[key] = data[key];
    }
  });
};

/**
 * Service Uri config.
 * Enables to monkey patch for testing purpose.
 *
 * @type {string}
 */
Broadcast.defaultUri = 'http://www.fipradio.fr/sites/default/files/direct-large.json?_=:date';

/**
 * Returns a stub broadcast example.
 * @returns {Broadcast}
 */
Broadcast.stub = function broadcastStub(){
  return new Broadcast({
    date: "2012",
    album: "La Danse qui Pense (cd Promo)",
    artist: "Morro",
    title: "L'insomnie",
    isCurrent: true
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
 * @return {Array.<Broadcast>}
 */
Broadcast.parseHtmlResponse = function parseHtmlResponse(nodes){
  var getNodeValue = Broadcast.getNodeValue;

  return Array.prototype.slice.call(nodes)
    .filter(function tagParser(node){
      return node.classList.contains('direct-item');
    })
    .map(function(node){
      var data = {};

      try{
	data.artist = getNodeValue(node, '.artiste');
	data.title = getNodeValue(node, '.titre');
	data.album = getNodeValue(node, '.album');
	data.date = getNodeValue(node, '.annee').replace(/[\(\)]/g, '');
	data.cover = getNodeValue(node, 'img', 'src');
	data.isCurrent = node.classList.contains('current');

	if (!/http/.test(data.cover)){
	  delete data.cover;
	}

	return data.title ? new Broadcast(data) : null;
      }
      catch(e){
	/* jshint devel:true */
	console.error("Parsing error", data);
	return null;
      }
    });
}