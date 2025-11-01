/**
 * Unit tests for timer module
 *
 * Tests time limit calculations, countdown timer functionality,
 * pause/resume, cleanup, and edge cases.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getTimeLimit,
  createTimer,
  getBaseTime,
  getAllBaseTimes
} from '../../src/core/timer.js';

// Test suite: getTimeLimit()
test('getTimeLimit - calculates correct time for level 0 (new)', () => {
  const command = { level: 0, complexity: 1.0 };
  assert.equal(getTimeLimit(command), 5.0);
});

test('getTimeLimit - calculates correct time for level 1 (learning)', () => {
  const command = { level: 1, complexity: 1.0 };
  assert.equal(getTimeLimit(command), 3.0);
});

test('getTimeLimit - calculates correct time for level 2 (familiar)', () => {
  const command = { level: 2, complexity: 1.0 };
  assert.equal(getTimeLimit(command), 2.0);
});

test('getTimeLimit - calculates correct time for level 3 (confident)', () => {
  const command = { level: 3, complexity: 1.0 };
  assert.equal(getTimeLimit(command), 1.5);
});

test('getTimeLimit - calculates correct time for level 4 (proficient)', () => {
  const command = { level: 4, complexity: 1.0 };
  assert.equal(getTimeLimit(command), 1.2);
});

test('getTimeLimit - calculates correct time for level 5 (mastered)', () => {
  const command = { level: 5, complexity: 1.0 };
  assert.equal(getTimeLimit(command), 1.0);
});

test('getTimeLimit - applies complexity multiplier correctly', () => {
  const simple = { level: 1, complexity: 1.0 };
  const complex = { level: 1, complexity: 1.5 };
  const veryComplex = { level: 1, complexity: 2.0 };

  assert.equal(getTimeLimit(simple), 3.0);
  assert.equal(getTimeLimit(complex), 4.5); // 3.0 * 1.5
  assert.equal(getTimeLimit(veryComplex), 6.0); // 3.0 * 2.0
});

test('getTimeLimit - handles fractional complexity', () => {
  const command = { level: 2, complexity: 1.3 };
  assert.equal(getTimeLimit(command), 2.6); // 2.0 * 1.3
});

test('getTimeLimit - clamps level to valid range (0-5)', () => {
  assert.equal(getTimeLimit({ level: -1, complexity: 1.0 }), 5.0); // Clamped to 0
  assert.equal(getTimeLimit({ level: 6, complexity: 1.0 }), 1.0); // Clamped to 5
  assert.equal(getTimeLimit({ level: 100, complexity: 1.0 }), 1.0); // Clamped to 5
});

test('getTimeLimit - clamps complexity to valid range (1.0-2.0)', () => {
  assert.equal(getTimeLimit({ level: 1, complexity: 0.5 }), 3.0); // Clamped to 1.0
  assert.equal(getTimeLimit({ level: 1, complexity: 3.0 }), 6.0); // Clamped to 2.0
});

test('getTimeLimit - handles edge case values', () => {
  // Max time: level 0, complexity 2.0
  assert.equal(getTimeLimit({ level: 0, complexity: 2.0 }), 10.0);

  // Min time: level 5, complexity 1.0
  assert.equal(getTimeLimit({ level: 5, complexity: 1.0 }), 1.0);
});

// Test suite: createTimer() basic functionality
test('createTimer - creates timer with correct initial state', () => {
  let tickCount = 0;
  const timer = createTimer(1.0, () => tickCount++, () => {});

  assert.equal(typeof timer.start, 'function');
  assert.equal(typeof timer.stop, 'function');
  assert.equal(typeof timer.pause, 'function');
  assert.equal(typeof timer.getRemaining, 'function');
  assert.equal(typeof timer.isActive, 'function');
  assert.equal(typeof timer.isPaused, 'function');

  timer.stop(); // Cleanup
});

test('createTimer - starts with full time remaining', () => {
  const timer = createTimer(3.0, () => {}, () => {});
  assert.equal(timer.getRemaining(), 3.0);
  timer.stop();
});

test('createTimer - countdown reduces remaining time', async () => {
  const timer = createTimer(0.5, () => {}, () => {});
  timer.start();

  // Wait 100ms
  await new Promise(resolve => setTimeout(resolve, 100));

  const remaining = timer.getRemaining();
  assert.ok(remaining < 0.5, 'Time should have decreased');
  assert.ok(remaining > 0.3, 'Time should not decrease too much');

  timer.stop();
});

test('createTimer - calls onTick callback during countdown', async () => {
  let tickCount = 0;
  const timer = createTimer(0.2, () => tickCount++, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 100));
  timer.stop();

  assert.ok(tickCount > 0, 'onTick should be called multiple times');
});

test('createTimer - onTick receives remaining time', async () => {
  let lastRemaining = null;
  const timer = createTimer(0.3, (remaining) => {
    lastRemaining = remaining;
  }, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 50));
  timer.stop();

  assert.ok(lastRemaining !== null, 'onTick should receive remaining time');
  assert.ok(lastRemaining < 0.3, 'Remaining time should be less than start');
  assert.ok(lastRemaining >= 0, 'Remaining time should be non-negative');
});

test('createTimer - calls onComplete when time expires', async () => {
  let completed = false;
  const timer = createTimer(0.1, () => {}, () => {
    completed = true;
  });

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 150));

  assert.ok(completed, 'onComplete should be called');
});

test('createTimer - stops automatically when time expires', async () => {
  const timer = createTimer(0.05, () => {}, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 100));

  assert.equal(timer.isActive(), false, 'Timer should stop after expiring');
  assert.equal(timer.getRemaining(), 0, 'Remaining should be 0');
});

test('createTimer - remaining time never goes negative', async () => {
  const timer = createTimer(0.05, () => {}, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 100));

  assert.ok(timer.getRemaining() >= 0, 'Remaining should never be negative');
  timer.stop();
});

// Test suite: createTimer() control methods
test('createTimer - stop() halts countdown', async () => {
  const timer = createTimer(1.0, () => {}, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 50));

  const remainingBeforeStop = timer.getRemaining();
  timer.stop();

  await new Promise(resolve => setTimeout(resolve, 50));

  // After stop, getRemaining should return 0
  assert.equal(timer.getRemaining(), 0, 'Remaining should be 0 after stop');
});

test('createTimer - stop() cleans up interval', async () => {
  let tickCount = 0;
  const timer = createTimer(1.0, () => tickCount++, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 50));

  const ticksBeforeStop = tickCount;
  timer.stop();

  await new Promise(resolve => setTimeout(resolve, 50));

  // Ticks should not continue after stop
  assert.equal(tickCount, ticksBeforeStop, 'Ticks should not continue after stop');
});

test('createTimer - pause() suspends countdown', async () => {
  const timer = createTimer(1.0, () => {}, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 50));

  timer.pause();
  const remainingAfterPause = timer.getRemaining();

  await new Promise(resolve => setTimeout(resolve, 100));

  const remainingAfterWait = timer.getRemaining();
  assert.equal(remainingAfterWait, remainingAfterPause, 'Time should not decrease while paused');

  timer.stop();
});

test('createTimer - resume from pause continues countdown', async () => {
  const timer = createTimer(1.0, () => {}, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 50));

  timer.pause();
  const remainingAtPause = timer.getRemaining();

  timer.start(); // Resume
  await new Promise(resolve => setTimeout(resolve, 50));

  const remainingAfterResume = timer.getRemaining();
  assert.ok(remainingAfterResume < remainingAtPause, 'Time should continue after resume');

  timer.stop();
});

test('createTimer - isActive() returns correct state', async () => {
  const timer = createTimer(1.0, () => {}, () => {});

  assert.equal(timer.isActive(), false, 'Should not be active initially');

  timer.start();
  assert.equal(timer.isActive(), true, 'Should be active after start');

  timer.pause();
  assert.equal(timer.isActive(), false, 'Should not be active when paused');

  timer.start(); // Resume
  assert.equal(timer.isActive(), true, 'Should be active after resume');

  timer.stop();
  assert.equal(timer.isActive(), false, 'Should not be active after stop');
});

test('createTimer - isPaused() returns correct state', async () => {
  const timer = createTimer(1.0, () => {}, () => {});

  assert.equal(timer.isPaused(), false, 'Should not be paused initially');

  timer.start();
  assert.equal(timer.isPaused(), false, 'Should not be paused when running');

  timer.pause();
  assert.equal(timer.isPaused(), true, 'Should be paused after pause()');

  timer.start(); // Resume
  assert.equal(timer.isPaused(), false, 'Should not be paused after resume');

  timer.stop();
});

test('createTimer - addTime() extends countdown', async () => {
  const timer = createTimer(0.2, () => {}, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 50));

  const beforeAdd = timer.getRemaining();
  timer.addTime(0.5);
  const afterAdd = timer.getRemaining();

  assert.ok(afterAdd > beforeAdd, 'Time should increase after addTime');
  assert.ok(Math.abs((afterAdd - beforeAdd) - 0.5) < 0.1, 'Should add approximately 0.5 seconds');

  timer.stop();
});

test('createTimer - addTime() can subtract time', async () => {
  const timer = createTimer(1.0, () => {}, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 50));

  const beforeSubtract = timer.getRemaining();
  timer.addTime(-0.3);
  const afterSubtract = timer.getRemaining();

  assert.ok(afterSubtract < beforeSubtract, 'Time should decrease after negative addTime');

  timer.stop();
});

test('createTimer - addTime() respects zero minimum', async () => {
  const timer = createTimer(0.1, () => {}, () => {});

  timer.start();
  timer.addTime(-1.0); // Try to subtract more than remaining

  assert.ok(timer.getRemaining() >= 0, 'Time should not go negative');

  timer.stop();
});

// Test suite: createTimer() edge cases
test('createTimer - handles very short timers (100ms)', async () => {
  let completed = false;
  const timer = createTimer(0.1, () => {}, () => {
    completed = true;
  });

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 150));

  assert.ok(completed, 'Very short timer should complete');
});

test('createTimer - handles multiple start() calls safely', async () => {
  let tickCount = 0;
  const timer = createTimer(0.5, () => tickCount++, () => {});

  timer.start();
  timer.start(); // Second start should be ignored
  timer.start(); // Third start should be ignored

  await new Promise(resolve => setTimeout(resolve, 100));
  timer.stop();

  // Should not create multiple intervals
  assert.ok(tickCount > 0, 'Timer should still work after multiple starts');
});

test('createTimer - handles missing callbacks gracefully', async () => {
  const timer = createTimer(0.1, null, null);

  // Should not throw
  timer.start();
  await new Promise(resolve => setTimeout(resolve, 150));

  assert.ok(true, 'Timer should handle null callbacks without error');
  timer.stop();
});

test('createTimer - handles stop() before start()', () => {
  const timer = createTimer(1.0, () => {}, () => {});

  // Should not throw
  timer.stop();

  assert.ok(true, 'Stop before start should not error');
});

test('createTimer - handles pause() before start()', () => {
  const timer = createTimer(1.0, () => {}, () => {});

  // Should not throw
  timer.pause();

  assert.ok(true, 'Pause before start should not error');
});

test('createTimer - handles multiple stop() calls', async () => {
  const timer = createTimer(0.5, () => {}, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 50));

  timer.stop();
  timer.stop(); // Second stop should be safe
  timer.stop(); // Third stop should be safe

  assert.ok(true, 'Multiple stops should not error');
});

test('createTimer - handles pause/resume cycles', async () => {
  const timer = createTimer(1.0, () => {}, () => {});

  timer.start();
  await new Promise(resolve => setTimeout(resolve, 50));

  timer.pause();
  await new Promise(resolve => setTimeout(resolve, 50));

  timer.start(); // Resume
  await new Promise(resolve => setTimeout(resolve, 50));

  timer.pause();
  await new Promise(resolve => setTimeout(resolve, 50));

  timer.start(); // Resume again

  const remaining = timer.getRemaining();
  assert.ok(remaining > 0 && remaining < 1.0, 'Timer should work after multiple pause/resume');

  timer.stop();
});

// Test suite: getBaseTime()
test('getBaseTime - returns correct base time for each level', () => {
  assert.equal(getBaseTime(0), 5.0);
  assert.equal(getBaseTime(1), 3.0);
  assert.equal(getBaseTime(2), 2.0);
  assert.equal(getBaseTime(3), 1.5);
  assert.equal(getBaseTime(4), 1.2);
  assert.equal(getBaseTime(5), 1.0);
});

test('getBaseTime - clamps level to valid range', () => {
  assert.equal(getBaseTime(-1), 5.0); // Clamped to 0
  assert.equal(getBaseTime(6), 1.0); // Clamped to 5
  assert.equal(getBaseTime(100), 1.0); // Clamped to 5
});

// Test suite: getAllBaseTimes()
test('getAllBaseTimes - returns array of all base times', () => {
  const baseTimes = getAllBaseTimes();

  assert.ok(Array.isArray(baseTimes), 'Should return an array');
  assert.equal(baseTimes.length, 6, 'Should have 6 levels');
  assert.deepEqual(baseTimes, [5.0, 3.0, 2.0, 1.5, 1.2, 1.0]);
});

test('getAllBaseTimes - returns copy of array (not reference)', () => {
  const baseTimes1 = getAllBaseTimes();
  const baseTimes2 = getAllBaseTimes();

  baseTimes1[0] = 999;

  assert.notEqual(baseTimes1[0], baseTimes2[0], 'Modifying one should not affect the other');
  assert.equal(baseTimes2[0], 5.0, 'Original value should be preserved');
});

// Integration test: Real-world scenario
test('Integration - complete game timer scenario', async () => {
  // Simulate a level 2 command with complexity 1.5
  const command = { level: 2, complexity: 1.5 };
  const timeLimit = getTimeLimit(command);

  assert.equal(timeLimit, 3.0, 'Level 2 with 1.5 complexity should be 3.0s');

  let tickCount = 0;
  let completed = false;

  const timer = createTimer(
    timeLimit,
    (remaining) => {
      tickCount++;
      // Simulate UI updates
      assert.ok(remaining >= 0, 'UI should never show negative time');
    },
    () => {
      completed = true;
    }
  );

  // Start timer
  timer.start();
  assert.equal(timer.isActive(), true, 'Timer should be running');

  // Simulate player pausing after 100ms
  await new Promise(resolve => setTimeout(resolve, 100));
  timer.pause();
  const pausedTime = timer.getRemaining();

  // Pause for 200ms (simulating menu or break)
  await new Promise(resolve => setTimeout(resolve, 200));

  // Resume
  timer.start();
  assert.ok(timer.getRemaining() <= pausedTime, 'Time should resume from pause point');

  // Wait for completion
  await new Promise(resolve => setTimeout(resolve, 3200));

  assert.ok(completed, 'Timer should complete eventually');
  assert.ok(tickCount > 0, 'Should have fired many ticks');
  assert.equal(timer.isActive(), false, 'Timer should stop after completion');

  timer.stop(); // Cleanup
});
