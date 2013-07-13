"use strict";

/* globals angular, Broadcast */

angular.module('BroadcastService', ['ChromeService'])
  .factory('Broadcasts', function broadcastFactory($http, $compile){
    return {
      "get": function(){
        return $http.get(Broadcast.defaultUri, {params:{_: Date.now()}})
          .then(function broadcastHttpGetSuccess(response){
            var nodes, html;

            html = response.data.html;
            html = html.replace(/\/sites\/all\/modules\/fip\/fip_direct\/images\/direct_default_cover.png/mg, "");

            nodes = $compile(html)({});

            return Broadcast.parseHtmlResponse(nodes.find("div"));
          });
      }
    };
  });