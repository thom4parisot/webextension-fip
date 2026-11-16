import angular from 'angular';

import ChromeService, {preferences} from '../lib/angular/chrome-service.js';
import TextFilters from '../lib/angular/text-service.js';
import debug from '../lib/debug.js';

import OptionsController from './options-controller.js';
import ScrobblingController from './scrobbling-controller.js';


const App = angular.module('options', ['ChromeService', 'TextFilters']).run(() => {
  document.documentElement.setAttribute('lang', navigator.language);
});

App.controller('OptionsController', OptionsController);
App.controller('ScrobblingController', ScrobblingController);

preferences.ready()
  .then(() => angular.bootstrap(document.documentElement, [App.name]))
  .catch(debug);
