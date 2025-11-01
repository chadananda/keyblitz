#!/usr/bin/env node

import meow from 'meow';
import { render } from 'ink';
import React from 'react';
import { startGame } from '../dist/index.js';
import PackSelector from '../dist/ui/PackSelector.js';
import { listPacks, getPack } from '../dist/packs/index.js';
import { Storage } from '../dist/utils/storage.js';

const cli = meow(`
  Usage
    $ keyblitz <pack>           Start training with specified pack
    $ keyblitz                  Show interactive pack selector
    $ keyblitz list             List all available packs
    $ keyblitz <pack> --stats   Show stats for pack
    $ keyblitz <pack> --reset   Reset progress for pack

  Options
    --stats    Show statistics for a pack
    --reset    Reset progress for a pack
    --help     Show this help message
    --version  Show version number

  Examples
    $ keyblitz                  # Interactive pack selection
    $ keyblitz neovim           # Start Neovim training
    $ keyblitz hyprland         # Start Hyprland training
    $ keyblitz tmux             # Start Tmux training
    $ keyblitz tmux --stats     # Show Tmux statistics
    $ keyblitz neovim --reset   # Reset Neovim progress
    $ keyblitz list             # List all packs
`, {
  importMeta: import.meta,
  flags: {
    stats: {
      type: 'boolean',
      default: false
    },
    reset: {
      type: 'boolean',
      default: false
    }
  }
});

async function main() {
  const packId = cli.input[0];

  // List packs
  if (packId === 'list' || cli.flags.list) {
    const packs = listPacks();
    console.log('\nAvailable keybinding packs:\n');
    packs.forEach(pack => {
      console.log(`  ${pack.name.padEnd(20)} - ${pack.description}`);
      console.log(`    ${pack.commandCount} commands across ${pack.groupCount} groups\n`);
    });
    return;
  }

  // Show stats
  if (cli.flags.stats) {
    if (!packId) {
      console.error('Error: Please specify a pack. Example: keyblitz neovim --stats');
      process.exit(1);
    }

    try {
      const pack = getPack(packId);
      const storage = new Storage(packId);
      const progress = storage.loadProgress();

      console.log(`\nStats for ${pack.name}:\n`);
      console.log(`  Total commands attempted: ${progress.globalStats?.totalCommands || 0}`);
      console.log(`  Total score: ${(progress.globalStats?.totalScore || 0).toLocaleString()}`);
      console.log(`  Best combo: ${progress.globalStats?.bestCombo || 0}`);
      console.log(`  Session time: ${Math.floor((progress.globalStats?.totalTime || 0) / 60000)} minutes\n`);

      const masteredCount = Object.values(progress.commandStats || {}).filter(c => c.level === 5).length;
      const totalCommands = pack.groups.flatMap(g => g.commands).length;
      console.log(`  Mastered: ${masteredCount}/${totalCommands} commands\n`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
    return;
  }

  // Reset progress
  if (cli.flags.reset) {
    if (!packId) {
      console.error('Error: Please specify a pack. Example: keyblitz neovim --reset');
      process.exit(1);
    }

    try {
      const pack = getPack(packId);
      const storage = new Storage(packId);
      storage.resetProgress();
      console.log(`\nReset progress for ${pack.name}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
    return;
  }

  // Start game with specific pack
  if (packId) {
    try {
      getPack(packId); // Validate pack exists
      startGame(packId);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      const packs = listPacks();
      console.log('\nAvailable packs:', packs.map(p => p.id).join(', '));
      process.exit(1);
    }
    return;
  }

  // Interactive pack selector
  render(React.createElement(PackSelector, {
    onSelect: (selectedPackId) => {
      startGame(selectedPackId);
    }
  }));
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
