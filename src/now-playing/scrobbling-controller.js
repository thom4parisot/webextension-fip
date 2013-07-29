"use strict";

function ScrobblingController($scope, chrome){
  $scope.scrobblingEnabled = chrome.getPreference("lastfm.scrobbling");

  $scope.$watch("scrobblingEnabled", function(value){
    chrome.message("preferences", {"key": "lastfm.scrobbling", "value": value});
  });

  $scope.$watch("scrobblingEnabled", function(value){
    if (value === "true" && !chrome.getPreference("lastfm.token")){
      chrome.newTab("http://www.last.fm/api/auth/?api_key=5c12c1ed71a519ee5a4ddb140d28f55b&cb="+chrome.getUrl("../lastfm/auth.html"));
    }
  });
}

ScrobblingController.$inject = ['$scope', 'chrome'];