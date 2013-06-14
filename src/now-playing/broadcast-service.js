"use strict";

/* globals angular */

angular.module('BroadcastService', ['ChromeService'])
  .factory('Broadcast', function broadcastFactory($http, $compile, translate){
    return Broadcast;
  });