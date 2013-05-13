"use strict";

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @param {Broadcast} Broadcast
 * @constructor
 */
function BroadcastController($scope, Broadcast){
  $scope.broadcast = Broadcast.stub();

  function updateUI(broadcast){
    /* jshint devel:true */
    console.log(broadcast);
    $scope.broadcast = broadcast;
  }

  function throttleUpdates(){
    setInterval(function nowPlayingIntervalUpdater(){
      Broadcast.get().then(updateUI);
    }, 30000);
  }

  // Update data and throttle updates if someone gaze at the bubble the whole day
  Broadcast.get().then(updateUI).then(throttleUpdates, throttleUpdates);
}

// And now deal with minification!
BroadcastController.$inject = ['$scope', 'Broadcast'];