# ⚡ KeyBlitz

```
██╗  ██╗███████╗██╗   ██╗██████╗ ██╗     ██╗████████╗███████╗
██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔══██╗██║     ██║╚══██╔══╝╚══███╔╝
█████╔╝ █████╗   ╚████╔╝ ██████╔╝██║     ██║   ██║     ███╔╝
██╔═██╗ ██╔══╝    ╚██╔╝  ██╔══██╗██║     ██║   ██║    ███╔╝
██║  ██╗███████╗   ██║   ██████╔╝███████╗██║   ██║   ███████╗
╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝   ╚═╝   ╚══════╝
```

### Master keyboard shortcuts through muscle memory and spaced repetition

Stop fumbling for your mouse. Build lightning-fast reflexes for the tools you use every day.

[![npm version](https://img.shields.io/npm/v/keyblitz.svg)](https://www.npmjs.com/package/keyblitz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org)

---

## 🎯 The Problem

You know the shortcuts *exist*. You've seen them. You've looked them up. But when you need them... your hand reaches for the mouse.

**Sound familiar?**

- 🐌 Watching senior devs fly through Vim while you arrow-key around
- 😤 Clicking through menus in VS Code for the 100th time
- 🤦 Forgetting `Ctrl+B %` in tmux *again*
- 💔 Wasting 20 minutes per day on repetitive mouse movements

**The issue isn't knowledge. It's muscle memory.**

---

## ⚡ The Solution

**KeyBlitz** is a terminal game that trains your fingers, not just your brain. Using proven spaced repetition algorithms (the same technique that makes Anki and Duolingo work), KeyBlitz:

✨ **Builds reflexes** - Practice shortcuts until they become automatic
🧠 **Adapts to you** - Focuses on what you struggle with
🎮 **Makes it fun** - Combos, streaks, and satisfying progression
📊 **Tracks progress** - See your mastery grow over time
🚀 **Zero install** - Run with `npx`, no setup required

---

## 🎮 How It Works

```
┌─ KeyBlitz: Neovim ─ Group 2/9 ─ Session: 5:23 ─ Combo: 🔥×12 ─┐
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

**The game shows you a command.** You execute the shortcut. Fast = points. Slow = retry.

As you master commands, they **fade away** - leaving only the concept. Eventually you're executing from pure muscle memory.

Fail too many times? The command **resets to basics** for more practice.

Get on a streak? **Combos and multipliers** make it addictive.

---

## 🚀 Quick Start

```bash
# Interactive mode - choose your app
npx keyblitz

# Jump straight into training
npx keyblitz neovim
npx keyblitz hyprland
npx keyblitz vscode

# View your progress
npx keyblitz neovim --stats

# Start fresh
npx keyblitz neovim --reset
```

**That's it.** No installation, no config files, no setup. Just run and train.

---

## 📦 Available Packs

### Developer Tools
- **Neovim** - Master Vim/Neovim keybindings (~70 commands, 9 groups)
- **VS Code** - Visual Studio Code shortcuts (~40 commands)
- **Hyprland** - Tiling window manager navigation (~30 commands)
- **Tmux** - Terminal multiplexer commands (~25 commands)
- **Chrome DevTools** - Browser debugging shortcuts (~40 commands)
- **IntelliJ IDEA** - JetBrains IDE navigation (~50 commands)
- **Git CLI** - Essential Git terminal commands (~25 commands)
- **Emacs** - Alternative power editor (~60 commands)

### Creative Tools
- **Figma** - Modern design tool shortcuts (~50 commands)
- **Photoshop** - Raster design and photo editing (~60 commands)
- **Illustrator** - Vector design workflows (~50 commands)
- **Premiere Pro** - Video editing shortcuts (~50 commands)

### Productivity
- **Chrome/Firefox** - Browser navigation (~40 commands)
- **Excel/Sheets** - Spreadsheet power user shortcuts (~60 commands)
- **macOS** - System-level keyboard shortcuts (~50 commands)
- **Slack** - Team communication shortcuts (~35 commands)

Want more packs? [Check the pack creation guide](src/packs/README.md) or request one in the issues!

---

## 🧠 Why Spaced Repetition?

KeyBlitz uses the **SM-2 algorithm** (the science behind Anki, SuperMemo, and Duolingo) to determine when you see each command:

- **New commands**: Practice immediately and frequently
- **Struggling commands**: See them more often until mastered
- **Confident commands**: Review occasionally to maintain
- **Mastered commands**: Rare validation checks only

**Result?** You spend time where it matters most - on the shortcuts you're still learning.

---

## ✨ Features

🎯 **Progressive Unlocking** - Master fundamentals before advanced techniques
⏱️ **Adaptive Timing** - Harder commands get more time
🔥 **Combo System** - Streaks and multipliers reward consistency
📊 **Detailed Stats** - Track mastery per command, accuracy, weak spots
🎨 **Visual Feedback** - Commands fade as you master them
💾 **Auto-save Progress** - Pick up exactly where you left off
🌈 **Beautiful TUI** - Colorful, responsive terminal interface
🖥️ **Cross-platform** - Works on macOS, Linux, Windows
🔌 **Zero Dependencies** - Just Node.js 16+

---

## 🛠️ How Commands Progress

```
Level 0: NEW        → Show every 1-3 commands   (⏱️ 5.0s timeout)
Level 1: LEARNING   → Show every 3-5 commands   (⏱️ 3.0s timeout)
Level 2: FAMILIAR   → Show every 10-15 commands (⏱️ 2.0s timeout)
Level 3: CONFIDENT  → Show every 25-30 commands (⏱️ 1.5s timeout)
Level 4: PROFICIENT → Show every 50-60 commands (⏱️ 1.2s timeout)
Level 5: MASTERED   → Show every 100+ commands  (⏱️ 1.0s timeout)
```

**Get it right 3 times in a row?** Level up.
**Get it wrong once?** Back to basics.

This ensures **true mastery**, not just memorization.

---

## 🎨 Pack Creation

Want to create your own pack? It's just a JavaScript object:

```javascript
export default {
  id: 'myapp',
  name: 'My Application',
  description: 'Learn my favorite shortcuts',

  groups: [
    {
      name: 'Core Navigation',
      description: 'Essential movement commands',
      commands: [
        {
          keys: 'h',
          concept: 'MOVE LEFT',
          color: 'cyan',
          complexity: 1.0,
          targetType: 'line'
        },
        // ... more commands
      ]
    }
  ],

  targetGenerators: {
    line: () => 'Sample text here'
  }
}
```

See the [Pack Creation Guide](src/packs/README.md) for full details.

---

## 📈 Success Metrics (Planned)

- Daily streak tracking
- Command mastery percentages
- Weak spot identification
- Session time and accuracy
- Local leaderboards
- Stats export to JSON

---

## 🎯 Philosophy

**Keyboard shortcuts aren't about memorization. They're about reflexes.**

You don't "remember" how to type. You don't "recall" how to catch a ball. Your fingers just *know*.

KeyBlitz treats shortcuts the same way:
- **Repetition** builds neural pathways
- **Timing pressure** simulates real usage
- **Progressive difficulty** prevents overwhelm
- **Spaced practice** ensures retention

After a few sessions, you won't be *thinking* about shortcuts anymore. You'll just be *faster*.

---

## 🚧 Project Status

**Currently in development!** Watch this repo for updates.

The namespace is reserved on npm. Full release coming soon with:
- ✅ Complete Neovim pack
- ✅ Hyprland window manager pack
- ✅ Tmux terminal multiplexer pack
- 🚧 VS Code pack (in progress)
- 🚧 Comprehensive testing suite
- 🚧 Additional packs (creative tools, productivity apps)

---

## 🤝 Contributing

Contributions welcome! Whether it's:
- 🎨 New packs for your favorite apps
- 🐛 Bug reports
- 💡 Feature suggestions
- 📖 Documentation improvements

Open an issue or submit a PR on [GitHub](https://github.com/chadananda/keyblitz).

---

## 📜 License

MIT © [Chad Jones](https://github.com/chadananda)

---

## 🌐 Links

- **Website**: [xSwarm.ai](https://xSwarm.ai)
- **GitHub**: [github.com/chadananda/keyblitz](https://github.com/chadananda/keyblitz)
- **npm**: [npmjs.com/package/keyblitz](https://www.npmjs.com/package/keyblitz)
- **Author**: Chad Jones ([chadananda@gmail.com](mailto:chadananda@gmail.com))

---

**Ready to stop clicking and start flying?** 🚀

```bash
npx keyblitz
```

*Your fingers will thank you.*
