"use strict";

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @param {Broadcast} Broadcast
 * @constructor
 */
function NowPlayingController($scope, Broadcast){
  $scope.broadcast = Broadcast.stub();

  Broadcast.get().then(updateUI).then(throttleUpdates, throttleUpdates);

  function updateUI(broadcast){
    console.log(broadcast);
    $scope.broadcast = broadcast;
  }

  function throttleUpdates(){
    setInterval(function nowPlayingIntervalUpdater(){
      Broadcast.get().then(updateUI);
    }, 30000)
  }
}

// And now deal with minification!
NowPlayingController.$inject = ['$scope', 'Broadcast'];