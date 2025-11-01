/**
 * Spaced Repetition System (SRS) Engine for KeyBlitz
 *
 * This module implements a 6-level SRS algorithm optimized for rapid skill acquisition
 * through spaced repetition and immediate failure recovery.
 *
 * SRS PHILOSOPHY:
 * - Failures are learning opportunities: ANY failure resets to level 0 for immediate practice
 * - Mastery requires consistency: 3 consecutive successes needed to advance each level
 * - Progressive spacing: Commands appear less frequently as mastery increases
 * - Level-based intervals determine when commands should be reviewed again
 *
 * LEVELS:
 * 0 - NEW/FAILED: Immediate practice (0 commands between reviews)
 * 1 - LEARNING: Every 3-5 commands (interval: 3)
 * 2 - FAMILIAR: Every 10-15 commands (interval: 10)
 * 3 - CONFIDENT: Every 25-30 commands (interval: 25)
 * 4 - PROFICIENT: Every 50-60 commands (interval: 50)
 * 5 - MASTERED: Every 100+ commands (validation only, interval: 100)
 */

// SRS level names as object (for convenient access)
export const SRS_LEVELS = {
  NEW: 0,
  LEARNING: 1,
  FAMILIAR: 2,
  CONFIDENT: 3,
  PROFICIENT: 4,
  MASTERED: 5
};

// SRS interval configuration: number of commands between reviews for each level
export const SRS_INTERVALS = [
  0,    // Level 0: NEW/FAILED - immediate practice, no delay
  3,    // Level 1: LEARNING - review every 3 commands
  10,   // Level 2: FAMILIAR - review every 10 commands
  25,   // Level 3: CONFIDENT - review every 25 commands
  50,   // Level 4: PROFICIENT - review every 50 commands
  100   // Level 5: MASTERED - review every 100 commands (maintenance)
];

// Number of consecutive successes required to advance to next level
export const SUCCESSES_TO_ADVANCE = 3;

// Maximum SRS level (0-5 = 6 levels total)
export const MAX_LEVEL = 5;

// Level names for display purposes
export const LEVEL_NAMES = [
  'NEW',
  'LEARNING',
  'FAMILIAR',
  'CONFIDENT',
  'PROFICIENT',
  'MASTERED'
];

/**
 * Updates a command's SRS state based on whether the answer was correct
 *
 * PROGRESSION RULES:
 * - Correct answer: increment successes, advance level after 3 consecutive successes
 * - Wrong answer: reset to level 0 and clear successes (harsh but effective for mastery)
 *
 * @param {Object} command - The command object with current state
 * @param {number} command.level - Current SRS level (0-5)
 * @param {number} command.successes - Consecutive successes at current level
 * @param {number} command.failures - Total failures (lifetime counter)
 * @param {number} command.lastSeen - Timestamp of last review
 * @param {number} command.nextReview - Calculated timestamp for next review
 * @param {boolean} isCorrect - Whether the user answered correctly
 * @param {number} currentTime - Current timestamp (defaults to Date.now())
 * @returns {Object} Updated command state with new level, successes, failures, lastSeen, nextReview
 */
export function updateCommandState(command, isCorrect, currentTime = Date.now()) {
  const now = currentTime;

  // Initialize state if command is new
  const currentLevel = command.level ?? 0;
  const currentSuccesses = command.successes ?? 0;
  const currentFailures = command.failures ?? 0;

  let newLevel = currentLevel;
  let newSuccesses = currentSuccesses;
  let newFailures = currentFailures;

  if (isCorrect) {
    // Correct answer: increment successes
    newSuccesses++;

    // Check if ready to advance to next level
    if (newSuccesses >= SUCCESSES_TO_ADVANCE && newLevel < MAX_LEVEL) {
      // Advance to next level and reset success counter
      newLevel++;
      newSuccesses = 0;
    }
  } else {
    // Wrong answer: HARSH RESET - back to level 0 for immediate re-practice
    // This ensures failures get immediate attention and drilling
    newLevel = 0;
    newSuccesses = 0;
    newFailures++;
  }

  // Calculate when this command should be reviewed next
  const nextReview = calculateNextReview(newLevel, now);

  // Return updated command state
  return {
    ...command,
    level: newLevel,
    successes: newSuccesses,
    failures: newFailures,
    lastSeen: now,
    nextReview
  };
}

