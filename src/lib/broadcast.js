/**
 * Service Uri config.
 * Enables to monkey patch for testing purpose.
 *
 * @type {string}
 */

import {isCurrent} from './steps.js';

/**
 * Broadcast object constructor.
 *
 * @param {Object=} data
 * @constructor
 */
export default class Broadcast {
  /**
   * Generates a position tracker for a broadcast.
   * Enables to returns the position to activate in a visual carousel for example.
   *
   * @returns {Function}
   */
  static getPositionTracker(){
    const previous = {
      "size": 0,
      "position": null
    };

    /**
     * Broadcast position generator.
     *
     * @param {Array.<Step>} A list of broadcasts
     * @param {Integer|null} Index of the actually hightlighted Broadcast
     * @returns {Integer} The new position to highlight
     */
    return function positionTracker(steps, current_index){
      let new_index = current_index;

      steps.some((b, index) => {
        if (isCurrent(b) && (index !== previous.position || current_index === null || previous.size !== steps.length)){
          new_index = previous.position = index;
        }
      });

      previous.size = steps.length;

      return new_index;
    };
  }
}
