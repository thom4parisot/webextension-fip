import Broadcast from '../lib/broadcast';

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @param {Broadcast} Broadcast
 * @constructor
 */
export default function BroadcastController($scope, chrome){
  const getPosition = Broadcast.getPositionTracker();
  const stubs = [new Broadcast()];

  $scope.broadcasts = stubs;
  $scope.current_index = null;

  chrome.on("broadcasts", function(broadcasts){
    $scope.broadcasts = broadcasts.length ? broadcasts : stubs;
    $scope.current_index = getPosition(broadcasts, $scope.current_index);
    $scope.$apply("");
  });

  chrome.message("action", "enableBroadcastUpdates");

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

BroadcastController.$inject = ['$scope', 'chrome'];
