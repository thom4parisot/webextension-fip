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

  $scope.$watch('volume', value => chrome.notify('radio.volume', value));

  chrome.on('state', status => {
    $scope.status = status;
    $scope.$apply('');
  });
}

RadioController.$inject = ['$scope', 'chrome', 'preferences'];
