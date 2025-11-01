# Storage Module

Persistent storage for KeyBlitz using the `conf` library.

## Features

- **Cross-platform persistence**: Saves to `~/.config/keyblitz/` (Linux/Mac) or `AppData` (Windows)
- **Atomic writes**: Safe concurrent access using conf's atomic write operations
- **Crash-safe**: Auto-saves immediately after each command state update
- **Validation**: Data structure validation before save to prevent corruption
- **Multi-pack support**: Separate progress tracking for each keybinding pack
- **Spaced repetition ready**: Stores timestamps for review scheduling

## Location

Config files are stored in:
- **macOS**: `~/Library/Preferences/keyblitz-nodejs/config.json`
- **Linux**: `~/.config/keyblitz-nodejs/config.json`
- **Windows**: `%APPDATA%\keyblitz-nodejs\config.json`

## Usage

```javascript
import { Storage } from './src/utils/storage.js';

// Create storage for a pack
const storage = new Storage('neovim');

// Load progress (returns default if not exists)
const progress = storage.loadProgress();

// Update command state (auto-saves)
storage.updateCommandState('dd', {
  level: 2,
  successes: 8,
  failures: 2,
  lastSeen: Date.now(),
  nextReview: Date.now() + 10000
});

// Get specific command state
const ddState = storage.getCommandState('dd');

// Save full progress
progress.currentGroup = 1;
progress.globalStats.totalScore += 1000;
storage.saveProgress(progress);

// Get all packs (for stats screen)
const allProgress = storage.getAllProgress();

// Reset progress
storage.resetProgress();

// Delete progress
storage.deleteProgress();
```

## Data Structure

```javascript
{
  app: "neovim",
  currentGroup: 0,
  unlockedGroups: [0],
  commandStats: {
    "dd": {
      level: 2,              // 0-5 (SRS level)
      successes: 8,          // Total correct attempts
      failures: 2,           // Total failed attempts
      lastSeen: 1698765432000,     // Unix timestamp (ms)
      nextReview: 1698765532000    // Unix timestamp (ms)
    }
  },
  globalStats: {
    totalCommands: 127,      // Total commands practiced
    totalTime: 1234567,      // Total time in milliseconds
    bestCombo: 23,           // Best combo achieved
    totalScore: 45600        // Total score earned
  }
}
```

## Methods

### `constructor(packId)`
Create storage instance for a specific pack.

### `loadProgress()`
Load progress for this pack. Returns default structure if not exists.

### `saveProgress(progress)`
Save progress. Validates before saving. Returns `true` on success.

### `updateCommandState(commandKey, state)`
Update single command state. Auto-saves immediately. Returns `true` on success.

### `getCommandState(commandKey)`
Get state for specific command. Returns `null` if not found.

### `resetProgress()`
Reset all progress for this pack. Returns `true` on success.

### `getAllProgress()`
Get progress for all packs. Returns object mapping packId to progress.

### `getConfigPath()`
Get absolute path to config file (useful for debugging).

### `deleteProgress()`
Delete this pack's progress. Returns `true` on success.

## Validation

All saves are validated to ensure:
- Required fields are present
- Data types are correct
- Arrays and objects are properly structured
- Command states have all required fields

Invalid data is rejected and errors are logged.

## Testing

Run tests:
```bash
npm test
```

Run storage tests only:
```bash
node --test test/utils/storage.test.js
```

Run demo:
```bash
node test/utils/storage-demo.js
```

## Persistence Verification

The module has been tested to ensure:
- ✅ Data persists across process restarts
- ✅ Multiple Storage instances access same data
- ✅ Timestamps are preserved exactly (critical for spaced repetition)
- ✅ Large datasets (100+ commands) work correctly
- ✅ Rapid sequential updates don't corrupt data
- ✅ Concurrent access from multiple packs is safe

## Performance

- **Load time**: < 1ms for typical progress file
- **Save time**: < 5ms with atomic write
- **Memory**: Minimal (only current pack data in memory)
- **File size**: ~1-5KB per pack with 50-100 commands

## Error Handling

All methods catch errors and:
- Log to console.error
- Return `false` or default values
- Never throw exceptions

This ensures the app can continue even if storage fails.
