import Broadcast from '../lib/broadcast.js';
import lastFm from '../lib/lastfm.js';
import {stations} from '../lib/stations.js';

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @param {Broadcast} Broadcast
 * @constructor
 */
export default function BroadcastController($scope, chrome, preferences, $timeout){
  const getPosition = Broadcast.getPositionTracker();

  $scope.stations = stations;
  $scope.currentStation = preferences.get('playback.station', 'fip-paris');
  $scope.lastfm_enabled = lastFm.isEnabled() && chrome.hasCapability("identity") && preferences.get("lastfm.scrobbling") && preferences.get("lastfm.username");

  $scope.broadcasts = preferences.get('broadcasts', []);
  $scope.current_index = getPosition($scope.broadcasts, $scope.broadcasts.length - 1);

  chrome.on('broadcasts', broadcasts => {
    $scope.broadcasts = broadcasts;
    $scope.current_index = getPosition(broadcasts, $scope.current_index);
    $scope.$apply("");
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

  $scope.saveStation = function(){
    const prevStation = preferences.get('playback.station', 'fip-paris');
    preferences.set('playback.station', $scope.currentStation);

    if ($scope.currentStation !== prevStation) {
      chrome.notify('playback.reload');
    }

    $timeout(() => $scope.saveStatus = 'idle', 2000);
  };
}

BroadcastController.$inject = ['$scope', 'chrome', 'preferences', '$timeout'];
