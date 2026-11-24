import Broadcast from '../lib/broadcast.js';
import lastFm from '../lib/lastfm.js';
import {stations} from '../lib/stations.js';
import {trackKey} from '../lib/steps.js';

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
  $scope.lastfm_enabled = lastFm.isEnabled() && preferences.get("lastfm.scrobbling") && preferences.get("lastfm.username");

  $scope.canLove = lastFm.isEnabled() && Boolean(preferences.get("lastfm.username"));
  $scope.loved = preferences.get('scrobbling.loved', {});

  $scope.broadcasts = preferences.get('broadcasts', []);
  $scope.current_index = getPosition($scope.broadcasts, $scope.broadcasts.length - 1);

  chrome.on('broadcasts', broadcasts => {
    $scope.broadcasts = broadcasts;
    $scope.current_index = getPosition(broadcasts, $scope.current_index);
    $scope.$apply("");
  });

  preferences.onChange(['scrobbling.loved'], () => {
    $scope.$apply(() => $scope.loved = preferences.get('scrobbling.loved', {}));
  });

  // the displayed track may have been loved elsewhere, such as on Last.fm
  // watched by key: the broadcasts list is replaced every 30 seconds
  $scope.$watch(() => trackKey($scope.broadcasts[$scope.current_index] ?? {}), () => {
    const broadcast = $scope.broadcasts[$scope.current_index];

    if ($scope.canLove && broadcast?.authors) {
      const { authors, interpreters, title } = broadcast;
      chrome.notify('scrobbling.refresh', { authors, interpreters, title });
    }
  });

  $scope.isLoved = broadcast => Boolean($scope.loved[trackKey(broadcast)]?.loved);

  // optimistic update: the background sends it to Last.fm, then updates `scrobbling.loved`
  $scope.toggleLove = function toggleLove({ authors, interpreters, title }){
    const step = { authors, interpreters, title };
    const key = trackKey(step);
    const loved = !$scope.isLoved(step);

    $scope.loved = { ...$scope.loved, [key]: { ...$scope.loved[key], loved } };
    chrome.notify(loved ? 'scrobbling.love' : 'scrobbling.unlove', step);
  };

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
    preferences.set('playback.station', $scope.currentStation);

    $timeout(() => $scope.saveStatus = 'idle', 2000);
  };
}

BroadcastController.$inject = ['$scope', 'chrome', 'preferences', '$timeout'];
