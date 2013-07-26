"use strict";

function AuthController($scope, $location){
  var token = null;

  $location.absUrl().replace(/token=([a-z0-9]{32})/, function(m, value){
    token = value;
  });

  $scope.hasToken = !!token;
}

AuthController.$inject = ['$scope', '$location'];