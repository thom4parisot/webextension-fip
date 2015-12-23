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
export function doAlbumTitle(text) {
  return text.replace(/\(?\s*(cd|single|ep|lp) promo( fip)?\s*\)?/i, '').trim();
}

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
export function doTrackTitle(text) {
  return text.replace(/\([^\)]+(?!\))$/g, '').trim();
}

/**
 * Extract artist names from a string
 *
 * @param {String} text
 * @returns {Array.<{name:String,role:String}>}
 */
export function getArtistNames(text){
  const artists = [];

  //checking if the data structure allows securely splitting it
  //"Lou Reed" is a good example of single artist with a first name possibly recognizable as a 'position' in a band
  if (text.indexOf('/') !== -1 && /^([^\/]+(\/|$))+$/.test(text)){
    text.replace(/([a-z]{2,3} )?([^\/]+)(\/|$)/g, function(m, position, name){
      artists.push({
        name: name.trim(),
        position: position ? position.trim() : null
      });
    });
  }
  else{
    artists.push({ name: text.trim(), role: null });
  }

  return artists;
}

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
export function doArtistName(text){
  return getArtistNames(text).map(artist => artist.name).join(', ');
}

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
export function getMainArtistName(text){
  return getArtistNames(text)[0].name;
}
