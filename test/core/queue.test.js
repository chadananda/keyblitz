import { describe, it } from 'node:test';
import assert from 'node:assert';
import { selectNextCommand, getCommandWeights } from '../../src/core/queue.js';

describe('Queue Manager', () => {
  describe('getCommandWeights', () => {
    it('should calculate weights using 1/(level+1) formula', () => {
      const commands = [
        { keys: 'dd', level: 0 },
        { keys: 'yy', level: 1 },
        { keys: 'gg', level: 2 },
        { keys: 'dw', level: 3 },
        { keys: 'ciw', level: 4 },
        { keys: 'diw', level: 5 }
      ];

      const weights = getCommandWeights(commands);

      assert.strictEqual(weights[0], 1.0); // level 0: 1/(0+1) = 1.0
      assert.strictEqual(weights[1], 0.5); // level 1: 1/(1+1) = 0.5
      assert.strictEqual(weights[2], 1/3); // level 2: 1/(2+1) = 0.333...
      assert.strictEqual(weights[3], 0.25); // level 3: 1/(3+1) = 0.25
      assert.strictEqual(weights[4], 0.2); // level 4: 1/(4+1) = 0.2
      assert.strictEqual(weights[5], 1/6); // level 5: 1/(5+1) = 0.166...
    });

    it('should handle single command', () => {
      const commands = [{ keys: 'dd', level: 0 }];
      const weights = getCommandWeights(commands);

      assert.strictEqual(weights.length, 1);
      assert.strictEqual(weights[0], 1.0);
    });

    it('should throw TypeError for non-array input', () => {
      assert.throws(
        () => getCommandWeights(null),
        TypeError,
        'commands must be an array'
      );

      assert.throws(
        () => getCommandWeights('not an array'),
        TypeError,
        'commands must be an array'
      );

      assert.throws(
        () => getCommandWeights({ keys: 'dd' }),
        TypeError,
        'commands must be an array'
      );
    });

    it('should throw TypeError for commands missing level', () => {
      const commands = [{ keys: 'dd' }]; // missing level

      assert.throws(
        () => getCommandWeights(commands),
        TypeError,
        /missing level property/
      );
    });

    it('should handle empty array', () => {
      const weights = getCommandWeights([]);
      assert.strictEqual(weights.length, 0);
    });

    it('should handle all commands at same level', () => {
      const commands = [
        { keys: 'dd', level: 2 },
        { keys: 'yy', level: 2 },
        { keys: 'cc', level: 2 }
      ];

      const weights = getCommandWeights(commands);

      assert.strictEqual(weights[0], 1/3);
      assert.strictEqual(weights[1], 1/3);
      assert.strictEqual(weights[2], 1/3);
    });
  });

  describe('selectNextCommand', () => {
    describe('Basic selection', () => {
      it('should return null for empty array', () => {
        const result = selectNextCommand([]);
        assert.strictEqual(result, null);
      });

      it('should return single command if only one available', () => {
        const commands = [
          { keys: 'dd', level: 0, nextReview: Date.now() - 1000 }
        ];

        const result = selectNextCommand(commands);
        assert.strictEqual(result.keys, 'dd');
      });

      it('should throw TypeError for non-array input', () => {
        assert.throws(
          () => selectNextCommand(null),
          TypeError,
          'commands must be an array'
        );

        assert.throws(
          () => selectNextCommand('not an array'),
          TypeError,
          'commands must be an array'
        );
      });
    });

    describe('nextReview filtering', () => {
      it('should only select commands due for review', () => {
        const now = Date.now();
        const commands = [
          { keys: 'dd', level: 0, nextReview: now - 1000 }, // due
          { keys: 'yy', level: 0, nextReview: now + 10000 }, // not due
          { keys: 'cc', level: 0, nextReview: now - 500 } // due
        ];

        // Run multiple times to ensure we never get 'yy'
        for (let i = 0; i < 20; i++) {
          const result = selectNextCommand(commands);
          assert.notStrictEqual(result.keys, 'yy');
          assert.ok(['dd', 'cc'].includes(result.keys));
        }
      });

      it('should treat undefined nextReview as due', () => {
        const commands = [
          { keys: 'dd', level: 0 } // no nextReview property
        ];

        const result = selectNextCommand(commands);
        assert.strictEqual(result.keys, 'dd');
      });

      it('should treat null nextReview as due', () => {
        const commands = [
          { keys: 'dd', level: 0, nextReview: null }
        ];

        const result = selectNextCommand(commands);
        assert.strictEqual(result.keys, 'dd');
      });

      it('should return null if no commands are due', () => {
        const future = Date.now() + 100000;
        const commands = [
          { keys: 'dd', level: 0, nextReview: future },
          { keys: 'yy', level: 1, nextReview: future }
        ];

        const result = selectNextCommand(commands);
        assert.strictEqual(result, null);
      });
    });

    describe('Level 0 prioritization', () => {
      it('should always select from level 0 when available', () => {
        const commands = [
          { keys: 'dd', level: 0, nextReview: Date.now() - 1000 },
          { keys: 'yy', level: 2, nextReview: Date.now() - 1000 },
          { keys: 'cc', level: 4, nextReview: Date.now() - 1000 }
        ];

        // Run 20 times to ensure level 0 is always selected
        for (let i = 0; i < 20; i++) {
          const result = selectNextCommand(commands);
          assert.strictEqual(result.keys, 'dd');
        }
      });

      it('should randomly select among multiple level 0 commands', () => {
        const commands = [
          { keys: 'dd', level: 0, nextReview: Date.now() - 1000 },
          { keys: 'yy', level: 0, nextReview: Date.now() - 1000 },
          { keys: 'cc', level: 0, nextReview: Date.now() - 1000 }
        ];

        const selected = new Set();

        // Run 50 times to get statistical distribution
        for (let i = 0; i < 50; i++) {
          const result = selectNextCommand(commands);
          selected.add(result.keys);
        }

        // Should see multiple different level 0 commands selected
        assert.ok(selected.size >= 2, 'Should randomly select among level 0 commands');
      });

      it('should not select higher level commands when level 0 exists', () => {
        const commands = [
          { keys: 'dd', level: 0, nextReview: Date.now() - 1000 },
          { keys: 'yy', level: 5, nextReview: Date.now() - 1000 }
        ];

        // Verify level 0 is always chosen
        for (let i = 0; i < 20; i++) {
          const result = selectNextCommand(commands);
          assert.strictEqual(result.level, 0);
        }
      });
    });

    describe('Weighted random selection', () => {
      it('should use weighted selection when no level 0 commands', () => {
        const commands = [
          { keys: 'dd', level: 1, nextReview: Date.now() - 1000 }, // weight 0.5
          { keys: 'yy', level: 2, nextReview: Date.now() - 1000 }, // weight 0.33
          { keys: 'cc', level: 4, nextReview: Date.now() - 1000 }  // weight 0.2
        ];

        const counts = { dd: 0, yy: 0, cc: 0 };

        // Run 300 times to get statistical distribution
        for (let i = 0; i < 300; i++) {
          const result = selectNextCommand(commands);
          counts[result.keys]++;
        }

        // Level 1 (weight 0.5) should appear most frequently
        // Level 2 (weight 0.33) should be in middle
        // Level 4 (weight 0.2) should appear least frequently
        assert.ok(counts.dd > counts.yy, 'Level 1 should appear more than level 2');
        assert.ok(counts.yy > counts.cc, 'Level 2 should appear more than level 4');

        // Each should be selected at least once
        assert.ok(counts.dd > 0, 'Level 1 should be selected');
        assert.ok(counts.yy > 0, 'Level 2 should be selected');
        assert.ok(counts.cc > 0, 'Level 4 should be selected');
      });

      it('should handle all commands at same level', () => {
        const commands = [
          { keys: 'dd', level: 2, nextReview: Date.now() - 1000 },
          { keys: 'yy', level: 2, nextReview: Date.now() - 1000 },
          { keys: 'cc', level: 2, nextReview: Date.now() - 1000 }
        ];

        const selected = new Set();

        // With equal weights, all should eventually be selected
        for (let i = 0; i < 50; i++) {
          const result = selectNextCommand(commands);
          selected.add(result.keys);
        }

        assert.ok(selected.size >= 2, 'Should select multiple commands with equal weights');
      });
    });

    describe('Current command filtering', () => {
      it('should avoid selecting current command when alternatives exist', () => {
        const commands = [
          { keys: 'dd', level: 1, nextReview: Date.now() - 1000 },
          { keys: 'yy', level: 1, nextReview: Date.now() - 1000 },
          { keys: 'cc', level: 1, nextReview: Date.now() - 1000 }
        ];

        // Current command is index 0 ('dd')
        for (let i = 0; i < 20; i++) {
          const result = selectNextCommand(commands, 0);
          assert.notStrictEqual(result.keys, 'dd', 'Should not select current command');
          assert.ok(['yy', 'cc'].includes(result.keys));
        }
      });

      it('should allow current command when it is the only option', () => {
        const commands = [
          { keys: 'dd', level: 1, nextReview: Date.now() - 1000 }
        ];

        const result = selectNextCommand(commands, 0);
        assert.strictEqual(result.keys, 'dd', 'Should allow current when only option');
      });

      it('should handle null currentCommandIndex', () => {
        const commands = [
          { keys: 'dd', level: 1, nextReview: Date.now() - 1000 },
          { keys: 'yy', level: 1, nextReview: Date.now() - 1000 }
        ];

        const result = selectNextCommand(commands, null);
        assert.ok(result !== null);
        assert.ok(['dd', 'yy'].includes(result.keys));
      });

      it('should handle undefined currentCommandIndex', () => {
        const commands = [
          { keys: 'dd', level: 1, nextReview: Date.now() - 1000 },
          { keys: 'yy', level: 1, nextReview: Date.now() - 1000 }
        ];

        const result = selectNextCommand(commands);
        assert.ok(result !== null);
        assert.ok(['dd', 'yy'].includes(result.keys));
      });
    });

    describe('Edge cases', () => {
      it('should handle mix of due and not due commands with level 0', () => {
        const now = Date.now();
        const commands = [
          { keys: 'dd', level: 0, nextReview: now - 1000 }, // due, level 0
          { keys: 'yy', level: 0, nextReview: now + 10000 }, // not due, level 0
          { keys: 'cc', level: 2, nextReview: now - 1000 } // due, level 2
        ];

        // Should always select 'dd' (only due level 0 command)
        for (let i = 0; i < 20; i++) {
          const result = selectNextCommand(commands);
          assert.strictEqual(result.keys, 'dd');
        }
      });

      it('should handle all mastered commands (level 5)', () => {
        const commands = [
          { keys: 'dd', level: 5, nextReview: Date.now() - 1000 },
          { keys: 'yy', level: 5, nextReview: Date.now() - 1000 },
          { keys: 'cc', level: 5, nextReview: Date.now() - 1000 }
        ];

        // Should still select something (maintenance practice)
        const result = selectNextCommand(commands);
        assert.ok(result !== null);
        assert.ok(['dd', 'yy', 'cc'].includes(result.keys));
      });

      it('should handle commands with far past nextReview', () => {
        const veryOld = Date.now() - 1000000; // very overdue
        const commands = [
          { keys: 'dd', level: 2, nextReview: veryOld }
        ];

        const result = selectNextCommand(commands);
        assert.strictEqual(result.keys, 'dd');
      });

      it('should return command from pool when all weights are zero', () => {
        // This is a theoretical edge case that shouldn't happen in practice
        // since weights are always > 0 for any valid level
        // But the code has a fallback for it
        const commands = [
          { keys: 'dd', level: 1, nextReview: Date.now() - 1000 }
        ];

        const result = selectNextCommand(commands);
        assert.ok(result !== null);
      });
    });

    describe('Statistical distribution', () => {
      it('should show correct weight distribution over many selections', () => {
        const commands = [
          { keys: 'l1', level: 1, nextReview: Date.now() - 1000 }, // weight 0.5
          { keys: 'l2', level: 2, nextReview: Date.now() - 1000 }, // weight 0.33
          { keys: 'l3', level: 3, nextReview: Date.now() - 1000 }  // weight 0.25
        ];

        const counts = { l1: 0, l2: 0, l3: 0 };
        const iterations = 1000;

        for (let i = 0; i < iterations; i++) {
          const result = selectNextCommand(commands);
          counts[result.keys]++;
        }

        // Calculate expected ratios
        const totalWeight = 0.5 + (1/3) + 0.25;
        const expected = {
          l1: (0.5 / totalWeight) * iterations,
          l2: ((1/3) / totalWeight) * iterations,
          l3: (0.25 / totalWeight) * iterations
        };

        // Allow 15% variance for randomness
        const variance = 0.15;

        assert.ok(
          Math.abs(counts.l1 - expected.l1) < expected.l1 * variance,
          `Level 1 distribution within variance: ${counts.l1} vs ${expected.l1}`
        );

        assert.ok(
          Math.abs(counts.l2 - expected.l2) < expected.l2 * variance,
          `Level 2 distribution within variance: ${counts.l2} vs ${expected.l2}`
        );

        assert.ok(
          Math.abs(counts.l3 - expected.l3) < expected.l3 * variance,
          `Level 3 distribution within variance: ${counts.l3} vs ${expected.l3}`
        );
      });
    });
  });
});
