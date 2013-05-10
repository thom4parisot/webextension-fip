"use strict";

angular.module('NowPlayingService', [])
  .factory('Broadcast', function($http, $compile){
    /**
     * Parses the remote service response.
     * Deals with complicated stuff to update the UI.
     *
     * @param {ng.}httpResponse
     */
    function parseHtmlResponse(httpResponse){
      var data = $compile(httpResponse.data.html)({});

      console.log(data);

      return {};
    };

    /**
     *
     * @param data
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
     * Returns a new Broadcast from the remote service.
     *
     * @api
     * @returns {Broadcast}
     */
    Broadcast.get = function(){
      return $http.get('http://www.fipradio.fr/sites/default/files/direct-large.json?_=:date', {date: Date.now()})
        .then(function(response){
          return new Broadcast(parseHtmlResponse(response));
        });
    };

    /**
     * Returns a stub broadcast example.
     * @returns {Broadcast}
     */
    Broadcast.stub = function(){
      return new Broadcast({
        date: "2012",
        artist: "La Danse qui Pense (cd Promo)",
        album: "Morro",
        title: "L'insomnie"
      });
    };

    return Broadcast;
  });