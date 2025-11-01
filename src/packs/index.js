import neovim from './neovim.js';
import hyprland from './hyprland.js';
import tmux from './tmux.js';

/**
 * Pack Registry - Auto-discovers and exports all available packs
 */
export const PACKS = {
  neovim,
  hyprland,
  tmux
};

/**
 * Retrieve a single pack by ID
 * @param {string} id - The pack identifier
 * @returns {Object} The pack object
 * @throws {Error} If pack ID not found
 */
export function getPack(id) {
  const pack = PACKS[id];
  if (!pack) {
    throw new Error(`Pack "${id}" not found. Available packs: ${Object.keys(PACKS).join(', ')}`);
  }
  return pack;
}

/**
 * List all available packs with metadata
 * @returns {Array<Object>} Array of pack summaries
 */
export function listPacks() {
  return Object.keys(PACKS).map(id => ({
    id,
    name: PACKS[id].name,
    description: PACKS[id].description,
    version: PACKS[id].version || '1.0.0',
    commandCount: PACKS[id].groups.reduce((sum, g) => sum + g.commands.length, 0),
    groupCount: PACKS[id].groups.length
  }));
}

/**
 * Get detailed summary of a specific pack
 * @param {string} id - The pack identifier
 * @returns {Object} Pack summary with group breakdown
 * @throws {Error} If pack ID not found
 */
export function getPackSummary(id) {
  const pack = getPack(id);
  return {
    id: pack.id,
    name: pack.name,
    description: pack.description,
    totalCommands: pack.groups.reduce((sum, g) => sum + g.commands.length, 0),
    groups: pack.groups.map(g => ({
      name: g.name,
      description: g.description,
      commandCount: g.commands.length
    }))
  };
}
