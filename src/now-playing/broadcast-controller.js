import Broadcast from '../lib/broadcast';

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @param {Broadcast} Broadcast
 * @constructor
 */
export default function BroadcastController($scope, chrome, preferences){
  const getPosition = Broadcast.getPositionTracker();

  $scope.broadcasts = preferences.get('broadcasts');
  $scope.current_index = getPosition($scope.broadcasts, null);

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
}

BroadcastController.$inject = ['$scope', 'chrome', 'preferences', 'browser'];
