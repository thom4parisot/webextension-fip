/**
 * Radio Controller
 *
 * @param {ng.Scope} $scope
 * @constructor
 * @todo use a chrome extension service
 */
function RadioController($scope){
  /* globals chrome */
  $scope.status = chrome.extension.getBackgroundPage().process.radio.state;

  $scope.toggle = function toggleRadioControl(){
    chrome.extension.getBackgroundPage().process.radio.toggle();
  };

  chrome.runtime.onMessage.addListener(function(request){
    if (!request.state){
      return;
    }

    $scope.status = request.state;
    $scope.$apply('');
  });
}

RadioController.$inject = ['$scope'];