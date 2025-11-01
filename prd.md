# KeyBlitz PRD

## Overview
Universal keybinding mastery game using spaced repetition and reflex training. Zero-install TUI via `npx keyblitz <app>`. Extensible architecture for multiple applications.

## Technical Stack
- **Framework**: `ink` (React for CLIs, better cross-terminal support than blessed)
- **UI Components**: `ink-box`, `ink-text-input`, `ink-gradient`, `ink-spinner`
- **Colors**: `chalk` v4 (ESM compatible)
- **Storage**: `conf` (cross-platform config storage)
- **Keybinding**: `ink`'s native input handling
- **Node**: >=16 (for ESM support)

## Architecture

### File Structure
```
keyblitz/
├── package.json
├── bin/
│   └── cli.js                    # Entry: npx keyblitz <app>
├── src/
│   ├── index.js                  # Main game controller
│   ├── core/
│   │   ├── srs.js                # Spaced repetition engine
│   │   ├── queue.js              # Command queue manager
│   │   ├── scorer.js             # Scoring/combo system
│   │   └── timer.js              # Countdown timer
│   ├── ui/
│   │   ├── App.js                # Main Ink component
│   │   ├── CommandCard.js        # Command display component
│   │   ├── Header.js             # Stats header
│   │   ├── Footer.js             # Combo/accuracy footer
│   │   ├── GroupIntro.js         # New group introduction
│   │   ├── Feedback.js           # Success/fail flash
│   │   └── Stats.js              # Detailed stats screen
│   ├── utils/
│   │   ├── storage.js            # Progress persistence
│   │   ├── colors.js             # Color definitions
│   │   ├── keyparser.js          # Key sequence parsing
│   │   └── loader.js             # Pack loader/validator
│   └── packs/
│       ├── index.js              # Pack registry (auto-discovers packs)
│       ├── neovim.js             # Neovim keybinding pack
│       ├── hyprland.js           # Hyprland keybinding pack
│       ├── tmux.js               # Tmux keybinding pack
│       ├── vscode.js             # VS Code keybinding pack
│       └── README.md             # Pack creation guide
└── data/                         # Created at runtime in user's home
    └── ~/.config/keyblitz/
        └── progress-{pack}.json
```

### Core Data Structures

#### Command Definition
```javascript
{
  keys: string,              // "dd" or "diw" or "<C-w>h"
  concept: string,           // "DELETE LINE"
  group: number,             // 0-7 (group index)
  color: string,             // chalk color name
  complexity: number,        // 1.0-2.0 (time multiplier)
  targetType: string,        // "line" | "word" | "block" | "visual"
}
```

#### Command State (SRS)
```javascript
{
  ...command,
  level: number,             // 0-5 (SRS level)
  successes: number,
  failures: number,
  lastSeen: timestamp,
  nextReview: timestamp,
}
```

#### Progress Storage
```javascript
{
  app: string,
  currentGroup: number,
  unlockedGroups: number[],
  commandStats: {
    [keys]: {
      level: number,
      successes: number,
      failures: number,
      lastSeen: timestamp
    }
  },
  globalStats: {
    totalCommands: number,
    totalTime: number,
    bestCombo: number,
    totalScore: number
  }
}
```

## Pack Structure

### Pack Definition Schema
Each pack is a single `.js` file in `src/packs/` that exports:

```javascript
export default {
  id: string,                    // "neovim" | "tmux" | "hyprland" etc.
  name: string,                  // "Neovim" (display name)
  description: string,           // "Master Vim/Neovim keybindings"
  version: string,               // "1.0.0"
  author: string,                // Optional
  groups: [                      // Array of command groups
    {
      name: string,              // "Core Movement"
      description: string,       // "Essential navigation keys"
      commands: [                // Array of commands
        {
          keys: string,          // "dd" | "diw" | "<C-w>h"
          concept: string,       // "DELETE LINE"
          color: string,         // "red" | "cyan" | "yellow"
          complexity: number,    // 1.0-2.0
          targetType: string,    // "line" | "word" | "block" | "visual"
          example: string        // Optional: "Removes entire line under cursor"
        }
      ]
    }
  ],
  targetGenerators: {            // Functions to generate practice text
    line: () => string,
    word: () => string,
    block: () => string,
    visual: () => string,
    quote: () => string,
    paren: () => string,
  },
  keyNotation: {                 // Optional: custom key notation
    'C-': 'Ctrl+',
    'M-': 'Alt+',
    'S-': 'Shift+',
  }
}
```

