"use strict";

/* exported process */
/* global Background */
var process = Background.init();
var scrobbler = ScrobblingController.init(process);