"use strict";

/* globals angular, Broadcast */

angular.module('BroadcastService', ['ChromeService'])
  .factory('Broadcasts', function broadcastFactory($http, $compile){
    return $http.get(Broadcast.defaultUri, {params:{_: Date.now()}})
      .then(function broadcastHttpGetSuccess(response){
        var nodes = $compile(response.data.html)({});

        return Broadcast.parseHtmlResponse(nodes.find("div"));
      });
  });