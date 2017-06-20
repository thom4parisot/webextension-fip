/**
 * Radio Controller
 *
 * @param {ng.Scope} $scope
 * @param {Object} chrome
 * @constructor
 */
export default function RadioController($scope, chrome, preferences){
  $scope.status = preferences.get('radio.state');

  $scope.toggle = () => chrome.notify('radio.toggle');

  chrome.addListener(function(request){
    if (!request.state){
      return;
    }

    $scope.status = request.state;
    $scope.$apply('');
  });
}

RadioController.$inject = ['$scope', 'chrome'];
