"use strict";

/* globals angular */

angular.module('lastfm-auth', ['ChromeService'])
  .run(function appRun(){
    document.documentElement.setAttribute('lang', navigator.language);
  });