### Pack Validation Rules
- `id` must be lowercase alphanumeric + hyphens only
- `groups` array must have 1-20 groups
- Each group must have 1-50 commands
- Total commands across all groups: 10-500
- `color` must be one of: cyan, blue, yellow, red, magenta, green, white
- `complexity` must be 1.0-2.0
- `targetType` must be one of the defined types or match a custom generator
- `keys` cannot be empty or contain only whitespace

### Pack Loader (`src/utils/loader.js`)
```javascript
export const loadPack = (packId) => {
  // 1. Import from src/packs/{packId}.js
  // 2. Validate against schema
  // 3. Throw descriptive errors if invalid
  // 4. Return validated pack
}

export const listPacks = () => {
  // Auto-discover all .js files in src/packs/
  // Return array of {id, name, description}
}
```

### Pack Registry (`src/packs/index.js`)
```javascript
// Auto-discovers and exports all packs
import neovim from './neovim.js'
import tmux from './tmux.js'
import hyprland from './hyprland.js'
// ... auto-import all packs

export const PACKS = {
  neovim,
  tmux,
  hyprland,
  // ... auto-register
}

export const getPack = (id) => PACKS[id]
export const listPacks = () => Object.keys(PACKS).map(id => ({
  id,
  name: PACKS[id].name,
  description: PACKS[id].description
}))
```

## Example Pack: Neovim (`src/packs/neovim.js`)

