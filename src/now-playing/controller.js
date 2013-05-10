"use strict";

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @constructor
 */
function NowPlayingController($scope){
  $scope.broadcast = {
    date: "2012",
    artist: "La Danse qui Pense (cd Promo)",
    album: "Morro",
    title: "L'insomnie",
    cover: "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs"
  };
}

// And now deal with minification!
NowPlayingController.$inject = ['$scope'];