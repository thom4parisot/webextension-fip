"use strict";

/**
 * Text Cleaner library
 * It helps cleaning some remote value to improve user experience.
 *
 * @constructor
 */
function TextCleaner(){}

/**
 * Clean the album title.
 *
 * Basically:
 * - trim the content
 * - remove remove promotional edition related strings
 *
 * @api
 * @static
 * @param {String} text
 * @returns {String}
 */
TextCleaner.doAlbumTitle = function doAlbumTitle(text){
  text = text.replace(/\(?\s*(cd|single|ep|lp) promo( fip)?\s*\)?/i, '');

  return text.trim();
};

/**
 * Clean the track title.
 *
 * Basically:
 * - trim the content
 * - clean uncomplete parenthesis
 *
 * @api
 * @static
 * @param {String} text
 * @returns {String}
 */
TextCleaner.doTrackTitle = function doTrackTitle(text){
  text = text.replace(/\([^\)]+(?!\))$/g, '');

  return text.trim();
};

/**
 * Extract artist names from a string
 *
 * @param {String} text
 * @returns {Array.<{{name:String, role:String}}>}
 */
TextCleaner.extractArtistNames = function getArtistNames(text){
  var artists = [];

  //checking if the data structure allows securely splitting it
  if (/^([^\/]+(\/|$))+$/.test(text)){
    text.replace(/([\w]{3} )?([^\/]+)(\/|$)/g, function(m, position, name){
      artists.push({
        name: name.trim(),
        position: position ? position.trim() : null
      });
    });
  }
  else{
    artists.push({ name: text.trim() });
  }

  return artists;
};

/**
 * Clean the artist name.
 *
 * Basically:
 * - trim the content
 * @api
 * @static
 * @param {String} text
 * @returns {String}
 */
TextCleaner.doArtistName = function doArtistName(text){
  return TextCleaner.extractArtistNames(text).map(function(artist){
    return artist.name;
  }).join(', ');
};

/**
 * Extract a simple artist name.
 *
 * Basically:
 * - same as `TextCleaner.doArtistName`
 * - returns the first artist (because usually it is the main one)
 *
 * @api
 * @static
 * @param {String} text
 * @returns {String}
 */
TextCleaner.getMainArtistName = function getMainArtistName(text){
  return TextCleaner.extractArtistNames(text)[0].name;
};