```javascript
export default {
  id: 'neovim',
  name: 'Neovim',
  description: 'Master Vim/Neovim keybindings through muscle memory',
  version: '1.0.0',

  groups: [
    {
      name: 'Core Movement',
      description: 'Essential navigation - you cannot edit without this',
      commands: [
        {keys: 'h', concept: 'MOVE LEFT', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'j', concept: 'MOVE DOWN', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'k', concept: 'MOVE UP', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'l', concept: 'MOVE RIGHT', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'w', concept: 'WORD FORWARD', color: 'cyan', complexity: 1.0, targetType: 'word'},
        {keys: 'b', concept: 'WORD BACK', color: 'cyan', complexity: 1.0, targetType: 'word'},
        {keys: 'e', concept: 'WORD END', color: 'cyan', complexity: 1.0, targetType: 'word'},
        {keys: '0', concept: 'LINE START', color: 'blue', complexity: 1.0, targetType: 'line'},
        {keys: '$', concept: 'LINE END', color: 'blue', complexity: 1.0, targetType: 'line'}
      ]
    },
    {
      name: 'Essential Editing',
      description: '80% of basic edits - master these first',
      commands: [
        {keys: 'i', concept: 'INSERT BEFORE', color: 'yellow', complexity: 1.0, targetType: 'line'},
        {keys: 'a', concept: 'INSERT AFTER', color: 'yellow', complexity: 1.0, targetType: 'line'},
        {keys: 'x', concept: 'DELETE CHAR', color: 'red', complexity: 1.0, targetType: 'line'},
        {keys: 'dd', concept: 'DELETE LINE', color: 'red', complexity: 1.3, targetType: 'line'},
        {keys: 'u', concept: 'UNDO', color: 'magenta', complexity: 1.0, targetType: 'line'},
        {keys: 'p', concept: 'PASTE AFTER', color: 'magenta', complexity: 1.0, targetType: 'line'}
      ]
    },
    {
      name: 'Efficient Insert',
      description: 'Speed up text entry and line creation',
      commands: [
        {keys: 'I', concept: 'INSERT LINE START', color: 'yellow', complexity: 1.2, targetType: 'line'},
        {keys: 'A', concept: 'INSERT LINE END', color: 'yellow', complexity: 1.2, targetType: 'line'},
        {keys: 'o', concept: 'NEW LINE BELOW', color: 'yellow', complexity: 1.2, targetType: 'line'},
        {keys: 'O', concept: 'NEW LINE ABOVE', color: 'yellow', complexity: 1.2, targetType: 'line'}
      ]
    },
    {
      name: 'Word Operations',
      description: 'Professional speed - operate on words efficiently',
      commands: [
        {keys: 'dw', concept: 'DELETE WORD', color: 'red', complexity: 1.4, targetType: 'word'},
        {keys: 'cw', concept: 'CHANGE WORD', color: 'red', complexity: 1.4, targetType: 'word'},
        {keys: 'yy', concept: 'YANK LINE', color: 'magenta', complexity: 1.3, targetType: 'line'},
        {keys: 'yw', concept: 'YANK WORD', color: 'magenta', complexity: 1.4, targetType: 'word'}
      ]
    },
    {
      name: 'Line Power Moves',
      description: 'Navigate files like a pro',
      commands: [
        {keys: 'gg', concept: 'TOP OF FILE', color: 'blue', complexity: 1.3, targetType: 'line'},
        {keys: 'G', concept: 'BOTTOM OF FILE', color: 'blue', complexity: 1.0, targetType: 'line'},
        {keys: '<C-d>', concept: 'HALF PAGE DOWN', color: 'blue', complexity: 1.2, targetType: 'line'},
        {keys: '<C-u>', concept: 'HALF PAGE UP', color: 'blue', complexity: 1.2, targetType: 'line'},
        {keys: '%', concept: 'MATCHING BRACKET', color: 'blue', complexity: 1.0, targetType: 'paren'}
      ]
    },
    {
      name: 'Text Objects',
      description: 'Game-changing power - operate on semantic units',
      commands: [
        {keys: 'diw', concept: 'DELETE INNER WORD', color: 'red', complexity: 1.8, targetType: 'word'},
        {keys: 'daw', concept: 'DELETE AROUND WORD', color: 'red', complexity: 1.8, targetType: 'word'},
        {keys: 'ci"', concept: 'CHANGE INNER QUOTES', color: 'red', complexity: 1.8, targetType: 'quote'},
        {keys: 'ca"', concept: 'CHANGE AROUND QUOTES', color: 'red', complexity: 1.8, targetType: 'quote'},
        {keys: 'di(', concept: 'DELETE INNER PARENS', color: 'red', complexity: 1.8, targetType: 'paren'},
        {keys: 'da(', concept: 'DELETE AROUND PARENS', color: 'red', complexity: 1.8, targetType: 'paren'},
        {keys: 'di{', concept: 'DELETE INNER BRACES', color: 'red', complexity: 1.8, targetType: 'block'},
        {keys: 'da{', concept: 'DELETE AROUND BRACES', color: 'red', complexity: 1.8, targetType: 'block'}
      ]
    },
    {
      name: 'Visual Mode',
      description: 'Select and operate on regions',
      commands: [
        {keys: 'v', concept: 'VISUAL CHAR', color: 'magenta', complexity: 1.0, targetType: 'visual'},
        {keys: 'V', concept: 'VISUAL LINE', color: 'magenta', complexity: 1.0, targetType: 'visual'},
        {keys: '<C-v>', concept: 'VISUAL BLOCK', color: 'magenta', complexity: 1.2, targetType: 'visual'}
      ]
    },
    {
      name: 'Search',
      description: 'Find anything instantly',
      commands: [
        {keys: '/', concept: 'SEARCH FORWARD', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: '?', concept: 'SEARCH BACKWARD', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'n', concept: 'NEXT RESULT', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'N', concept: 'PREV RESULT', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'f', concept: 'FIND CHAR FORWARD', color: 'cyan', complexity: 1.2, targetType: 'line'},
        {keys: 'F', concept: 'FIND CHAR BACK', color: 'cyan', complexity: 1.2, targetType: 'line'},
        {keys: 't', concept: 'TO CHAR FORWARD', color: 'cyan', complexity: 1.3, targetType: 'line'},
        {keys: 'T', concept: 'TO CHAR BACK', color: 'cyan', complexity: 1.3, targetType: 'line'}
      ]
    },
    {
      name: 'Advanced Combos',
      description: 'Mastery level - chain commands for maximum efficiency',
      commands: [
        {keys: '3w', concept: 'THREE WORDS FORWARD', color: 'cyan', complexity: 1.6, targetType: 'word'},
        {keys: '5j', concept: 'FIVE LINES DOWN', color: 'cyan', complexity: 1.6, targetType: 'line'},
        {keys: 'dt"', concept: 'DELETE TO QUOTE', color: 'red', complexity: 1.8, targetType: 'quote'},
        {keys: 'df)', concept: 'DELETE FIND PAREN', color: 'red', complexity: 1.8, targetType: 'paren'},
        {keys: 'ci[', concept: 'CHANGE INNER BRACKET', color: 'red', complexity: 1.8, targetType: 'block'},
        {keys: 'ya}', concept: 'YANK AROUND BRACE', color: 'magenta', complexity: 1.8, targetType: 'block'},
        {keys: '.', concept: 'REPEAT LAST', color: 'yellow', complexity: 1.0, targetType: 'line'}
      ]
    }
  ],

  targetGenerators: {
    line: () => {
      const lines = [
        'The quick brown fox jumps over the lazy dog',
        'Pack my box with five dozen liquor jugs',
        'How vexingly quick daft zebras jump',
        'Sphinx of black quartz, judge my vow'
      ]
      return lines[Math.floor(Math.random() * lines.length)]
    },
    word: () => {
      const words = [
        'hello world goodbye',
        'function argument parameter',
        'variable constant expression',
        'iterate traverse navigate'
      ]
      return words[Math.floor(Math.random() * words.length)]
    },
    block: () => {
      const blocks = [
        '{\n  name: "value",\n  other: "data"\n}',
        '{\n  x: 10,\n  y: 20,\n  z: 30\n}',
        'function example() {\n  return true\n}'
      ]
      return blocks[Math.floor(Math.random() * blocks.length)]
    },
    quote: () => {
      const quotes = [
        'The "important" word is here',
        'She said "hello world" quietly',
        'Key is "value" in JSON'
      ]
      return quotes[Math.floor(Math.random() * quotes.length)]
    },
    paren: () => {
      const parens = [
        'function(arg1, arg2, arg3)',
        'calculate(x, y, z)',
        'method(param)'
      ]
      return parens[Math.floor(Math.random() * parens.length)]
    },
    visual: () => {
      return 'Select this entire\nmultiline block\nof text here'
    }
  },

  keyNotation: {
    'C-': 'Ctrl+',
    'M-': 'Alt+',
    '<CR>': 'Enter',
    '<Esc>': 'Escape',
    '<Tab>': 'Tab',
    '<Space>': 'Space'
  }
}
```

