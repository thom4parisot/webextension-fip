"use strict";

/**
 * Broadcast object constructor.
 *
 * @param {Object=} data
 * @constructor
 */
function Broadcast(data) {
  var self = this;

  this.date = "";
  this.artist = "";
  this.album = "";
  this.title = "";
  this.cover = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  this.status = null;

  Broadcast.extend(self, data);
}

Broadcast.STATUS_CURRENT = 'current';
Broadcast.STATUS_PREVIOUS = 'previous';
Broadcast.STATUS_NEXT = 'next';

/**
 * Extends a base object with new values
 *
 * @param {Object|Broadcast} object
 * @param {Object=} data
 */
Broadcast.extend = function extend(object, data) {
  Object.keys(data || {}).forEach(function extend(key) {
    if (key in object && data[key] !== "") {
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
//Broadcast.defaultUri = 'http://www.fipradio.fr/sites/default/files/import_si/si_titre_antenne/FIP_player_current.json';
Broadcast.defaultUri = "http://localhost:3000/test/fixtures/working.json";

/**
 * Shorthand to create a node DOM selector value.
 *
 * @param {HTMLElement} container
 * @returns {Function}
 */
Broadcast.createNodeSelector = function createNodeSelector(container) {
  return function getNodeValue(selector, attribute) {
    var node = container.querySelector(selector);

    return node ? (attribute && node.getAttribute(attribute) || node.textContent) : '';
  };
};

/**
 * Parses the remote service response.
 * Deals with complicated stuff to update the UI.
 *
 * @param {{html: String}} responseData
 * @return {Array.<Broadcast>}
 */
Broadcast.parseResponse = function parseResponse(nodes) {
  var currentBroadcastIndex = null;

  return Array.prototype.slice.call(nodes)
    .filter(function nodeFilter(node) {
      return node.classList.contains('direct-item-zoomed');
    })
    .map(function nodeToBroadcastMapper(node) {
      var data = {};
      var select = Broadcast.createNodeSelector(node);

      try {
        data.artist = select('.artiste');
        data.title = select('.titre');
        data.album = select('.album');
        data.date = select('.annee').replace(/[\(\)]/g, '');
        data.cover = select('img', 'src');

        if (node.classList.contains('current') || node.getAttribute("id") === "direct-0"){
          data.status = Broadcast.STATUS_CURRENT;
        }

        if (!/http/.test(data.cover)) {
          delete data.cover;
        }

        return data.title ? new Broadcast(data) : null;
      }
      catch (e) {
        /* jshint devel:true */
        console.error("Parsing error", data);
        return null;
      }
    })
    .map(function(broadcast, index){
      if (broadcast.status === null){
        broadcast.status = (currentBroadcastIndex === null) ? Broadcast.STATUS_PREVIOUS : Broadcast.STATUS_NEXT;
      }
      else if(broadcast.status === Broadcast.STATUS_CURRENT){
        currentBroadcastIndex = index;
      }

      return broadcast;
    });
};

Broadcast.getCurrent = function getCurrent(broadcasts){
  var current = null;

  broadcasts.some(function(broadcast){
    if (broadcast.status === Broadcast.STATUS_CURRENT){
      current = broadcast;
      return true;
    }
  });

  return current;
};

/**
 * Generates a position tracker for a broadcast.
 * Enables to returns the position to activate in a visual carousel for example.
 *
 * @returns {Function}
 */
Broadcast.getPositionTracker = function getPositionTracker(){
  var previous = {
    "size": 0,
    "position": null
  };

  /**
   * Broadcast position generator.
   *
   * @param {Array.<Broadcast>} A list of broadcasts
   * @param {Integer|null} Index of the actually hightlighted Broadcast
   * @returns {Integer} The new position to highlight
   */
  return function positionTracker(broadcasts, current_index){
    var new_index = current_index;

    broadcasts.some(function(b, index){
      if (b.status === Broadcast.STATUS_CURRENT && (index !== previous.position || current_index === null || previous.size !== broadcasts.length)){
        new_index = previous.position = index;
      }
    });

    previous.size = broadcasts.length;

    return new_index;
  };
};