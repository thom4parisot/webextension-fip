"use strict";

/* globals angular, Broadcast */

angular.module('BroadcastService', ['ChromeService'])
  .factory('Broadcasts', function broadcastFactory($http, $compile){
    return {
      "get": function(){
        return $http.get(Broadcast.defaultUri, {params:{_: Date.now()}})
          .then();
      }
    };
  });