## Color System
```javascript
const COLORS = {
  cyan: '#00CED1',      // Basic movement
  blue: '#4169E1',      // Line/file navigation
  yellow: '#FFD700',    // Insert modes
  red: '#DC143C',       // Delete/change
  magenta: '#9370DB',   // Copy/paste/visual
}
```

## SRS Algorithm

### Level Intervals
```javascript
const SRS_INTERVALS = [
  0,    // New/failed: immediate practice
  3,    // Learning: every 3-5 commands
  10,   // Familiar: every 10-15 commands
  25,   // Confident: every 25-30 commands
  50,   // Proficient: every 50-60 commands
  100   // Mastered: every 100+ commands (validation only)
]
```

### Opacity by Level
```javascript
const getOpacity = (level) => {
  const opacities = [1.0, 0.9, 0.7, 0.5, 0.3, 0.2]
  return opacities[level]
}
```

### Time Limits by Level
```javascript
const getTimeLimit = (command) => {
  const baseTimes = [5.0, 3.0, 2.0, 1.5, 1.2, 1.0]
  return baseTimes[command.level] * command.complexity
}
```

### Queue Selection Algorithm
```javascript
// 1. Priority to level 0 (new/failed)
// 2. Weighted random by inverse level: weight = 1/(level+1)
// 3. Filter by nextReview timestamp
```

