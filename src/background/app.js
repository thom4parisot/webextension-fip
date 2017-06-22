"use strict";

import Background from './controller';
import ScrobblingController from '../lastfm/controller';

Background.init({
  lastfm: ScrobblingController
});
