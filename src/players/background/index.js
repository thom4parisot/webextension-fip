import Background from '../../background/controller.js';
import ScrobblingController from '../../lastfm/controller.js';
import BackgroundStrategy from './strategy.js';

Background.init({
  lastfm: ScrobblingController,
  player: new BackgroundStrategy(),
});
