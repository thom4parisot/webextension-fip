import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import Broadcast from './broadcast.js';

/**
 * A step lasting one second, `index` seconds after the epoch.
 */
const stepAt = index => ({ start_time: index * 1000, end_time: (index + 1) * 1000 });

describe('Broadcast', function(){
  it('#getPositionTracker', function(t){
    const broadcasts = [stepAt(0), stepAt(1), stepAt(2), stepAt(3)];
    const tracker = Broadcast.getPositionTracker();

    t.mock.timers.enable({ apis: ['Date'], now: 3000 });

    assert.equal(tracker(broadcasts, 0), 3);   //first time, we shift to the current broadcast
    assert.equal(tracker(broadcasts, 3), 3);   //we should keep the same index
    assert.equal(tracker(broadcasts, 0), 0);   //the user has manually shifted somewhere else

    broadcasts.unshift(stepAt(-1));
    assert.equal(tracker(broadcasts, 3), 4);   //the array changed, we now ignore the user change
    assert.equal(tracker(broadcasts, 4), 4);   //we should keep the same index
    assert.equal(tracker(broadcasts, 2), 2);   //the user has manually shifted somewhere else

    t.mock.timers.setTime(1000);
    assert.equal(tracker(broadcasts, 4), 2);   //the current position changed in the array, we ignore the user change
    assert.equal(tracker(broadcasts, 2), 2);   //we should keep the same index
    assert.equal(tracker(broadcasts, 4), 4);   //the user has manually shifted somewhere else
  });
});
