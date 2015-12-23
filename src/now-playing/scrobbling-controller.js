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
    const cb = chrome.getRedirectURL('auth.html');

    chrome.message(
      'lastfm.auth.request',
      `http://www.last.fm/api/auth?cb=${cb}`
    );
  };
}

ScrobblingController.$inject = ['$scope', 'chrome'];