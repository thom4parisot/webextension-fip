/**
 * Icon of the playback button, for each radio state. Others show `circle-play`.
 */
const PLAYBACK_ICONS = {
  BUFFERING: 'loader-circle',
  OFFLINE: 'circle-pause',
  PLAYING: 'circle-pause',
};

/**
 * Radio Controller
 *
 * @param {ng.Scope} $scope
 * @param {Object} chrome
 * @constructor
 */
export default function RadioController($scope, chrome, preferences){
  $scope.status = preferences.get('radio.state');
  $scope.volume = preferences.get('radio.volume', 0.8);
  $scope.toggle = () => chrome.notify('radio.toggle');
  $scope.playbackIcon = () => PLAYBACK_ICONS[$scope.status] ?? 'circle-play';
  $scope.volumeIcon = () => {
    const { volume } = $scope;

    if (volume === 0) {
      return 'volume-x';
    }

    return volume < 0.3 ? 'volume' : volume < 0.7 ? 'volume-1' : 'volume-2';
  };

  $scope.$watch('volume', value => chrome.notify('radio.volume', value));

  chrome.on('state', status => {
    $scope.status = status;
    $scope.$apply('');
  });
}

RadioController.$inject = ['$scope', 'chrome', 'preferences'];
