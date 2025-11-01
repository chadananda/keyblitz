/**
 * Key Parser - Handle special key notation and input buffering
 * Converts vim-style notation like '<C-d>' to standard key representations
 */

/**
 * Special key mappings for common terminal keys
 */
const SPECIAL_KEYS = {
  '<CR>': 'Enter',
  '<Enter>': 'Enter',
  '<Return>': 'Enter',
  '<Esc>': 'Escape',
  '<Escape>': 'Escape',
  '<Tab>': 'Tab',
  '<Space>': ' ',
  '<BS>': 'Backspace',
  '<Backspace>': 'Backspace',
  '<Del>': 'Delete',
  '<Delete>': 'Delete',
  '<Up>': 'ArrowUp',
  '<Down>': 'ArrowDown',
  '<Left>': 'ArrowLeft',
  '<Right>': 'ArrowRight',
  '<Home>': 'Home',
  '<End>': 'End',
  '<PageUp>': 'PageUp',
  '<PageDown>': 'PageDown',
};

/**
 * Parse key notation and convert to standard format
 * Handles: C- (Ctrl), M- (Alt), S- (Shift)
 * Handles: <CR>, <Esc>, <Tab>, <Space>, etc.
 *
 * @param {string} keys - Key sequence in vim notation (e.g., '<C-d>', 'C-b %', 'gg')
 * @param {Object} notation - Custom notation map (e.g., {'C-b': 'Ctrl+b '})
 * @returns {string} Converted key sequence
 *
 * @example
 * parseKeyNotation('<C-d>') // => 'Ctrl+d'
 * parseKeyNotation('<M-x>') // => 'Alt+x'
 * parseKeyNotation('<S-a>') // => 'Shift+a'
 * parseKeyNotation('<C-S-p>') // => 'Ctrl+Shift+p'
 * parseKeyNotation('C-b %', {'C-b': 'Ctrl+b '}) // => 'Ctrl+b %'
 */
export function parseKeyNotation(keys, notation = {}) {
  if (!keys || typeof keys !== 'string') {
    return '';
  }

  let result = keys;

  // Apply custom notation mappings first (like tmux 'C-b' prefix)
  for (const [pattern, replacement] of Object.entries(notation)) {
    if (result.startsWith(pattern)) {
      result = replacement + result.slice(pattern.length);
      break;
    }
  }

  // Replace special keys like <CR>, <Esc>, etc.
  for (const [special, replacement] of Object.entries(SPECIAL_KEYS)) {
    result = result.replaceAll(special, replacement);
  }

  // Handle bracketed modifier notation: <C-x>, <M-x>, <S-x>, <C-S-x>
  result = result.replace(/<((?:[CMS]-)+)(.+?)>/gi, (match, modifiers, key) => {
    const mods = [];
    const upperMods = modifiers.toUpperCase();

    // Check for each modifier in order
    if (upperMods.includes('C-')) mods.push('Ctrl');
    if (upperMods.includes('M-')) mods.push('Alt');
    if (upperMods.includes('S-')) mods.push('Shift');

    // Convert special key names if present
    const finalKey = SPECIAL_KEYS[`<${key}>`] || key;

    return mods.length > 0 ? `${mods.join('+')}+${finalKey}` : finalKey;
  });

  // Handle bare C-, M-, S- prefixes (without brackets)
  result = result.replace(/\b([CMS])-(\S)/gi, (match, modifier, key) => {
    const modMap = { C: 'Ctrl', M: 'Alt', S: 'Shift' };
    return `${modMap[modifier.toUpperCase()]}+${key}`;
  });

  return result;
}

/**
 * Normalize keys for comparison
 * Handles case sensitivity and whitespace
 *
 * @param {string} keys - Key sequence to normalize
 * @returns {string} Normalized key sequence
 *
 * @example
 * normalizeKeys('Ctrl+D') // => 'ctrl+d'
 * normalizeKeys('  gg  ') // => 'gg'
 */
export function normalizeKeys(keys) {
  if (!keys || typeof keys !== 'string') {
    return '';
  }

  return keys
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' '); // Normalize multiple spaces to single space
}

/**
 * Input Buffer Class - Accumulates keypresses with timeout
 * Used for multi-key sequences like 'gg', 'dd', etc.
 */
export class InputBuffer {
  /**
   * @param {number} timeout - Time in ms before buffer auto-clears (default: 2000)
   */
  constructor(timeout = 2000) {
    this.buffer = '';
    this.timeout = timeout;
    this.timer = null;
  }

  /**
   * Add a key to the buffer and reset timeout
   * @param {string} key - Key to add to buffer
   */
  addKey(key) {
    this.buffer += key;
    this._resetTimer();
  }

  /**
   * Clear buffer and cancel timeout
   */
  clear() {
    this.buffer = '';
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Check if current buffer matches target sequence
   * @param {string} target - Target key sequence to match
   * @returns {boolean} True if buffer matches target
   */
  matches(target) {
    return this.buffer === target;
  }

  /**
   * Check if target sequence starts with current buffer
   * @param {string} target - Target key sequence
   * @returns {boolean} True if target starts with buffer
   */
  isPartialMatch(target) {
    return this.buffer.length > 0 && target.startsWith(this.buffer) && this.buffer.length < target.length;
  }

  /**
   * Get current buffer contents
   * @returns {string} Current buffer
   */
  get() {
    return this.buffer;
  }

  /**
   * Get buffer length
   * @returns {number} Number of characters in buffer
   */
  length() {
    return this.buffer.length;
  }

  /**
   * Reset the auto-clear timer
   * @private
   */
  _resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.clear();
    }, this.timeout);
  }
}
