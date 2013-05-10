"use strict";

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @param {ng.Resource} NowPlaying
 * @constructor
 */
function NowPlayingController($scope, Broadcast){
  $scope.broadcast = Broadcast.stub();

  Broadcast.get().then(function(broadcast){
    $scope.broadcast = broadcast;
  });
}

// And now deal with minification!
NowPlayingController.$inject = ['$scope', 'Broadcast'];