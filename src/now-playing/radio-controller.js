/**
 * Radio Controller
 *
 * @param {ng.Scope} $scope
 * @param {Object} chrome
 * @constructor
 */
export default function RadioController($scope, chrome){
  // chrome.message("radio.get", {}, radio => {
  //   $scope.status = radio.state;
  //   $scope.volume = radio.volume;
  //   $scope.$apply('');
  // });

  $scope.$watch("volume", function(value){
    chrome.message("preferences", {"key": "player.volume", "value": value});
  });

  $scope.toggle = function toggleRadioControl(){
    chrome.message("radio.toggle");
  };

  chrome.addListener(function(request){
    if (!request.state){
      return;
    }

    $scope.status = request.state;
    $scope.$apply('');
  });
}

RadioController.$inject = ['$scope', 'chrome'];
