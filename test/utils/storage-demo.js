#!/usr/bin/env node
/**
 * Storage Module Demonstration
 * Shows the storage module in action with realistic usage patterns
 */

import { Storage } from '../../src/utils/storage.js';

console.log('=== KeyBlitz Storage Module Demo ===\n');

// Create storage for neovim pack
const storage = new Storage('neovim');
console.log('📁 Config location:', storage.getConfigPath());
console.log('');

// Reset to start fresh
storage.resetProgress();
console.log('🔄 Starting with fresh progress...\n');

// Simulate a training session
console.log('📚 Simulating training session...');

// User practices 'dd' command
console.log('  User practicing: dd (delete line)');
for (let i = 0; i < 5; i++) {
  const state = storage.getCommandState('dd') || {
    level: 0,
    successes: 0,
    failures: 0,
    lastSeen: Date.now(),
    nextReview: Date.now(),
  };

  state.successes++;
  state.lastSeen = Date.now();

  // Advance level every 3 successes (matching SRS logic)
  if (state.successes % 3 === 0 && state.level < 5) {
    state.level++;
  }

  state.nextReview = Date.now() + (state.level * 10000); // Simple next review calculation
  storage.updateCommandState('dd', state);

  console.log(`    Attempt ${i + 1}: Level ${state.level}, Successes: ${state.successes}`);
}

console.log('');

// User practices 'diw' command with some failures
console.log('  User practicing: diw (delete inner word)');
for (let i = 0; i < 4; i++) {
  const state = storage.getCommandState('diw') || {
    level: 0,
    successes: 0,
    failures: 0,
    lastSeen: Date.now(),
    nextReview: Date.now(),
  };

  if (i === 1 || i === 3) {
    state.failures++;
    state.level = 0; // Reset on failure
    console.log(`    Attempt ${i + 1}: ❌ Failed! Reset to level 0`);
  } else {
    state.successes++;
    if (state.successes % 3 === 0 && state.level < 5) {
      state.level++;
    }
    console.log(`    Attempt ${i + 1}: ✅ Success! Level ${state.level}, Successes: ${state.successes}`);
  }

  state.lastSeen = Date.now();
  state.nextReview = Date.now() + (state.level * 10000);
  storage.updateCommandState('diw', state);
}

console.log('');

// Update global stats
const progress = storage.loadProgress();
progress.currentGroup = 2;
progress.unlockedGroups = [0, 1, 2];
progress.globalStats = {
  totalCommands: 127,
  totalTime: 1234567,
  bestCombo: 23,
  totalScore: 45600,
};
storage.saveProgress(progress);

console.log('📊 Updated global stats:');
console.log('  Current Group:', progress.currentGroup);
console.log('  Unlocked Groups:', progress.unlockedGroups.join(', '));
console.log('  Total Commands:', progress.globalStats.totalCommands);
console.log('  Best Combo:', progress.globalStats.bestCombo);
console.log('  Total Score:', progress.globalStats.totalScore);
console.log('');

// Show command states
console.log('📈 Command Progress:');
const ddState = storage.getCommandState('dd');
console.log('  dd:', {
  level: ddState.level,
  successes: ddState.successes,
  failures: ddState.failures,
  accuracy: `${Math.round((ddState.successes / (ddState.successes + ddState.failures)) * 100)}%`,
});

const diwState = storage.getCommandState('diw');
console.log('  diw:', {
  level: diwState.level,
  successes: diwState.successes,
  failures: diwState.failures,
  accuracy: `${Math.round((diwState.successes / (diwState.successes + diwState.failures)) * 100)}%`,
});
console.log('');

// Simulate process restart
console.log('💤 Simulating process restart...\n');
console.log('🔄 Creating new Storage instance...');

const storage2 = new Storage('neovim');
const reloadedProgress = storage2.loadProgress();

console.log('✅ Progress persisted successfully!');
console.log('  Current Group:', reloadedProgress.currentGroup);
console.log('  Total Score:', reloadedProgress.globalStats.totalScore);
console.log('  Commands tracked:', Object.keys(reloadedProgress.commandStats).length);
console.log('');

// Show all packs
console.log('📦 All packs with progress:');
const allProgress = storage.getAllProgress();
for (const [packId, pack] of Object.entries(allProgress)) {
  console.log(`  ${packId}:`, {
    group: pack.currentGroup,
    score: pack.globalStats.totalScore,
    commands: Object.keys(pack.commandStats).length,
  });
}
console.log('');

// Check if due for review (spaced repetition)
console.log('⏰ Review Schedule:');
const now = Date.now();
const ddReview = storage2.getCommandState('dd');
const diwReview = storage2.getCommandState('diw');

console.log('  dd:', ddReview.nextReview <= now ? '🔴 Due now' : `⏳ Due in ${Math.round((ddReview.nextReview - now) / 1000)}s`);
console.log('  diw:', diwReview.nextReview <= now ? '🔴 Due now' : `⏳ Due in ${Math.round((diwReview.nextReview - now) / 1000)}s`);
console.log('');

console.log('🎉 Demo complete! Progress will persist across sessions.');
console.log('');

// Show cleanup option
console.log('To clean up demo data, run:');
console.log(`  node -e "import {Storage} from './src/utils/storage.js'; new Storage('neovim').deleteProgress(); console.log('Cleaned up demo data');"`);
