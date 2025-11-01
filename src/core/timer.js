/**
 * Timer module for KeyBlitz countdown system
 *
 * Handles time limits based on command level and complexity,
 * provides countdown timer with tick callbacks and cleanup.
 *
 * Time limits decrease as player levels up, creating urgency
 * and building muscle memory through reflex training.
 */

// Base time limits in seconds for each SRS level (0-5)
// Level 0: New/failed commands get generous time
// Level 5: Mastered commands require instant reflexes
const BASE_TIMES = [5.0, 3.0, 2.0, 1.5, 1.2, 1.0];

/**
 * Calculate time limit for a command based on level and complexity
 *
 * @param {Object} command - Command object with level and complexity
 * @param {number} command.level - SRS level (0-5)
 * @param {number} command.complexity - Complexity multiplier (1.0-2.0)
 * @returns {number} Time limit in seconds
 *
 * @example
 * // Simple command at learning level
 * getTimeLimit({level: 1, complexity: 1.0}) // 3.0 seconds
 *
 * @example
 * // Complex text object at confident level
 * getTimeLimit({level: 3, complexity: 1.8}) // 2.7 seconds (1.5 * 1.8)
 */
export function getTimeLimit(command) {
  const level = Math.max(0, Math.min(5, command.level)); // Clamp to 0-5
  const complexity = Math.max(1.0, Math.min(2.0, command.complexity)); // Clamp to 1.0-2.0
  return BASE_TIMES[level] * complexity;
}

/**
 * Create a countdown timer with precise tick callbacks
 *
 * Returns a timer object with start/stop/getRemaining methods.
 * Timer fires onTick callback at specified intervals and onComplete
 * when time runs out. All intervals are automatically cleaned up.
 *
 * @param {number} timeLimit - Total time in seconds
 * @param {function} onTick - Callback fired each tick with remaining time
 * @param {function} onComplete - Callback fired when timer expires
 * @returns {Object} Timer control object
 *
 * @example
 * const timer = createTimer(3.0, (remaining) => {
 *   console.log(`${remaining.toFixed(1)}s left`);
 * }, () => {
 *   console.log('Time up!');
 * });
 *
 * timer.start();
 * // Later...
 * timer.stop();
 */
export function createTimer(timeLimit, onTick, onComplete) {
  // Timer state
  let intervalId = null;
  let startTime = null;
  let remainingTime = timeLimit;
  let isRunning = false;
  let isPaused = false;
  let pausedAt = null;
  let elapsedBeforePause = 0;

  // Tick interval in milliseconds (10ms for smooth updates)
  const TICK_INTERVAL = 10;

  /**
   * Calculate remaining time based on elapsed time
   * @private
   */
  function updateRemaining() {
    if (!isRunning || isPaused) return remainingTime;

    const now = Date.now();
    const elapsed = (now - startTime) / 1000; // Convert to seconds
    remainingTime = Math.max(0, timeLimit - elapsed - elapsedBeforePause);
    return remainingTime;
  }

  /**
   * Timer tick handler
   * @private
   */
  function tick() {
    const remaining = updateRemaining();

    // Fire tick callback with current remaining time
    if (onTick && typeof onTick === 'function') {
      onTick(remaining);
    }

    // Check if timer expired
    if (remaining <= 0) {
      stop();
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    }
  }

  /**
   * Start the countdown timer
   *
   * Begins countdown from full time or resumes from paused state.
   * Safe to call multiple times (idempotent).
   */
  function start() {
    if (isRunning && !isPaused) return; // Already running

    if (isPaused) {
      // Resume from pause
      isPaused = false;
      startTime = Date.now();
    } else {
      // Fresh start
      startTime = Date.now();
      remainingTime = timeLimit;
      elapsedBeforePause = 0;
    }

    isRunning = true;

    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Start tick interval
    intervalId = setInterval(tick, TICK_INTERVAL);

    // Fire initial tick
    tick();
  }

  /**
   * Stop the timer and cleanup
   *
   * Stops countdown and clears all intervals.
   * Timer cannot be restarted after stop.
   */
  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning = false;
    isPaused = false;
    remainingTime = 0;
  }

  /**
   * Pause the timer
   *
   * Preserves remaining time for resume.
   * Can be resumed with start().
   */
  function pause() {
    if (!isRunning || isPaused) return;

    isPaused = true;
    pausedAt = Date.now();

    // Calculate elapsed time up to pause
    elapsedBeforePause += (pausedAt - startTime) / 1000;

    // Clear interval while paused
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  /**
   * Get current remaining time in seconds
   *
   * @returns {number} Remaining time in seconds
   */
  function getRemaining() {
    if (isPaused) {
      return remainingTime;
    }
    return updateRemaining();
  }

  /**
   * Check if timer is currently running
   *
   * @returns {boolean} True if running (not stopped or paused)
   */
  function isActive() {
    return isRunning && !isPaused;
  }

  /**
   * Check if timer is paused
   *
   * @returns {boolean} True if paused
   */
  function isPausedState() {
    return isPaused;
  }

  /**
   * Add time to the timer
   *
   * Useful for bonuses or difficulty adjustments mid-game.
   *
   * @param {number} seconds - Seconds to add (can be negative to subtract)
   */
  function addTime(seconds) {
    timeLimit += seconds;
    remainingTime = Math.max(0, remainingTime + seconds);
  }

  // Return timer control interface
  return {
    start,
    stop,
    pause,
    getRemaining,
    isActive,
    isPaused: isPausedState,
    addTime
  };
}

/**
 * Get base time for a specific level
 *
 * Useful for UI display and calculations.
 *
 * @param {number} level - SRS level (0-5)
 * @returns {number} Base time in seconds for that level
 *
 * @example
 * getBaseTime(0) // 5.0
 * getBaseTime(5) // 1.0
 */
export function getBaseTime(level) {
  const clampedLevel = Math.max(0, Math.min(5, level));
  return BASE_TIMES[clampedLevel];
}

/**
 * Get all base times as array
 *
 * Useful for UI that shows progression.
 *
 * @returns {Array<number>} Array of base times [level0, level1, ..., level5]
 */
export function getAllBaseTimes() {
  return [...BASE_TIMES];
}
