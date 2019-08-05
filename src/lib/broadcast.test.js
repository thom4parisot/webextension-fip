import Broadcast from './broadcast.js';

describe('Broadcast', function(){
  xit('#getPositionTracker', function(){
    var broadcasts = [new Broadcast(), new Broadcast(), new Broadcast(), new Broadcast({status: 'current'})];
    var tracker = Broadcast.getPositionTracker();

    expect(tracker(broadcasts, 0)).toEqual(3);   //first time, we shift to the current broadcast
    expect(tracker(broadcasts, 3)).toEqual(3);   //we should keep the same index
    expect(tracker(broadcasts, 0)).toEqual(0);   //the user has manually shifted somewhere else

    broadcasts.unshift(new Broadcast());
    expect(tracker(broadcasts, 3)).toEqual(4);   //the array changed, we now ignore the user change
    expect(tracker(broadcasts, 4)).toEqual(4);   //we should keep the same index
    expect(tracker(broadcasts, 2)).toEqual(2);   //the user has manually shifted somewhere else

    broadcasts[4].status = null;
    broadcasts[2].status = 'current';
    expect(tracker(broadcasts, 4)).toEqual(2);   //the current position changed in the array, we ignore the user change
    expect(tracker(broadcasts, 2)).toEqual(2);   //we should keep the same index
    expect(tracker(broadcasts, 4)).toEqual(4);   //the user has manually shifted somewhere else
  });
});
