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
function BroadcastController($scope, Broadcasts){
  var getPosition = Broadcast.getPositionTracker();
  var stubs = [new Broadcast()];

  $scope.broadcasts = stubs;
  $scope.current_index = null;

  function updateUI(broadcasts){
    $scope.broadcasts = broadcasts.length ? broadcasts : stubs;
    $scope.current_index = getPosition(broadcasts, $scope.current_index);
  }

  function throttleUpdates(){
    setInterval(function nowPlayingIntervalUpdater(){
      Broadcasts.get().then(updateUI);
    }, 30000);
  }

  // Update data and throttle updates if someone gaze at the bubble the whole day
  Broadcasts.get().then(updateUI).then(throttleUpdates, throttleUpdates);
}

// And now deal with minification!
BroadcastController.$inject = ['$scope', 'Broadcasts'];
