"use strict";

/**
 * Radio Controller
 *
 * @param {ng.Scope} $scope
 * @param {Object} chrome
 * @constructor
 */
function RadioController($scope, chrome){
  $scope.status = chrome.process.radio.state;

  $scope.toggle = function toggleRadioControl(){
    chrome.process.radio.toggle();
  };

  chrome.addListener(function(request){
    if (!request.state){
      return;
    }

    $scope.status = request.state;
    $scope.$apply('');
  });
}

RadioController.$inject = ['$scope', 'chrome'];