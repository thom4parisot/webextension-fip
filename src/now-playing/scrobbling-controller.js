"use strict";

function ScrobblingController($scope, chrome){
  $scope.scrobblingEnabled = chrome.getPreference("lastfm.scrobbling");

  $scope.$watch("scrobblingEnabled", function(value){
    chrome.message("preferences", {"key": "lastfm.scrobbling", "value": value});
  });

  $scope.$watch("scrobblingEnabled", function(value){
    if (value === "true" && !chrome.getPreference("lastfm.token")){
      chrome.authenticate(
        'http://www.last.fm/api/auth?api_key=5c12c1ed71a519ee5a4ddb140d28f55b&cb='+chrome.getRedirectURL('auth.html'),
        ScrobblingController.checkToken.bind(null, chrome)
      );
    }
  });
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
    console.error('No Auth Token came back from %s', responseUrl);
  }
};

ScrobblingController.$inject = ['$scope', 'chrome'];