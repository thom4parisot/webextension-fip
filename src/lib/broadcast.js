/**
 * Service Uri config.
 * Enables to monkey patch for testing purpose.
 *
 * @type {string}
 */

const STATUS_CURRENT = 'current';
const STATUS_PREVIOUS = 'previous';
const STATUS_NEXT = 'next';

const FIP_NOW_PLAYING_URI = (process.env.OFFLINE === 'true')
  ? `http://localhost:${process.env.PORT || 3000}/test/fixtures/working.json`
  : 'http://www.fipradio.fr/sites/default/files/import_si/si_titre_antenne/FIP_player_current.json';

/**
 * Broadcast object constructor.
 *
 * @param {Object=} data
 * @constructor
 */
export default class Broadcast {
  constructor (data) {
    this.date = "";
    this.artist = "";
    this.album = "";
    this.title = "";
    this.cover = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    this.status = null;

    // new since July 2014
    this.link = "";
    this.startTime = 0;
    this.endTime = 0;

    Object.assign(this, data);
  }

  static getUri() {
    return FIP_NOW_PLAYING_URI;
  }


  /**
   * Generates a position tracker for a broadcast.
   * Enables to returns the position to activate in a visual carousel for example.
   *
   * @returns {Function}
   */
  static getPositionTracker(){
    var previous = {
      "size": 0,
      "position": null
    };

    /**
     * Broadcast position generator.
     *
     * @param {Array.<Broadcast>} A list of broadcasts
     * @param {Integer|null} Index of the actually hightlighted Broadcast
     * @returns {Integer} The new position to highlight
     */
    return function positionTracker(broadcasts, current_index){
      var new_index = current_index;

      broadcasts.some(function(b, index){
        if (b.status === STATUS_CURRENT && (index !== previous.position || current_index === null || previous.size !== broadcasts.length)){
          new_index = previous.position = index;
        }
      });

      previous.size = broadcasts.length;

      return new_index;
    };
  }

  static getCurrent(broadcasts){
    var current = null;

    broadcasts.some(function(broadcast){
      if (broadcast.status === STATUS_CURRENT){
        current = broadcast;
        return true;
      }
    });

    return current;
  }

  /**
   * Parses the remote service response.
   * Deals with complicated stuff to update the UI.
   *
   * @param {Object} jsonResponse
   * @return {Array.<Broadcast>}
   */
  static parseResponse(jsonResponse) {
    return Object.keys(jsonResponse)
      .map(function nodeToBroadcastMapper(key) {
        var data = {};
        var songData = jsonResponse[key].song || {};

        data.artist = songData.interpreteMorceau;
        data.title = songData.titre;
        data.album = songData.titreAlbum;
        data.date = songData.anneeEditionMusique;
        data.cover = songData.visuel && songData.visuel.small;

        data.startTime = songData.startTime;
        data.endTime = songData.endTime;
        data.link = songData.lien;

        if (key === 'current') {
          data.status = STATUS_CURRENT;
        }
        else if (key.match(/^next/)) {
          data.status = STATUS_NEXT;
        }
        else if (key.match(/^previous/)){
          data.status = STATUS_PREVIOUS;
        }

        return data.title ? new Broadcast(data) : null;
      })
      .filter(function(b){ return b; })
      .sort(function sortByStartTime(a, b){
        return a.startTime - b.startTime;
      });
  }
}