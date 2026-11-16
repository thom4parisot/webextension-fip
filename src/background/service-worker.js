import Background from './controller.js';
import ScrobblingController from '../lastfm/controller.js';
import OffscreenStrategy from '../players/offscreen/strategy.js';

Background.init({
  lastfm: ScrobblingController,
  player: new OffscreenStrategy(),
});
