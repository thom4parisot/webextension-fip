"use strict";

function ScrobblingController($scope, chrome){
  $scope.scrobblingEnabled = chrome.getPreference("lastfm.scrobbling");

  $scope.$watch("scrobblingEnabled", function(value){
    chrome.message("preferences", {"key": "lastfm.scrobbling", "value": value});
  });
}

ScrobblingController.$inject = ['$scope', 'chrome'];