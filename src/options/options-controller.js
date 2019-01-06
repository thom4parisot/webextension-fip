import {stations} from '../lib/stations.js';
import lastFm from '../lib/lastfm.js';

/**
 * Options Controller
 *
 * @param {ng.Scope} $scope
 * @param {Object} chrome
 * @constructor
 */
export default function OptionsController($scope, chrome, preferences, $timeout){
  $scope.stations = stations;

  $scope.currentStation = preferences.get('playback.station', 'fip-paris');
  $scope.quality = preferences.get('playback.quality', 'hd');
  $scope.saveStatus = 'idle';
  $scope.lastfm_enabled = lastFm.isEnabled();

  $scope.save = function(){
    const prevStation = preferences.get('playback.station', 'fip-paris');
    const prevQuality = preferences.get('playback.quality', 'hd');

    $scope.saveStatus = 'saved';
    preferences.set('playback.station', $scope.currentStation);
    preferences.set('playback.quality', $scope.quality);

    if ($scope.currentStation !== prevStation || $scope.quality !== prevQuality) {
      chrome.notify('playback.reload');
    }

    $timeout(() => $scope.saveStatus = 'idle', 2000);
  };
}

OptionsController.$inject = ['$scope', 'chrome', 'preferences', '$timeout'];
