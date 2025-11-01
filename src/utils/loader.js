/**
 * Pack Loader - Validate and load training packs
 * Ensures pack integrity and provides auto-discovery
 */

import { COLORS } from './colors.js';

/**
 * Valid target types for pack commands
 */
const VALID_TARGET_TYPES = new Set([
  'pane', 'window', 'session', 'mode', 'help', 'command',
  'workspace', 'split', 'container', 'output',
  'motion', 'text', 'line', 'word', 'char', 'search',
  'visual', 'buffer', 'file', 'mark', 'register',
  'fold', 'tab', 'macro', 'plugin',
  'paren', 'quote', 'block', // Text object target types
  'layout', 'app', 'system' // Window manager target types
]);

/**
 * Validate a pack object against the expected schema
 *
 * @param {Object} pack - Pack object to validate
 * @throws {Error} If pack is invalid with descriptive message
 * @returns {boolean} True if valid
 */
export function validatePack(pack) {
  // Check pack exists
  if (!pack || typeof pack !== 'object') {
    throw new Error('Pack must be an object');
  }

  // Required top-level fields
  if (!pack.id || typeof pack.id !== 'string') {
    throw new Error('Pack must have a valid "id" field (string)');
  }
  if (!pack.name || typeof pack.name !== 'string') {
    throw new Error('Pack must have a valid "name" field (string)');
  }
  if (!pack.description || typeof pack.description !== 'string') {
    throw new Error(`Pack "${pack.id}" must have a valid "description" field (string)`);
  }

  // Validate groups
  if (!Array.isArray(pack.groups) || pack.groups.length === 0) {
    throw new Error(`Pack "${pack.id}" must have at least one group in "groups" array`);
  }

  // Validate each group
  pack.groups.forEach((group, groupIdx) => {
    if (!group.name || typeof group.name !== 'string') {
      throw new Error(`Pack "${pack.id}" group ${groupIdx} must have a valid "name" field`);
    }
    if (!group.description || typeof group.description !== 'string') {
      throw new Error(`Pack "${pack.id}" group "${group.name}" must have a valid "description" field`);
    }
    if (!Array.isArray(group.commands) || group.commands.length === 0) {
      throw new Error(`Pack "${pack.id}" group "${group.name}" must have at least one command`);
    }

    // Validate each command
    group.commands.forEach((cmd, cmdIdx) => {
      const cmdLabel = `Pack "${pack.id}" group "${group.name}" command ${cmdIdx}`;

      if (!cmd.keys || typeof cmd.keys !== 'string') {
        throw new Error(`${cmdLabel} must have a valid "keys" field (string)`);
      }
      if (!cmd.concept || typeof cmd.concept !== 'string') {
        throw new Error(`${cmdLabel} must have a valid "concept" field (string)`);
      }
      if (!cmd.color || typeof cmd.color !== 'string') {
        throw new Error(`${cmdLabel} must have a valid "color" field (string)`);
      }
      if (!COLORS[cmd.color]) {
        throw new Error(`${cmdLabel} has invalid color "${cmd.color}". Valid colors: ${Object.keys(COLORS).join(', ')}`);
      }
      if (typeof cmd.complexity !== 'number' || cmd.complexity < 1.0 || cmd.complexity > 5.0) {
        throw new Error(`${cmdLabel} must have a "complexity" field between 1.0 and 5.0 (got: ${cmd.complexity})`);
      }
      if (!cmd.targetType || typeof cmd.targetType !== 'string') {
        throw new Error(`${cmdLabel} must have a valid "targetType" field (string)`);
      }
      if (!VALID_TARGET_TYPES.has(cmd.targetType)) {
        throw new Error(`${cmdLabel} has invalid targetType "${cmd.targetType}". Common types: motion, text, line, pane, window, buffer, etc.`);
      }
    });
  });

  // Validate targetGenerators
  if (!pack.targetGenerators || typeof pack.targetGenerators !== 'object') {
    throw new Error(`Pack "${pack.id}" must have a "targetGenerators" object`);
  }

  // Collect all target types used in commands
  const usedTargetTypes = new Set();
  pack.groups.forEach(group => {
    group.commands.forEach(cmd => {
      usedTargetTypes.add(cmd.targetType);
    });
  });

  // Ensure all used target types have generators
  for (const targetType of usedTargetTypes) {
    if (typeof pack.targetGenerators[targetType] !== 'function') {
      throw new Error(`Pack "${pack.id}" is missing targetGenerator function for targetType "${targetType}"`);
    }
  }

  // Validate keyNotation if present
  if (pack.keyNotation !== undefined) {
    if (typeof pack.keyNotation !== 'object' || pack.keyNotation === null) {
      throw new Error(`Pack "${pack.id}" has invalid "keyNotation" field (must be object)`);
    }
    // Validate each notation entry
    for (const [key, value] of Object.entries(pack.keyNotation)) {
      if (typeof key !== 'string' || typeof value !== 'string') {
        throw new Error(`Pack "${pack.id}" keyNotation entries must be string->string mappings`);
      }
    }
  }

  return true;
}

/**
 * Load a specific pack by ID
 *
 * @param {string} packId - Pack identifier (e.g., 'neovim', 'tmux')
 * @returns {Promise<Object>} Validated pack object
 * @throws {Error} If pack cannot be loaded or is invalid
 *
 * @example
 * const pack = await loadPack('neovim');
 */
export async function loadPack(packId) {
  if (!packId || typeof packId !== 'string') {
    throw new Error('Pack ID must be a non-empty string');
  }

  try {
    // Import pack from packs directory
    const packModule = await import(`../packs/${packId}.js`);
    const pack = packModule.default;

    if (!pack) {
      throw new Error(`Pack "${packId}" did not export a default object`);
    }

    // Validate pack structure
    validatePack(pack);

    return pack;
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(`Pack "${packId}" not found in packs directory`);
    }
    throw error;
  }
}

/**
 * Auto-discover and list all available packs
 *
 * @returns {Promise<Array<Object>>} Array of pack metadata: {id, name, description}
 * @throws {Error} If packs directory cannot be read
 *
 * @example
 * const packs = await listPacks();
 * // [
 * //   {id: 'neovim', name: 'Neovim', description: '...'},
 * //   {id: 'tmux', name: 'Tmux', description: '...'}
 * // ]
 */
export async function listPacks() {
  try {
    // Import the pack index which maintains the registry
    const { listPacks: indexListPacks } = await import('../packs/index.js');
    return indexListPacks();
  } catch (error) {
    throw new Error(`Failed to list packs: ${error.message}`);
  }
}
