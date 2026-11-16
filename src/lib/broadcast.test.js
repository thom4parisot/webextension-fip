import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Broadcast from './broadcast.js';

describe('Broadcast', function(){
  it.skip('#getPositionTracker', function(){
    var broadcasts = [new Broadcast(), new Broadcast(), new Broadcast(), new Broadcast({status: 'current'})];
    var tracker = Broadcast.getPositionTracker();

    assert.deepStrictEqual(tracker(broadcasts, 0), 3);   //first time, we shift to the current broadcast
    assert.deepStrictEqual(tracker(broadcasts, 3), 3);   //we should keep the same index
    assert.deepStrictEqual(tracker(broadcasts, 0), 0);   //the user has manually shifted somewhere else

    broadcasts.unshift(new Broadcast());
    assert.deepStrictEqual(tracker(broadcasts, 3), 4);   //the array changed, we now ignore the user change
    assert.deepStrictEqual(tracker(broadcasts, 4), 4);   //we should keep the same index
    assert.deepStrictEqual(tracker(broadcasts, 2), 2);   //the user has manually shifted somewhere else

    broadcasts[4].status = null;
    broadcasts[2].status = 'current';
    assert.deepStrictEqual(tracker(broadcasts, 4), 2);   //the current position changed in the array, we ignore the user change
    assert.deepStrictEqual(tracker(broadcasts, 2), 2);   //we should keep the same index
    assert.deepStrictEqual(tracker(broadcasts, 4), 4);   //the user has manually shifted somewhere else
  });
});
