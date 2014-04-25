"use strict";

function ScrobblingController($scope, chrome){
  $scope.scrobblingEnabled = chrome.getPreference("lastfm.scrobbling") && chrome.getPreference("lastfm.username");

  $scope.lastfmUsername = chrome.getPreference("lastfm.username");

  $scope.$watch("scrobblingEnabled", function(value){
    chrome.message("preferences", {"key": "lastfm.scrobbling", "value": value});
  });

  chrome.on("lastfm.auth.success", function(data){
    $scope.lastfmUsername = data.userName;
    $scope.scrobblingEnabled = true;
    $scope.$apply("");
  });

  $scope.startAuthentication = function(){
    chrome.authenticate(
      'http://www.last.fm/api/auth?api_key=5c12c1ed71a519ee5a4ddb140d28f55b&cb='+chrome.getRedirectURL('auth.html'),
      ScrobblingController.checkToken.bind(null, chrome)
    );
  };
}

ScrobblingController.checkToken = function checkAuthToken(chrome, responseUrl){
  var token = null;

  responseUrl.replace(/token=([a-z0-9]{32})/, function(m, value){
    token = value;
  });

  if (token){
    chrome.message("preferences", {"key": "lastfm.token", "value": token});
  }
  else {
    /* jshint devel: true */
    console.error('No Auth Token came back from %s', responseUrl);
    /* jshint devel: false */
  }
};

ScrobblingController.$inject = ['$scope', 'chrome'];