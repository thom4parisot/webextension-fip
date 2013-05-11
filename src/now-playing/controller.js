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

// And now deal with minification!
NowPlayingController.$inject = ['$scope', 'Broadcast'];
RadioController.$inject = ['$scope'];