"use strict";

/* globals angular */

angular.module('lastfm-auth', [])
  .run(function appRun(){
    document.documentElement.setAttribute('lang', navigator.language);
  });