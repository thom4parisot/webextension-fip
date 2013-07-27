"use strict";

/* exported process */
/* global Background, ScrobblingController */
/* jshint -W098 */
var process = Background.init();
var scrobbler = ScrobblingController.init(process);