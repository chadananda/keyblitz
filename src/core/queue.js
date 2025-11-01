/**
 * Command Queue Manager
 *
 * Implements weighted random selection for spaced repetition learning.
 * Lower level commands (new/failed) appear more frequently than mastered ones.
 *
 * Algorithm:
 * 1. Filter commands by nextReview timestamp (only show commands due for review)
 * 2. Prioritize level 0 commands (new/failed - always show if available)
 * 3. For other levels, use weighted random selection: weight = 1/(level+1)
 * 4. Return selected command or null if queue is empty
 */

/**
 * Calculate weights for all commands based on their SRS level
 * Lower levels get higher weights (appear more frequently)
 *
 * @param {Array} commands - Array of command objects with level property
 * @returns {Array} Array of weights corresponding to each command
 *
 * @example
 * const commands = [
 *   { keys: 'dd', level: 0 },  // weight = 1/(0+1) = 1.0
 *   { keys: 'yy', level: 2 },  // weight = 1/(2+1) = 0.33
 *   { keys: 'gg', level: 4 }   // weight = 1/(4+1) = 0.2
 * ]
 * getCommandWeights(commands) // [1.0, 0.33, 0.2]
 */
export function getCommandWeights(commands) {
  if (!Array.isArray(commands)) {
    throw new TypeError('commands must be an array');
  }

  return commands.map(cmd => {
    // Validate command has level property
    if (typeof cmd.level !== 'number') {
      throw new TypeError(`Command "${cmd.keys || 'unknown'}" missing level property`);
    }

    // Weight formula: 1/(level+1)
    // Level 0: weight = 1.0 (highest priority)
    // Level 1: weight = 0.5
    // Level 2: weight = 0.33
    // Level 3: weight = 0.25
    // Level 4: weight = 0.2
    // Level 5: weight = 0.16 (lowest priority)
    return 1 / (cmd.level + 1);
  });
}

/**
 * Select next command using weighted random selection
 *
 * @param {Array} commands - Array of command objects with SRS state
 * @param {number|null} currentCommandIndex - Index of current command (to avoid repeating)
 * @returns {Object|null} Selected command object or null if no commands available
 *
 * Selection algorithm:
 * 1. Filter out commands not due for review (nextReview > now)
 * 2. Filter out current command to avoid immediate repetition
 * 3. Prioritize level 0 commands (new/failed) - if any exist, randomly pick one
 * 4. For other levels, use weighted random selection
 * 5. Return null if no commands are available
 */
export function selectNextCommand(commands, currentCommandIndex = null) {
  // Validate input
  if (!Array.isArray(commands)) {
    throw new TypeError('commands must be an array');
  }

  // Edge case: empty array
  if (commands.length === 0) {
    return null;
  }

  const now = Date.now();

  // Step 1: Filter commands due for review
  // Only include commands where nextReview <= now (or nextReview is undefined/null)
  const dueCommands = commands
    .map((cmd, index) => ({ ...cmd, originalIndex: index }))
    .filter(cmd => {
      // If nextReview is not set, command is due
      if (cmd.nextReview === undefined || cmd.nextReview === null) {
        return true;
      }
      // Otherwise check if it's time for review
      return cmd.nextReview <= now;
    });

  // Edge case: no commands due for review
  if (dueCommands.length === 0) {
    return null;
  }

  // Step 2: Filter out current command to avoid immediate repetition
  const availableCommands = dueCommands.filter(
    cmd => cmd.originalIndex !== currentCommandIndex
  );

  // Edge case: only current command is available
  // In this case, we allow repetition (no choice)
  const commandPool = availableCommands.length > 0 ? availableCommands : dueCommands;

  // Step 3: Prioritize level 0 commands (new/failed)
  const level0Commands = commandPool.filter(cmd => cmd.level === 0);

  if (level0Commands.length > 0) {
    // Randomly select from level 0 commands
    const randomIndex = Math.floor(Math.random() * level0Commands.length);
    return level0Commands[randomIndex];
  }

  // Step 4: Weighted random selection for other levels
  const weights = getCommandWeights(commandPool);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  // Edge case: all weights are 0 (shouldn't happen, but defensive)
  if (totalWeight === 0) {
    // Fall back to uniform random selection
    const randomIndex = Math.floor(Math.random() * commandPool.length);
    return commandPool[randomIndex];
  }

  // Weighted random selection algorithm:
  // 1. Generate random number between 0 and total weight
  // 2. Iterate through commands, subtracting weights
  // 3. When random number becomes <= 0, select that command
  let random = Math.random() * totalWeight;

  for (let i = 0; i < commandPool.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return commandPool[i];
    }
  }

  // Fallback: return last command (shouldn't reach here due to floating point)
  return commandPool[commandPool.length - 1];
}
