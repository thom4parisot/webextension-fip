"use strict";

/**
 * Now Playing Controller.
 * Handles bi-directional updates of the popup.
 *
 * @param {ng.Scope} $scope
 * @param {Broadcast} Broadcast
 * @constructor
 */
function NowPlayingController($scope, Broadcast){
  $scope.broadcast = Broadcast.stub();

  function updateUI(broadcast){
    /* jshint devel:true */
    console.log(broadcast);
    $scope.broadcast = broadcast;
  }

  function throttleUpdates(){
    setInterval(function nowPlayingIntervalUpdater(){
      Broadcast.get().then(updateUI);
    }, 30000);
  }

  // Update data and throttle updates if someone gaze at the bubble the whole day
  Broadcast.get().then(updateUI).then(throttleUpdates, throttleUpdates);
}

/**
 * Radio Controller
 *
 * @param {ng.Scope} $scope
 * @constructor
 */
function RadioController($scope){
  $scope.toggle = function toggleRadioControl(){
    chrome.runtime.sendMessage({command: "toggle"});
  };

  chrome.runtime.onMessage.addListener(function(request){
    if (!request.state){
      return;
    }

    console.log(request.state);
  });
}

// And now deal with minification!
NowPlayingController.$inject = ['$scope', 'Broadcast'];
RadioController.$inject = ['$scope'];