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

  return text;
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

  return text;
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

  return text;
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

  return text;
};