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
  var stubs = [new Broadcast()];

  $scope.broadcasts = stubs;

  function updateUI(broadcasts){
    $scope.broadcasts = broadcasts.length ? broadcasts : stubs;
  }

  function throttleUpdates(){
    setInterval(function nowPlayingIntervalUpdater(){
      Broadcasts.then(updateUI);
    }, 30000);
  }

  // Update data and throttle updates if someone gaze at the bubble the whole day
  Broadcasts.then(updateUI).then(throttleUpdates, throttleUpdates);
}

// And now deal with minification!
BroadcastController.$inject = ['$scope', 'Broadcasts'];
