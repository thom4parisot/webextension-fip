"use strict";

function AuthController($scope, $location, chrome){
  var token = null;

  $location.absUrl().replace(/token=([a-z0-9]{32})/, function(m, value){
    token = value;
  });

  chrome.message("preferences", {"key": "lastfm.token", "value": token});
  $scope.hasToken = !!token;
}

AuthController.$inject = ['$scope', '$location', 'chrome'];