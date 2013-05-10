"use strict";

/* globals angular, chrome */

angular.module('NowPlayingService', [])
  .factory('Broadcast', function broadcastFactory($http, $compile){
    /**
     * Parses the remote service response.
     * Deals with complicated stuff to update the UI.
     *
     * @param {{html: String}} responseData
     */
    function parseHtmlResponse(responseData){
      var tags = $compile(responseData.html)({});
      var data = {};

      Array.prototype.slice.call(tags).some(function tagParser(tag){
        var current = tag.querySelector('.direct-current');

        if (current){
          try{
            data.artist = current.querySelector('.artiste').textContent;
            data.title = current.querySelector('.titre').textContent;
            data.album = current.querySelector('.album').textContent;
            data.date = current.querySelector('.annee').textContent.replace(/[\(\)]/g, '');
            data.cover = current.querySelector('img').src;

            if (!/http/.test(data.cover)){
              delete data.cover;
            }
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

    /**
     * Broadcast object constructor.
     *
     * @param {Object=} data
     * @constructor
     */
    var Broadcast = function(data){
      this.date = "";
      this.artist = "";
      this.album = "";
      this.title = chrome.i18n.getMessage('no_information');
      this.cover = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

      angular.extend(this, data);
    };

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

    return Broadcast;
  });