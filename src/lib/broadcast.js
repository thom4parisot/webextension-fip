"use strict";

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
  this.title = "";
  this.cover = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  this.isCurrent = false;

  Broadcast.extend(self, data);
}

/**
 * Extends a base object with new values
 *
 * @param {Object|Broadcast} object
 * @param {Object=} data
 */
Broadcast.extend = function extend(object, data){
  Object.keys(data || {}).forEach(function extend(key){
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
 * Shorthand to create a node DOM selector value.
 *
 * @param {HTMLElement} container
 * @returns {Function}
 */
Broadcast.createNodeSelector = function createNodeSelector(container){
  return function getNodeValue(selector, attribute){
    var node = container.querySelector(selector);

    return node ? node[attribute || 'textContent'] : '';
  };
};

/**
 * Parses the remote service response.
 * Deals with complicated stuff to update the UI.
 *
 * @param {{html: String}} responseData
 * @return {Array.<Broadcast>}
 */
Broadcast.parseHtmlResponse = function parseHtmlResponse(nodes){
  return Array.prototype.slice.call(nodes)
    .filter(function nodeFilter(node){
      return node.classList.contains('direct-item');
    })
    .map(function nodeToBroadcastMapper(node){
      var data = {};
      var select = Broadcast.createNodeSelector(node);

      try{
	data.artist = select('.artiste');
	data.title = select('.titre');
	data.album = select('.album');
	data.date = select('.annee').replace(/[\(\)]/g, '');
	data.cover = select('img', 'src');
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
};