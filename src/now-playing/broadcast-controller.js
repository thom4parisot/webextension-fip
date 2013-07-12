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
  var previous = {
    "size": 0,
    "position": null
  };

  $scope.broadcasts = stubs;
  $scope.current_index = null;

  function updateUI(broadcasts){
    $scope.broadcasts = broadcasts.length ? broadcasts : stubs;

    //elect the active slide
    broadcasts.some(function(b, index){
      if (b.status === 'current' && (index !== previous.position || $scope.current_index === null || previous.size !== broadcasts.length)){
        $scope.current_index = previous.position = index;
      }
    });

    previous.size = broadcasts.length;
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