### Progression Rules
- Correct answer: `successes++`, every 3 successes → level+1 (max 5)
- Wrong answer: `failures++`, level → 0 (reset to basics)
- Group unlock: when group average mastery ≥ 75%
- Mastery = `successes / (successes + failures)`

## UI Specifications

### Layout (80x24 minimum terminal size)
```
┌─ KeyBlitz: Neovim ─ Group 2/8 ─ Session: 5:23 ─ Combo: 🔥×12 ─┐
│                                                                  │
│                    ┌──────────────────────┐                     │
│                    │  DELETE INNER WORD   │                     │
│                    │  ══════════════════   │                     │
│                    │      d   i   w       │                     │
│                    │     ▓▓▓ ▓▓▓ ▓▓▓      │                     │
│                    │   Level: Learning    │                     │
│                    └──────────────────────┘                     │
│                                                                  │
│              Target: "hello [world] goodbye"                    │
│                             ↑ cursor                            │
│                                                                  │
│                       ⏱  1.5s remaining                         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Accuracy: 87% │ Score: 2,340 │ Mastered: 12/45 │ Next: Group 3│
└──────────────────────────────────────────────────────────────────┘
```

### Command Card States

**Level 0-1 (Full Display)**:
- Border: full opacity command color
- Keys: full size, bold, colored, with block indicators (▓▓▓)
- Metadata: "Times seen: 3" or "Success: 3/5"

**Level 2-3 (Fading)**:
- Keys: 50-70% opacity, normal weight
- Blocks: partial fill

**Level 4-5 (Concept Only)**:
- Keys: 20-30% opacity or hidden
- Concept: bold, full opacity
- Badge: "⭐ Mastered" for level 5

### Feedback Animations
- Success: Green flash (500ms), combo increment
- Failure: Red flash (1000ms), show correct keys, reset combo
- No animations beyond color flashes (keep it fast)

### Group Introduction Screen
```
┌────────────────────────────────────────────┐
│                                            │
│         🎯 NEW SKILL UNLOCKED!             │
│                                            │
│       GROUP 2: EFFICIENT INSERT            │
│                                            │
│   Master these commands for faster         │
│   text entry and line creation             │
│                                            │
│   Commands in this group: 4                │
│   Estimated time: 5 minutes                │
│                                            │
│          [Press SPACE to begin]            │
│                                            │
└────────────────────────────────────────────┘
```

### Stats Screen (invoked with 's' key)
```
┌─ Your Progress ─────────────────────────────────────────────────┐
│                                                                  │
│  Session Time: 18:42         Total Commands: 127                │
│  Best Combo: 23              Current Accuracy: 87%              │
│                                                                  │
│  Command Mastery:                                               │
│  ────────────────                                               │
│  w  ████████████████████ 95% ⭐ Mastered                        │
│  dd ████████████████░░░░ 82%   Confident                        │
│  diw ███████░░░░░░░░░░░░ 45%   Learning                         │
│  ci" ████░░░░░░░░░░░░░░░ 23% ⚠ Needs practice                   │
│                                                                  │
│  Weak Spots (extra drilling next session):                      │
│  • ci" - 23% accuracy                                           │
│  • dt) - 34% accuracy                                           │
│                                                                  │
│  Next Group Unlocks at 75% average mastery                      │
│  Current: 68% (7% to go!)                                       │
│                                                                  │
│                [Press ESC to continue]                           │
└──────────────────────────────────────────────────────────────────┘
```

## Key Input Handling

### Special Keys Notation
```javascript
const KEY_NOTATION = {
  'C-d': 'Ctrl+d',
  'C-u': 'Ctrl+u',
  'C-v': 'Ctrl+v',
  'C-w': 'Ctrl+w',
  '<CR>': 'Enter',
  '<Esc>': 'Escape',
  '<Tab>': 'Tab',
  '<Space>': 'Space'
}
```

