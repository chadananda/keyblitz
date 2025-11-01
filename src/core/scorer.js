/**
 * Scoring and Combo System
 *
 * Manages score calculation with time bonuses, level multipliers, and combo streaks.
 * Makes progress feel rewarding with escalating multipliers.
 */

/**
 * Calculate score for a successful command execution
 *
 * @param {number} timeRemaining - Seconds remaining when command was completed
 * @param {number} maxTime - Maximum time allowed for this command (in seconds)
 * @param {number} level - SRS level of the command (0-5)
 * @param {number} combo - Current combo streak count
 * @returns {number} - Calculated score (integer)
 *
 * Scoring Formula:
 * - Base points: 100
 * - Time bonus: Up to 50 points for speed (linear based on % time remaining)
 * - Level multiplier: (level + 1) - Higher level commands worth more
 * - Combo multiplier: Increases every 5 combo (+1 per 5 streak)
 *
 * Example: Level 3 command, completed with 1.5s/2.0s remaining, 12 combo
 * - basePoints = 100
 * - timeBonus = (1.5 / 2.0) * 50 = 37.5
 * - levelMultiplier = (3 + 1) = 4
 * - comboMultiplier = Math.floor(12 / 5) + 1 = 3
 * - score = (100 + 37.5) * 4 * 3 = 1650
 */
export function calculateScore(timeRemaining, maxTime, level, combo) {
  // Validate inputs
  if (timeRemaining < 0) timeRemaining = 0;
  if (maxTime <= 0) maxTime = 1; // Prevent division by zero
  if (level < 0) level = 0;
  if (level > 5) level = 5;
  if (combo < 0) combo = 0;

  // Base scoring components
  const basePoints = 100;
  const timeBonus = (timeRemaining / maxTime) * 50; // Faster = more points (0-50)
  const levelMultiplier = level + 1; // Levels 0-5 → multipliers 1-6
  const comboMultiplier = getComboMultiplier(combo);

  // Calculate final score
  const score = (basePoints + timeBonus) * levelMultiplier * comboMultiplier;

  return Math.floor(score); // Return integer score
}

/**
 * Update combo based on success or failure
 *
 * @param {boolean} isCorrect - Whether the command was executed correctly
 * @param {number} currentCombo - Current combo streak
 * @returns {number} - New combo count
 *
 * Rules:
 * - Correct answer: increment combo
 * - Wrong answer: reset combo to 0
 */
export function updateCombo(isCorrect, currentCombo) {
  if (currentCombo < 0) currentCombo = 0;

  if (isCorrect) {
    return currentCombo + 1;
  } else {
    return 0; // Reset streak on failure
  }
}

/**
 * Get combo multiplier based on current combo streak
 *
 * @param {number} combo - Current combo count
 * @returns {number} - Multiplier value
 *
 * Multiplier Scale:
 * - 0-4 combo: 1x
 * - 5-9 combo: 2x
 * - 10-14 combo: 3x
 * - 15-19 combo: 4x
 * - etc. (+1 multiplier every 5 combo)
 */
export function getComboMultiplier(combo) {
  if (combo < 0) combo = 0;
  return Math.floor(combo / 5) + 1;
}

/**
 * Session score tracker
 * Maintains cumulative score and statistics for the current session
 */
export class SessionScorer {
  constructor() {
    this.totalScore = 0;
    this.currentCombo = 0;
    this.bestCombo = 0;
    this.correctCount = 0;
    this.incorrectCount = 0;
  }

  /**
   * Record a command attempt and update session stats
   *
   * @param {boolean} isCorrect - Whether command was correct
   * @param {number} timeRemaining - Time remaining (seconds)
   * @param {number} maxTime - Max time allowed (seconds)
   * @param {number} level - Command SRS level (0-5)
   * @returns {Object} - Result with score and updated combo
   */
  recordAttempt(isCorrect, timeRemaining, maxTime, level) {
    // Update combo
    this.currentCombo = updateCombo(isCorrect, this.currentCombo);

    // Track best combo
    if (this.currentCombo > this.bestCombo) {
      this.bestCombo = this.currentCombo;
    }

    // Update counts
    if (isCorrect) {
      this.correctCount++;

      // Calculate and add score for correct answers
      const earnedScore = calculateScore(timeRemaining, maxTime, level, this.currentCombo);
      this.totalScore += earnedScore;

      return {
        score: earnedScore,
        combo: this.currentCombo,
        totalScore: this.totalScore,
        isCorrect: true
      };
    } else {
      this.incorrectCount++;

      return {
        score: 0,
        combo: this.currentCombo, // Will be 0 after failure
        totalScore: this.totalScore,
        isCorrect: false
      };
    }
  }

  /**
   * Get current session statistics
   *
   * @returns {Object} - Session stats
   */
  getStats() {
    const totalAttempts = this.correctCount + this.incorrectCount;
    const accuracy = totalAttempts > 0
      ? (this.correctCount / totalAttempts) * 100
      : 0;

    return {
      totalScore: this.totalScore,
      currentCombo: this.currentCombo,
      bestCombo: this.bestCombo,
      correctCount: this.correctCount,
      incorrectCount: this.incorrectCount,
      totalAttempts,
      accuracy: Math.round(accuracy * 10) / 10 // Round to 1 decimal
    };
  }

  /**
   * Reset session stats (keep for session restart)
   */
  reset() {
    this.totalScore = 0;
    this.currentCombo = 0;
    this.bestCombo = 0;
    this.correctCount = 0;
    this.incorrectCount = 0;
  }
}
