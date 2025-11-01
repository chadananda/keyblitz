import chalk from 'chalk';

/**
 * Color definitions mapped to Vim command types and UI elements
 * Each color represents a category of keyboard shortcuts for visual organization
 */
export const COLORS = {
  cyan: '#00CED1',      // Basic movement commands (h, j, k, l, etc)
  blue: '#4169E1',      // Line/file navigation (G, gg, :, /, etc)
  yellow: '#FFD700',    // Insert modes and text manipulation (i, a, o, etc)
  red: '#DC143C',       // Delete/change operations (d, c, x, etc)
  magenta: '#9370DB',   // Copy/paste/visual modes (y, v, p, etc)
  green: '#32CD32',     // Success feedback and confirmations
  white: '#FFFFFF',     // Default/neutral text
};

/**
 * Opacity lookup table by level (0-5)
 * Level 0: Highest visibility (fully opaque)
 * Level 5: Lowest visibility (very faded)
 * Used for visual hierarchy in command display
 * @param {number} level - Depth/priority level (0-5)
 * @returns {number} Opacity value between 0.2 and 1.0
 */
export function getOpacity(level) {
  const opacities = [1.0, 0.9, 0.7, 0.5, 0.3, 0.2];
  return opacities[Math.min(level, opacities.length - 1)];
}

/**
 * Applies a color to text with optional opacity consideration
 * Note: chalk doesn't support true opacity in terminal output,
 * but this function supports the opacity parameter for future UI renderers
 * @param {string} text - Text content to colorize
 * @param {string} colorName - Color name from COLORS object
 * @param {number} opacity - Opacity value 0-1 (optional, defaults to 1.0)
 * @returns {string} Text colorized with chalk
 */
export function getColoredText(text, colorName, opacity = 1.0) {
  const hex = COLORS[colorName] || COLORS.white;

  // Chalk doesn't support opacity in terminal output,
  // so we use hex colors directly for visual distinction
  // Opacity parameter is preserved for compatibility with other renderers
  try {
    return chalk.hex(hex)(text);
  } catch (error) {
    // Fallback to white if color fails
    return chalk.white(text);
  }
}