### Input Buffer
- Accumulate keys in buffer until match or timeout
- Timeout: 2 seconds after last key press
- Match: exact sequence match (case-sensitive)
- Special handling for multi-key sequences (dd, gg, ci", etc.)

### Game Controls
- `q` or `Ctrl-c`: Quit game (save progress)
- `s`: Show stats screen
- `p`: Pause/resume
- `r`: Reset current session stats (keep progress)
- `?`: Show help overlay

## CLI Interface

### Commands
```bash
npx keyblitz neovim              # Start neovim training
npx keyblitz tmux                # Start tmux training
npx keyblitz hyprland            # Start hyprland training
npx keyblitz list                # List available packs
npx keyblitz neovim --reset      # Reset neovim progress
npx keyblitz neovim --stats      # Show neovim stats
npx keyblitz --version           # Show version
npx keyblitz --help              # Show help
```

### Arguments
```javascript
{
  pack: string,                  // Required: neovim, hyprland, tmux, etc.
  '--reset': boolean,            // Reset progress
  '--stats': boolean,            // Show stats only
  '--group': number,             // Start at specific group (debug)
  '--speed': number,             // Time multiplier (0.5-2.0, debug)
}
```

## Session Management

### Auto-save
- Save progress after every command
- Save on quit
- Atomic writes to prevent corruption

### Session Metrics
```javascript
{
  startTime: timestamp,
  endTime: timestamp,
  commandsAttempted: number,
  commandsCorrect: number,
  bestCombo: number,
  scoreEarned: number,
  groupProgress: {
    [groupIndex]: {
      attempted: number,
      correct: number
    }
  }
}
```

### Daily Streaks (future)
- Track consecutive days of practice
- Minimum 5 minutes per day to count
- Store in progress file

### Cursor Position Indicator
- Use `↑` or `[cursor]` or highlight to show where command would execute
- For text objects, highlight the target region

## Cross-terminal Compatibility

### Terminal Requirements
- Minimum size: 80x24
- Color support: 256 colors (fallback to 16)
- Unicode support: UTF-8

### Tested Terminals
- iTerm2 (macOS)
- Terminal.app (macOS)
- Windows Terminal
- Alacritty
- Kitty
- GNOME Terminal
- Konsole
- tmux sessions
- SSH sessions

### Fallbacks
- No unicode: Use ASCII box drawing
- No 256 color: Map to nearest 16 color
- Small terminal: Simplified layout

## Package.json
```json
{
  "name": "keyblitz",
  "version": "1.0.0",
  "description": "Master keybindings through reflex training",
  "type": "module",
  "bin": {
    "keyblitz": "./bin/cli.js"
  },
  "engines": {
    "node": ">=16"
  },
  "dependencies": {
    "ink": "^4.4.1",
    "ink-box": "^3.0.0",
    "ink-gradient": "^3.0.0",
    "ink-text-input": "^5.0.1",
    "ink-spinner": "^5.0.0",
    "chalk": "^5.3.0",
    "conf": "^11.0.2",
    "react": "^18.2.0",
    "meow": "^12.1.1"
  },
  "keywords": ["vim", "neovim", "tmux", "hyprland", "keybindings", "training", "cli", "tui"]
}
```

## Implementation Phases

### Phase 1: Core MVP (Neovim Groups 0-2)
- Pack loader and validator
- SRS engine
- Command queue
- Basic UI (card, header, footer)
- Neovim pack with groups 0-2 only
- Progress storage
- Input handling

### Phase 2: Complete Neovim (Groups 3-8)
- All neovim groups
- Group introduction screens
- Stats screen
- Enhanced feedback
- Pack validation command

### Phase 3: Additional Packs
- Hyprland pack
- Tmux pack
- VS Code pack
- Pack template and creation guide

### Phase 4: Polish
- Sound effects (optional beep module)
- Daily streaks
- Leaderboards (local only)
- Export stats to JSON
- Community pack support

## Testing Strategy
- Unit tests: SRS algorithm, queue logic, scoring
- Integration tests: full game flow
- Manual testing: all target terminals
- Use `ink-testing-library` for component tests

## Success Metrics
- Complete session without quitting: engagement
- Commands reaching level 5: mastery
- Accuracy > 80%: effectiveness
- Session time > 5 min: retention

## Future Packs

### Hyprland (tiling WM)
- Window navigation: `Super+[hjkl]`
- Workspace switching: `Super+[1-9]`
- Window management: `Super+[v/h/f/q]`
- ~30 commands across 4 groups

### Tmux (terminal multiplexer)
- Prefix combos: `C-b %`, `C-b "`, etc.
- Pane navigation: `C-b [hjkl]`
- Window management: `C-b [c/n/p/&]`
- ~25 commands across 3 groups

### VS Code
- Navigation: `Ctrl+P`, `Ctrl+Shift+P`, `Ctrl+B`
- Editing: `Ctrl+D`, `Alt+Up/Down`, `Ctrl+/`
- Multi-cursor: `Ctrl+Alt+Up/Down`, `Ctrl+Shift+L`
- ~35 commands across 5 groups

### Photoshop
- Tool shortcuts: `V`, `B`, `E`, etc.
- Layer operations: `Ctrl+[J/E/G]`
- Transform: `Ctrl+T`, `Ctrl+Alt+T`
- ~40 commands across 5 groups

## Pack Creation Guide

### Adding a New Pack

1. **Create pack file**: `src/packs/yourpack.js`
2. **Follow schema**: Use pack structure defined above
3. **Export default**: Must export default object with all required fields
4. **Register**: Import in `src/packs/index.js`
5. **Test**: Run `npx keyblitz yourpack --group 0 --speed 2.0`

### Pack Creation Template (`src/packs/README.md`)
```javascript
// src/packs/template.js
export default {
  id: 'myapp',                   // Lowercase, alphanumeric + hyphens
  name: 'My Application',        // Display name
  description: 'Short description of what you\'ll learn',
  version: '1.0.0',

  groups: [
    {
      name: 'Group Name',
      description: 'What this group teaches',
      commands: [
        {
          keys: 'k',             // Single key or sequence
          concept: 'ACTION',     // ALL CAPS, concise
          color: 'cyan',         // cyan|blue|yellow|red|magenta|green|white
          complexity: 1.0,       // 1.0-2.0 (affects time limit)
          targetType: 'line',    // Must match a targetGenerator key
          example: 'Optional usage example'
        }
      ]
    }
  ],

  targetGenerators: {
    line: () => 'Sample text for this target type',
    // Add more as needed
  },

  keyNotation: {                 // Optional: custom notation
    'C-': 'Ctrl+',
  }
}
```

### Pack Validation
Run validation before committing:
```bash
npx keyblitz validate mypack
```

Checks:
- Schema compliance
- No duplicate command keys
- All targetTypes have generators
- Command counts within limits (1-50 per group)
- Color names are valid
- Complexity values in range

### Best Practices
- **Group size**: 4-12 commands per group
- **Progression**: Easy → hard within groups
- **Complexity**: 1.0 for single keys, 1.3-1.5 for doubles, 1.6-2.0 for complex
- **Colors**: Group by operation type (movement=cyan/blue, edit=red, etc.)
- **Concepts**: 2-4 words max, ALL CAPS, clear action
- **Target variety**: 3-5 different examples per generator

### Community Packs (future)
- Support external pack loading via npm
- Pack packages: `@keyblitz/pack-emacs`, `@keyblitz/pack-blender`, etc.
- Load with: `npx keyblitz @keyblitz/pack-emacs`

## Non-Goals
- Multiplayer/online features
- Custom keybinding support (v1)
- GUI version
- Mobile support
- Vim mode emulation (just key training)
- Integration with actual applications

## File Size Target
- Package size: < 5MB
- Install time: < 10 seconds
- Startup time: < 500ms
- Memory usage: < 50MB

## Accessibility
- Colorblind mode: use patterns + colors
- Screen reader: text-only mode flag
- High contrast mode: configurable
- Keyboard only: no mouse required (obviously)