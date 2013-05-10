"use strict";

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @constructor
 */
function NowPlayingController($scope){
  $scope.title = chrome.i18n.getMessage('extension_name');

  $scope.broadast = {
    date: "2012",
    artist: "La Danse qui Pense (cd Promo)",
    album: "Morro",
    title: "L'insomnie",
    cover: "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs"
  };
}