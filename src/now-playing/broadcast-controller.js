"use strict";

/* globals Broadcast */

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @param {Broadcast} Broadcast
 * @constructor
 */
function BroadcastController($scope, chrome){
  var getPosition = Broadcast.getPositionTracker();
  var stubs = [new Broadcast()];

  $scope.broadcasts = stubs;
  $scope.current_index = null;

  chrome.on("broadcasts", function(broadcasts){
    $scope.broadcasts = broadcasts.length ? broadcasts : stubs;
    $scope.current_index = getPosition(broadcasts, $scope.current_index);
  });

  $scope.previous = function previousBroadcast(){
    if ($scope.current_index > 0){
      $scope.current_index--;
    }
  };

  $scope.next = function nextBroadcast(){
    if ($scope.current_index < $scope.broadcasts.length - 1){
      $scope.current_index++;
    }
  };
}

// And now deal with minification!
BroadcastController.$inject = ['$scope', 'chrome'];
