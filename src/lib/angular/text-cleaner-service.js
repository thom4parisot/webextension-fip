import angular from 'angular';
import * as TextCleaner from '../text-cleaner.js';

export default angular.module('TextCleanerFilters', [])
  .filter('startsWith', function(){
    return (data, prefix) => Object.keys(data)
      .filter(key => key.indexOf(prefix) === 0)
      .reduce((obj, key) => Object.assign(obj, { [key]: data[key] }), {});
  })
  .filter('album', function(){
    return TextCleaner.doAlbumTitle.bind(TextCleaner);
  })
  .filter('track', function(){
    return TextCleaner.doTrackTitle.bind(TextCleaner);
  })
  .filter('artist', function(){
    return TextCleaner.doArtistName.bind(TextCleaner);
  })
  .filter('mainArtist', function(){
    return TextCleaner.getMainArtistName.bind(TextCleaner);
  });
