export default function ScrobblingController($scope, chrome){
  $scope.scrobblingEnabled = chrome.getPreference("lastfm.scrobbling");

  $scope.lastfmUsername = chrome.getPreference("lastfm.username");

  $scope.$watch("scrobblingEnabled", function(value){
    chrome.message("preferences", {"key": "lastfm.scrobbling", "value": value});
  });

  chrome.on("lastfm.auth.success", function(data){
    $scope.lastfmUsername = data.userName;
    $scope.scrobblingEnabled = true;
    $scope.$apply("");
  });

  $scope.startAuthentication = function(){
    chrome.message(
      "lastfm.auth.request",
      'http://www.last.fm/api/auth?api_key=5c12c1ed71a519ee5a4ddb140d28f55b&cb='+chrome.getRedirectURL('auth.html')
    );
  };
}

ScrobblingController.$inject = ['$scope', 'chrome'];