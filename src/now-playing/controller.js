"use strict";

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @param {ng.Scope} $rootScope
 * @constructor
 */
function NowPlayingController($scope, $rootScope){
  $scope.broadcast = {
    date: "2012",
    artist: "La Danse qui Pense (cd Promo)",
    album: "Morro",
    title: "L'insomnie",
    cover: "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs"
  };

  // Trick to update the title outside the scope (avoids the controller to be global)
  $rootScope.title = chrome.i18n.getMessage('extension_name');
  $rootScope.label = {
    album: chrome.i18n.getMessage('album'),
    artist: chrome.i18n.getMessage('artist')
  };

}

// And now deal with minification!
NowPlayingController.$inject = ['$scope', '$rootScope'];