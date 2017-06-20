import angular from 'angular';
import * as TextCleaner from './text-cleaner';

export default angular.module('TextCleanerFilters', [])
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
