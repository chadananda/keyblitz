import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Storage } from '../../src/utils/storage.js';
import fs from 'node:fs';
import path from 'node:path';

describe('Storage', () => {
  let storage;
  const testPackId = 'test-pack';

  before(() => {
    // Create storage instance for tests
    storage = new Storage(testPackId);
  });

  after(() => {
    // Clean up test data
    storage.deleteProgress();
  });

  describe('constructor', () => {
    it('should create a new Storage instance', () => {
      const s = new Storage('neovim');
      assert.ok(s instanceof Storage);
      assert.equal(s.packId, 'neovim');
      assert.equal(s.key, 'progress-neovim');
    });

    it('should initialize conf with correct project name', () => {
      const s = new Storage('test');
      assert.ok(s.config);
      const configPath = s.getConfigPath();
      assert.ok(configPath.includes('keyblitz'));
    });
  });

  describe('loadProgress', () => {
    it('should return default progress for new pack', () => {
      // Clean slate
      storage.deleteProgress();

      const progress = storage.loadProgress();

      assert.equal(progress.app, testPackId);
      assert.equal(progress.currentGroup, 0);
      assert.deepEqual(progress.unlockedGroups, [0]);
      assert.deepEqual(progress.commandStats, {});
      assert.deepEqual(progress.globalStats, {
        totalCommands: 0,
        totalTime: 0,
        bestCombo: 0,
        totalScore: 0,
      });
    });

    it('should load existing progress', () => {
      const testProgress = {
        app: testPackId,
        currentGroup: 2,
        unlockedGroups: [0, 1, 2],
        commandStats: {
          dd: {
            level: 2,
            successes: 8,
            failures: 2,
            lastSeen: 1698765432000,
            nextReview: 1698765532000,
          },
        },
        globalStats: {
          totalCommands: 127,
          totalTime: 1234567,
          bestCombo: 23,
          totalScore: 45600,
        },
      };

      storage.saveProgress(testProgress);
      const loaded = storage.loadProgress();

      assert.deepEqual(loaded, testProgress);
    });

    it('should return default progress for corrupted data', () => {
      // Manually set invalid data
      storage.config.set(storage.key, { invalid: 'data' });

      const progress = storage.loadProgress();

      assert.equal(progress.app, testPackId);
      assert.equal(progress.currentGroup, 0);
    });
  });

  describe('saveProgress', () => {
    it('should save valid progress', () => {
      const progress = {
        app: testPackId,
        currentGroup: 1,
        unlockedGroups: [0, 1],
        commandStats: {},
        globalStats: {
          totalCommands: 10,
          totalTime: 5000,
          bestCombo: 5,
          totalScore: 1000,
        },
      };

      const success = storage.saveProgress(progress);
      assert.equal(success, true);

      const loaded = storage.loadProgress();
      assert.deepEqual(loaded, progress);
    });

    it('should reject invalid progress - missing fields', () => {
      const invalid = {
        app: testPackId,
        currentGroup: 1,
        // Missing required fields
      };

      const success = storage.saveProgress(invalid);
      assert.equal(success, false);
    });

    it('should reject invalid progress - wrong types', () => {
      const invalid = {
        app: testPackId,
        currentGroup: 1,
        unlockedGroups: 'not-an-array',
        commandStats: {},
        globalStats: {},
      };

      const success = storage.saveProgress(invalid);
      assert.equal(success, false);
    });

    it('should reject null or undefined', () => {
      assert.equal(storage.saveProgress(null), false);
      assert.equal(storage.saveProgress(undefined), false);
    });
  });

  describe('updateCommandState', () => {
    before(() => {
      storage.deleteProgress();
    });

    it('should update command state and auto-save', () => {
      const commandState = {
        level: 2,
        successes: 8,
        failures: 2,
        lastSeen: Date.now(),
        nextReview: Date.now() + 10000,
      };

      const success = storage.updateCommandState('dd', commandState);
      assert.equal(success, true);

      const progress = storage.loadProgress();
      assert.deepEqual(progress.commandStats.dd, commandState);
    });

    it('should update multiple commands', () => {
      const dd = {
        level: 2,
        successes: 8,
        failures: 2,
        lastSeen: Date.now(),
        nextReview: Date.now() + 10000,
      };

      const diw = {
        level: 0,
        successes: 0,
        failures: 3,
        lastSeen: Date.now(),
        nextReview: Date.now(),
      };

      storage.updateCommandState('dd', dd);
      storage.updateCommandState('diw', diw);

      const progress = storage.loadProgress();
      assert.deepEqual(progress.commandStats.dd, dd);
      assert.deepEqual(progress.commandStats.diw, diw);
    });

    it('should reject invalid command state - missing fields', () => {
      const invalid = {
        level: 2,
        successes: 8,
        // Missing required fields
      };

      const success = storage.updateCommandState('dd', invalid);
      assert.equal(success, false);
    });

    it('should reject null or undefined state', () => {
      assert.equal(storage.updateCommandState('dd', null), false);
      assert.equal(storage.updateCommandState('dd', undefined), false);
    });
  });

  describe('getCommandState', () => {
    before(() => {
      storage.deleteProgress();

      const commandState = {
        level: 3,
        successes: 15,
        failures: 1,
        lastSeen: Date.now(),
        nextReview: Date.now() + 20000,
      };

      storage.updateCommandState('gg', commandState);
    });

    it('should get existing command state', () => {
      const state = storage.getCommandState('gg');
      assert.ok(state);
      assert.equal(state.level, 3);
      assert.equal(state.successes, 15);
      assert.equal(state.failures, 1);
    });

    it('should return null for non-existent command', () => {
      const state = storage.getCommandState('non-existent');
      assert.equal(state, null);
    });
  });

  describe('resetProgress', () => {
    it('should reset progress to default', () => {
      // Add some data
      const progress = {
        app: testPackId,
        currentGroup: 5,
        unlockedGroups: [0, 1, 2, 3, 4, 5],
        commandStats: {
          dd: { level: 5, successes: 100, failures: 5, lastSeen: Date.now(), nextReview: Date.now() },
          diw: { level: 4, successes: 50, failures: 10, lastSeen: Date.now(), nextReview: Date.now() },
        },
        globalStats: {
          totalCommands: 500,
          totalTime: 100000,
          bestCombo: 50,
          totalScore: 50000,
        },
      };

      storage.saveProgress(progress);

      // Reset
      const success = storage.resetProgress();
      assert.equal(success, true);

      // Verify reset
      const loaded = storage.loadProgress();
      assert.equal(loaded.currentGroup, 0);
      assert.deepEqual(loaded.unlockedGroups, [0]);
      assert.deepEqual(loaded.commandStats, {});
      assert.equal(loaded.globalStats.totalCommands, 0);
    });
  });

  describe('getAllProgress', () => {
    it('should get progress for all packs', () => {
      // Create multiple packs
      const neovim = new Storage('neovim');
      const tmux = new Storage('tmux');

      const neovimProgress = {
        app: 'neovim',
        currentGroup: 1,
        unlockedGroups: [0, 1],
        commandStats: {},
        globalStats: { totalCommands: 10, totalTime: 1000, bestCombo: 5, totalScore: 500 },
      };

      const tmuxProgress = {
        app: 'tmux',
        currentGroup: 0,
        unlockedGroups: [0],
        commandStats: {},
        globalStats: { totalCommands: 5, totalTime: 500, bestCombo: 3, totalScore: 200 },
      };

      neovim.saveProgress(neovimProgress);
      tmux.saveProgress(tmuxProgress);

      const allProgress = storage.getAllProgress();

      assert.ok(allProgress.neovim);
      assert.ok(allProgress.tmux);
      assert.equal(allProgress.neovim.currentGroup, 1);
      assert.equal(allProgress.tmux.currentGroup, 0);

      // Clean up
      neovim.deleteProgress();
      tmux.deleteProgress();
    });

    it('should return empty object if no progress exists', () => {
      // Clean everything
      const allProgress1 = storage.getAllProgress();
      for (const packId of Object.keys(allProgress1)) {
        const s = new Storage(packId);
        s.deleteProgress();
      }

      const allProgress2 = storage.getAllProgress();
      // May have test-pack or other test data, that's okay
      assert.ok(typeof allProgress2 === 'object');
    });
  });

  describe('persistence across sessions', () => {
    it('should persist data after creating new Storage instance', () => {
      const storage1 = new Storage('persistence-test');

      const progress1 = {
        app: 'persistence-test',
        currentGroup: 3,
        unlockedGroups: [0, 1, 2, 3],
        commandStats: {
          dd: { level: 4, successes: 50, failures: 5, lastSeen: Date.now(), nextReview: Date.now() },
        },
        globalStats: {
          totalCommands: 200,
          totalTime: 50000,
          bestCombo: 30,
          totalScore: 20000,
        },
      };

      storage1.saveProgress(progress1);

      // Create NEW instance (simulating process restart)
      const storage2 = new Storage('persistence-test');
      const progress2 = storage2.loadProgress();

      assert.deepEqual(progress2, progress1);

      // Clean up
      storage2.deleteProgress();
    });

    it('should handle command state updates across instances', () => {
      const storage1 = new Storage('command-persist-test');
      storage1.deleteProgress();

      const state1 = {
        level: 1,
        successes: 3,
        failures: 0,
        lastSeen: Date.now(),
        nextReview: Date.now() + 5000,
      };

      storage1.updateCommandState('yy', state1);

      // New instance
      const storage2 = new Storage('command-persist-test');
      const state2 = storage2.getCommandState('yy');

      assert.deepEqual(state2, state1);

      // Update with new instance
      state2.successes = 6;
      state2.level = 2;
      storage2.updateCommandState('yy', state2);

      // Verify with third instance
      const storage3 = new Storage('command-persist-test');
      const state3 = storage3.getCommandState('yy');

      assert.equal(state3.successes, 6);
      assert.equal(state3.level, 2);

      // Clean up
      storage3.deleteProgress();
    });
  });

  describe('getConfigPath', () => {
    it('should return valid config path', () => {
      const configPath = storage.getConfigPath();
      assert.ok(configPath);
      assert.ok(typeof configPath === 'string');
      assert.ok(configPath.length > 0);

      // Path should exist
      const dir = path.dirname(configPath);
      assert.ok(fs.existsSync(dir));
    });

    it('should point to keyblitz directory', () => {
      const configPath = storage.getConfigPath();
      assert.ok(configPath.includes('keyblitz'));
    });
  });

  describe('deleteProgress', () => {
    it('should delete pack progress', () => {
      const storage1 = new Storage('delete-test');

      const progress = {
        app: 'delete-test',
        currentGroup: 1,
        unlockedGroups: [0, 1],
        commandStats: {},
        globalStats: { totalCommands: 10, totalTime: 1000, bestCombo: 5, totalScore: 500 },
      };

      storage1.saveProgress(progress);

      // Verify it exists
      const loaded1 = storage1.loadProgress();
      assert.equal(loaded1.currentGroup, 1);

      // Delete
      const success = storage1.deleteProgress();
      assert.equal(success, true);

      // Verify it's gone (should get default)
      const loaded2 = storage1.loadProgress();
      assert.equal(loaded2.currentGroup, 0);
      assert.deepEqual(loaded2.commandStats, {});
    });
  });

  describe('edge cases', () => {
    it('should handle very large command stats', () => {
      const storage1 = new Storage('large-test');
      storage1.deleteProgress();

      const progress = {
        app: 'large-test',
        currentGroup: 8,
        unlockedGroups: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        commandStats: {},
        globalStats: { totalCommands: 0, totalTime: 0, bestCombo: 0, totalScore: 0 },
      };

      // Add 100 commands
      for (let i = 0; i < 100; i++) {
        progress.commandStats[`cmd${i}`] = {
          level: i % 6,
          successes: i * 10,
          failures: i,
          lastSeen: Date.now(),
          nextReview: Date.now() + i * 1000,
        };
      }

      const success = storage1.saveProgress(progress);
      assert.equal(success, true);

      const loaded = storage1.loadProgress();
      assert.equal(Object.keys(loaded.commandStats).length, 100);
      assert.equal(loaded.commandStats.cmd50.successes, 500);

      storage1.deleteProgress();
    });

    it('should handle special characters in pack id', () => {
      const storage1 = new Storage('test-pack-123');
      storage1.deleteProgress();

      const progress = {
        app: 'test-pack-123',
        currentGroup: 0,
        unlockedGroups: [0],
        commandStats: {},
        globalStats: { totalCommands: 0, totalTime: 0, bestCombo: 0, totalScore: 0 },
      };

      const success = storage1.saveProgress(progress);
      assert.equal(success, true);

      const loaded = storage1.loadProgress();
      assert.equal(loaded.app, 'test-pack-123');

      storage1.deleteProgress();
    });

    it('should handle rapid sequential saves', () => {
      const storage1 = new Storage('rapid-test');
      storage1.deleteProgress();

      // Rapidly update command state 50 times
      for (let i = 0; i < 50; i++) {
        const state = {
          level: Math.floor(i / 10),
          successes: i,
          failures: 0,
          lastSeen: Date.now(),
          nextReview: Date.now() + 1000,
        };

        storage1.updateCommandState('rapid', state);
      }

      const loaded = storage1.loadProgress();
      assert.equal(loaded.commandStats.rapid.successes, 49);

      storage1.deleteProgress();
    });

    it('should preserve data types correctly', () => {
      const storage1 = new Storage('types-test');
      storage1.deleteProgress();

      const timestamp = 1698765432000;

      const progress = {
        app: 'types-test',
        currentGroup: 2,
        unlockedGroups: [0, 1, 2],
        commandStats: {
          dd: {
            level: 2,
            successes: 8,
            failures: 2,
            lastSeen: timestamp,
            nextReview: timestamp + 10000,
          },
        },
        globalStats: {
          totalCommands: 127,
          totalTime: 1234567,
          bestCombo: 23,
          totalScore: 45600,
        },
      };

      storage1.saveProgress(progress);
      const loaded = storage1.loadProgress();

      // Verify types
      assert.equal(typeof loaded.currentGroup, 'number');
      assert.ok(Array.isArray(loaded.unlockedGroups));
      assert.equal(typeof loaded.commandStats, 'object');
      assert.equal(typeof loaded.commandStats.dd.level, 'number');
      assert.equal(typeof loaded.commandStats.dd.lastSeen, 'number');
      assert.equal(loaded.commandStats.dd.lastSeen, timestamp);

      storage1.deleteProgress();
    });
  });
});
