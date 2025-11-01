/**
 * Unit tests for scoring and combo system
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  updateCombo,
  getComboMultiplier,
  SessionScorer
} from '../../src/core/scorer.js';

describe('Scoring System', () => {
  describe('calculateScore', () => {
    it('should calculate base score with no bonuses', () => {
      // Level 0, no time remaining, no combo
      const score = calculateScore(0, 2.0, 0, 0);
      // (100 + 0) * 1 * 1 = 100
      assert.equal(score, 100);
    });

    it('should add time bonus for faster completion', () => {
      // Full time remaining = max bonus
      const score1 = calculateScore(2.0, 2.0, 0, 0);
      // (100 + 50) * 1 * 1 = 150
      assert.equal(score1, 150);

      // Half time remaining = half bonus
      const score2 = calculateScore(1.0, 2.0, 0, 0);
      // (100 + 25) * 1 * 1 = 125
      assert.equal(score2, 125);

      // 75% time remaining
      const score3 = calculateScore(1.5, 2.0, 0, 0);
      // (100 + 37.5) * 1 * 1 = 137 (floor)
      assert.equal(score3, 137);
    });

    it('should apply level multiplier', () => {
      // Level 0: 1x multiplier
      const score0 = calculateScore(0, 2.0, 0, 0);
      assert.equal(score0, 100);

      // Level 1: 2x multiplier
      const score1 = calculateScore(0, 2.0, 1, 0);
      assert.equal(score1, 200);

      // Level 3: 4x multiplier
      const score3 = calculateScore(0, 2.0, 3, 0);
      assert.equal(score3, 400);

      // Level 5: 6x multiplier
      const score5 = calculateScore(0, 2.0, 5, 0);
      assert.equal(score5, 600);
    });

    it('should apply combo multiplier', () => {
      // 0-4 combo: 1x
      const score0 = calculateScore(0, 2.0, 0, 0);
      assert.equal(score0, 100);

      const score4 = calculateScore(0, 2.0, 0, 4);
      assert.equal(score4, 100);

      // 5-9 combo: 2x
      const score5 = calculateScore(0, 2.0, 0, 5);
      assert.equal(score5, 200);

      const score9 = calculateScore(0, 2.0, 0, 9);
      assert.equal(score9, 200);

      // 10-14 combo: 3x
      const score10 = calculateScore(0, 2.0, 0, 10);
      assert.equal(score10, 300);

      // 23 combo: 5x
      const score23 = calculateScore(0, 2.0, 0, 23);
      assert.equal(score23, 500);
    });

    it('should combine all multipliers correctly', () => {
      // Level 3, full time bonus, 12 combo
      // (100 + 50) * 4 * 3 = 1800
      const score = calculateScore(2.0, 2.0, 3, 12);
      assert.equal(score, 1800);

      // Level 5, half time bonus, 7 combo
      // (100 + 25) * 6 * 2 = 1500
      const score2 = calculateScore(1.0, 2.0, 5, 7);
      assert.equal(score2, 1500);

      // Level 2, 75% time bonus, 18 combo
      // (100 + 37.5) * 3 * 4 = 1650
      const score3 = calculateScore(1.5, 2.0, 2, 18);
      assert.equal(score3, 1650);
    });

    it('should handle edge cases gracefully', () => {
      // Negative time remaining
      const score1 = calculateScore(-1, 2.0, 0, 0);
      assert.equal(score1, 100);

      // Zero max time (prevent division by zero)
      const score2 = calculateScore(1, 0, 0, 0);
      assert.ok(score2 >= 100);

      // Negative level (clamp to 0)
      const score3 = calculateScore(0, 2.0, -1, 0);
      assert.equal(score3, 100);

      // Level > 5 (clamp to 5)
      const score4 = calculateScore(0, 2.0, 10, 0);
      assert.equal(score4, 600);

      // Negative combo
      const score5 = calculateScore(0, 2.0, 0, -5);
      assert.equal(score5, 100);
    });

    it('should return integer scores', () => {
      // Score with fractional result
      const score = calculateScore(1.3, 2.7, 2, 7);
      assert.equal(score, Math.floor(score));
      assert.equal(typeof score, 'number');
    });
  });

  describe('updateCombo', () => {
    it('should increment combo on correct answer', () => {
      assert.equal(updateCombo(true, 0), 1);
      assert.equal(updateCombo(true, 5), 6);
      assert.equal(updateCombo(true, 99), 100);
    });

    it('should reset combo on incorrect answer', () => {
      assert.equal(updateCombo(false, 0), 0);
      assert.equal(updateCombo(false, 5), 0);
      assert.equal(updateCombo(false, 100), 0);
    });

    it('should handle negative combo values', () => {
      assert.equal(updateCombo(true, -1), 1);
      assert.equal(updateCombo(false, -5), 0);
    });
  });

  describe('getComboMultiplier', () => {
    it('should return correct multipliers for combo ranges', () => {
      // 0-4: 1x
      assert.equal(getComboMultiplier(0), 1);
      assert.equal(getComboMultiplier(4), 1);

      // 5-9: 2x
      assert.equal(getComboMultiplier(5), 2);
      assert.equal(getComboMultiplier(9), 2);

      // 10-14: 3x
      assert.equal(getComboMultiplier(10), 3);
      assert.equal(getComboMultiplier(14), 3);

      // 15-19: 4x
      assert.equal(getComboMultiplier(15), 4);
      assert.equal(getComboMultiplier(19), 4);

      // 20-24: 5x
      assert.equal(getComboMultiplier(20), 5);
      assert.equal(getComboMultiplier(24), 5);

      // Higher combos
      assert.equal(getComboMultiplier(50), 11);
      assert.equal(getComboMultiplier(100), 21);
    });

    it('should handle edge cases', () => {
      assert.equal(getComboMultiplier(-1), 1);
      assert.equal(getComboMultiplier(-10), 1);
    });
  });

  describe('SessionScorer', () => {
    it('should initialize with zero stats', () => {
      const session = new SessionScorer();
      const stats = session.getStats();

      assert.equal(stats.totalScore, 0);
      assert.equal(stats.currentCombo, 0);
      assert.equal(stats.bestCombo, 0);
      assert.equal(stats.correctCount, 0);
      assert.equal(stats.incorrectCount, 0);
      assert.equal(stats.totalAttempts, 0);
      assert.equal(stats.accuracy, 0);
    });

    it('should track correct answers and build combo', () => {
      const session = new SessionScorer();

      // First correct answer
      const result1 = session.recordAttempt(true, 2.0, 2.0, 0);
      assert.equal(result1.isCorrect, true);
      assert.equal(result1.combo, 1);
      assert.equal(result1.score, 150); // (100 + 50) * 1 * 1

      // Second correct answer
      const result2 = session.recordAttempt(true, 1.0, 2.0, 0);
      assert.equal(result2.combo, 2);
      assert.equal(result2.score, 125); // (100 + 25) * 1 * 1

      const stats = session.getStats();
      assert.equal(stats.currentCombo, 2);
      assert.equal(stats.bestCombo, 2);
      assert.equal(stats.correctCount, 2);
      assert.equal(stats.totalScore, 275);
    });

    it('should reset combo on incorrect answer', () => {
      const session = new SessionScorer();

      // Build combo
      session.recordAttempt(true, 2.0, 2.0, 0);
      session.recordAttempt(true, 2.0, 2.0, 0);
      session.recordAttempt(true, 2.0, 2.0, 0);

      assert.equal(session.currentCombo, 3);

      // Fail - should reset combo
      const result = session.recordAttempt(false, 0, 2.0, 0);
      assert.equal(result.isCorrect, false);
      assert.equal(result.combo, 0);
      assert.equal(result.score, 0);
      assert.equal(session.currentCombo, 0);
    });

    it('should track best combo across session', () => {
      const session = new SessionScorer();

      // Build combo to 5
      for (let i = 0; i < 5; i++) {
        session.recordAttempt(true, 2.0, 2.0, 0);
      }
      assert.equal(session.bestCombo, 5);

      // Fail and rebuild to 3
      session.recordAttempt(false, 0, 2.0, 0);
      session.recordAttempt(true, 2.0, 2.0, 0);
      session.recordAttempt(true, 2.0, 2.0, 0);
      session.recordAttempt(true, 2.0, 2.0, 0);

      // Best combo should still be 5
      assert.equal(session.currentCombo, 3);
      assert.equal(session.bestCombo, 5);
    });

    it('should calculate accuracy correctly', () => {
      const session = new SessionScorer();

      // 3 correct, 1 incorrect = 75%
      session.recordAttempt(true, 2.0, 2.0, 0);
      session.recordAttempt(true, 2.0, 2.0, 0);
      session.recordAttempt(false, 0, 2.0, 0);
      session.recordAttempt(true, 2.0, 2.0, 0);

      const stats = session.getStats();
      assert.equal(stats.correctCount, 3);
      assert.equal(stats.incorrectCount, 1);
      assert.equal(stats.totalAttempts, 4);
      assert.equal(stats.accuracy, 75.0);
    });

    it('should accumulate score correctly with combos and levels', () => {
      const session = new SessionScorer();

      // Attempt 1: Combo becomes 1, level 0: (100 + 50) * 1 * 1 = 150
      session.recordAttempt(true, 2.0, 2.0, 0);
      assert.equal(session.totalScore, 150);

      // Attempt 2: Combo becomes 2, level 1: (100 + 50) * 2 * 1 = 300
      session.recordAttempt(true, 2.0, 2.0, 1);
      assert.equal(session.totalScore, 450);

      // Attempt 3: Combo becomes 3, level 2: (100 + 50) * 3 * 1 = 450
      session.recordAttempt(true, 2.0, 2.0, 2);
      assert.equal(session.totalScore, 900);

      // Attempt 4: Combo becomes 4, level 0: (100 + 50) * 1 * 1 = 150
      session.recordAttempt(true, 2.0, 2.0, 0);
      assert.equal(session.totalScore, 1050);

      // Attempt 5: Combo becomes 5, level 0: (100 + 50) * 1 * 2 = 300 (combo multiplier kicks in!)
      session.recordAttempt(true, 2.0, 2.0, 0);
      assert.equal(session.totalScore, 1350);

      // Attempt 6: Combo becomes 6, level 0: (100 + 50) * 1 * 2 = 300
      session.recordAttempt(true, 2.0, 2.0, 0);
      assert.equal(session.totalScore, 1650);
    });

    it('should not award points for incorrect answers', () => {
      const session = new SessionScorer();

      session.recordAttempt(true, 2.0, 2.0, 0);
      const scoreBefore = session.totalScore;

      session.recordAttempt(false, 0, 2.0, 5); // Even high level doesn't matter
      assert.equal(session.totalScore, scoreBefore);
    });

    it('should reset session stats', () => {
      const session = new SessionScorer();

      // Build up some stats
      session.recordAttempt(true, 2.0, 2.0, 0);
      session.recordAttempt(true, 2.0, 2.0, 1);
      session.recordAttempt(false, 0, 2.0, 0);

      // Reset
      session.reset();

      const stats = session.getStats();
      assert.equal(stats.totalScore, 0);
      assert.equal(stats.currentCombo, 0);
      assert.equal(stats.bestCombo, 0);
      assert.equal(stats.correctCount, 0);
      assert.equal(stats.incorrectCount, 0);
      assert.equal(stats.totalAttempts, 0);
      assert.equal(stats.accuracy, 0);
    });

    it('should handle realistic game scenario', () => {
      const session = new SessionScorer();

      // Simulate a real game session
      const attempts = [
        { correct: true, time: 1.8, maxTime: 2.0, level: 0 },
        { correct: true, time: 1.5, maxTime: 2.0, level: 0 },
        { correct: true, time: 1.2, maxTime: 2.0, level: 1 },
        { correct: false, time: 0, maxTime: 2.0, level: 0 }, // Failed
        { correct: true, time: 1.9, maxTime: 2.0, level: 0 },
        { correct: true, time: 1.8, maxTime: 2.0, level: 1 },
        { correct: true, time: 1.5, maxTime: 2.5, level: 2 },
        { correct: true, time: 1.0, maxTime: 1.5, level: 1 },
        { correct: true, time: 1.2, maxTime: 2.0, level: 0 },
        { correct: true, time: 1.8, maxTime: 2.0, level: 3 }, // Combo 6 (2x multiplier)
      ];

      attempts.forEach(({ correct, time, maxTime, level }) => {
        session.recordAttempt(correct, time, maxTime, level);
      });

      const stats = session.getStats();
      assert.equal(stats.totalAttempts, 10);
      assert.equal(stats.correctCount, 9);
      assert.equal(stats.incorrectCount, 1);
      assert.equal(stats.accuracy, 90.0);
      assert.equal(stats.currentCombo, 6);
      assert.equal(stats.bestCombo, 6);
      assert.ok(stats.totalScore > 0);
    });
  });
});
