import {stations} from '../lib/stations.js';

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

  $scope.save = function(){
    $scope.saveStatus = 'saved';
    preferences.set('playback.station', $scope.currentStation);
    preferences.set('playback.quality', $scope.quality);

    chrome.notify('playback.reload');

    $timeout(() => $scope.saveStatus = 'idle', 2000);
  };
}

OptionsController.$inject = ['$scope', 'chrome', 'preferences', '$timeout'];
