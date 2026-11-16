import Background from '../../background/controller.js';
import ScrobblingController from '../../lastfm/controller.js';
import TabStrategy from '../tab/strategy.js';
import BackgroundStrategy from './strategy.js';

// Firefox for Android refuses to play audio from the background page
const isAndroid = navigator.userAgent.includes('Android');

Background.init({
  lastfm: ScrobblingController,
  player: isAndroid ? new TabStrategy() : new BackgroundStrategy(),
});