/**
 * Determines if a command should be reviewed based on SRS intervals
 *
 * A command should be reviewed when EITHER:
 * 1. Enough commands have passed since last review (primary mechanism)
 * 2. Enough time has passed based on nextReview timestamp (for cross-session persistence)
 *
 * This dual-mechanism approach supports both:
 * - Within-session reviews (based on command count)
 * - Cross-session reviews (based on time elapsed since last review)
 *
 * @param {Object} command - The command object
 * @param {number} command.level - Current SRS level (0-5)
 * @param {number} command.lastSeen - Timestamp of last review
 * @param {number} command.nextReview - Calculated timestamp for next review
 * @param {number} commandsSinceLastSeen - Number of commands shown since this one last appeared
 * @param {number} currentTime - Current timestamp (defaults to Date.now())
 * @returns {boolean} True if command should be reviewed now
 */
export function shouldReviewCommand(command, commandsSinceLastSeen, currentTime = Date.now()) {
  // Level 0 (NEW/FAILED) commands should ALWAYS be in the review queue
  if (command.level === 0) {
    return true;
  }

  // Check 1: Has enough commands passed since last review? (primary for within-session)
  const interval = SRS_INTERVALS[command.level] ?? 0;
  const hasEnoughCommandsPassed = commandsSinceLastSeen >= interval;

  // Check 2: Has enough time passed? (for cross-session persistence)
  const hasEnoughTimePassed = command.nextReview && currentTime >= command.nextReview;

  // Return true if EITHER condition is met
  return hasEnoughCommandsPassed || hasEnoughTimePassed;
}

/**
 * Calculates the next review timestamp based on current level
 *
 * This is a timestamp-based calculation that can be used for:
 * - Session-based review (within a single practice session)
 * - Time-based review (for daily/weekly review scheduling)
 *
 * The intervals are based on command counts, but we store as timestamps
 * to support future features like daily review reminders.
 *
 * @param {number} level - Current SRS level (0-5)
 * @param {number} currentTime - Current timestamp (defaults to Date.now())
 * @returns {number} Timestamp when command should be reviewed next
 */
export function calculateNextReview(level, currentTime = Date.now()) {
  // For level 0, review immediately (same timestamp)
  if (level === 0) {
    return currentTime;
  }

  // For other levels, add interval-based offset
  // Note: This is a simplified timestamp calculation. In practice, the
  // shouldReviewCommand function uses command counts, which is more accurate
  // for within-session reviews. The timestamp is useful for cross-session persistence.
  const interval = SRS_INTERVALS[level] ?? 0;

  // Each command takes roughly 2-3 seconds on average
  // Use 2.5 seconds as estimate for time-based calculation
  const estimatedSecondsPerCommand = 2.5;
  const millisecondsUntilReview = interval * estimatedSecondsPerCommand * 1000;

  return currentTime + millisecondsUntilReview;
}

/**
 * Gets the display name for an SRS level
 *
 * @param {number} level - SRS level (0-5)
 * @returns {string} Level name (e.g., "LEARNING", "MASTERED")
 */
export function getLevelName(level) {
  return LEVEL_NAMES[level] ?? 'UNKNOWN';
}

/**
 * Calculates mastery percentage for a command
 *
 * Mastery = successes / (successes + failures)
 * Returns 0 if no attempts have been made yet
 *
 * @param {Object} command - The command object
 * @param {number} command.successes - Total successes (at current level)
 * @param {number} command.failures - Total failures (lifetime)
 * @returns {number} Mastery percentage (0-100)
 */
export function calculateMastery(command) {
  const totalSuccesses = command.successes ?? 0;
  const totalFailures = command.failures ?? 0;
  const totalAttempts = totalSuccesses + totalFailures;

  if (totalAttempts === 0) {
    return 0;
  }

  return Math.round((totalSuccesses / totalAttempts) * 100);
}

/**
 * Initializes a new command with default SRS state
 *
 * @param {Object} command - Base command object
 * @returns {Object} Command with initialized SRS state
 */
export function initializeCommandState(command) {
  return {
    ...command,
    level: 0,
    successes: 0,
    failures: 0,
    lastSeen: null,
    nextReview: Date.now() // New commands should be reviewed immediately
  };
}

// Legacy alias for backwards compatibility
export const initializeCommand = initializeCommandState;

export default {
  SRS_LEVELS,
  SRS_INTERVALS,
  SUCCESSES_TO_ADVANCE,
  MAX_LEVEL,
  LEVEL_NAMES,
  updateCommandState,
  shouldReviewCommand,
  calculateNextReview,
  getLevelName,
  calculateMastery,
  initializeCommandState,
  initializeCommand
};
