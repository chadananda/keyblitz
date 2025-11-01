import Conf from 'conf';

/**
 * Storage class for persisting progress across sessions
 * Uses conf library which saves to ~/.config/keyblitz/ on Linux/Mac or AppData on Windows
 */
export class Storage {
  constructor(packId) {
    this.packId = packId;
    this.key = `progress-${packId}`;

    // Initialize conf with project name
    // Config will be stored in ~/.config/keyblitz/ or equivalent
    this.config = new Conf({
      projectName: 'keyblitz',
    });
  }

  /**
   * Get default progress structure for a new pack
   * @returns {Object} Default progress object
   */
  _getDefaultProgress() {
    return {
      app: this.packId,
      currentGroup: 0,
      unlockedGroups: [0],
      commandStats: {},
      globalStats: {
        totalCommands: 0,
        totalTime: 0,
        bestCombo: 0,
        totalScore: 0,
      },
    };
  }

  /**
   * Validate progress data structure
   * @param {Object} progress - Progress object to validate
   * @returns {boolean} True if valid
   */
  _validateProgress(progress) {
    if (!progress || typeof progress !== 'object') {
      return false;
    }

    const required = ['app', 'currentGroup', 'unlockedGroups', 'commandStats', 'globalStats'];
    for (const field of required) {
      if (!(field in progress)) {
        return false;
      }
    }

    if (!Array.isArray(progress.unlockedGroups)) {
      return false;
    }

    if (typeof progress.commandStats !== 'object' || progress.commandStats === null) {
      return false;
    }

    if (typeof progress.globalStats !== 'object' || progress.globalStats === null) {
      return false;
    }

    const statsRequired = ['totalCommands', 'totalTime', 'bestCombo', 'totalScore'];
    for (const field of statsRequired) {
      if (!(field in progress.globalStats)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Load progress for this pack
   * Returns default structure if not exists or invalid
   * @returns {Object} Progress object
   */
  loadProgress() {
    try {
      const progress = this.config.get(this.key);

      if (progress && this._validateProgress(progress)) {
        return progress;
      }

      // Return default if not found or invalid
      return this._getDefaultProgress();
    } catch (error) {
      console.error('Error loading progress:', error);
      return this._getDefaultProgress();
    }
  }

  /**
   * Save progress for this pack
   * Validates data before saving (atomic write via conf)
   * @param {Object} progress - Progress object to save
   * @returns {boolean} True if save successful
   */
  saveProgress(progress) {
    try {
      // Validate before saving
      if (!this._validateProgress(progress)) {
        throw new Error('Invalid progress data structure');
      }

      // Atomic write using conf
      this.config.set(this.key, progress);
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  }

  /**
   * Update state for a single command
   * Auto-saves immediately for crash safety
   * @param {string} commandKey - Command key (e.g., "dd", "diw")
   * @param {Object} state - Command state object
   * @returns {boolean} True if update successful
   */
  updateCommandState(commandKey, state) {
    try {
      const progress = this.loadProgress();

      // Validate command state
      if (!state || typeof state !== 'object') {
        throw new Error('Invalid command state');
      }

      const requiredFields = ['level', 'successes', 'failures', 'lastSeen', 'nextReview'];
      for (const field of requiredFields) {
        if (!(field in state)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Update command state
      progress.commandStats[commandKey] = state;

      // Auto-save immediately
      return this.saveProgress(progress);
    } catch (error) {
      console.error('Error updating command state:', error);
      return false;
    }
  }

  /**
   * Get state for a specific command
   * @param {string} commandKey - Command key (e.g., "dd", "diw")
   * @returns {Object|null} Command state or null if not found
   */
  getCommandState(commandKey) {
    try {
      const progress = this.loadProgress();
      return progress.commandStats[commandKey] || null;
    } catch (error) {
      console.error('Error getting command state:', error);
      return null;
    }
  }

  /**
   * Reset all progress for this pack
   * @returns {boolean} True if reset successful
   */
  resetProgress() {
    try {
      const defaultProgress = this._getDefaultProgress();
      return this.saveProgress(defaultProgress);
    } catch (error) {
      console.error('Error resetting progress:', error);
      return false;
    }
  }

  /**
   * Get progress for all packs (for stats screen)
   * @returns {Object} Map of packId -> progress
   */
  getAllProgress() {
    try {
      const allData = this.config.store;
      const allProgress = {};

      // Filter for progress-* keys
      for (const [key, value] of Object.entries(allData)) {
        if (key.startsWith('progress-')) {
          const packId = key.replace('progress-', '');
          if (this._validateProgress(value)) {
            allProgress[packId] = value;
          }
        }
      }

      return allProgress;
    } catch (error) {
      console.error('Error getting all progress:', error);
      return {};
    }
  }

  /**
   * Get the config file path (useful for debugging)
   * @returns {string} Absolute path to config file
   */
  getConfigPath() {
    return this.config.path;
  }

  /**
   * Delete this pack's progress (use with caution)
   * @returns {boolean} True if deletion successful
   */
  deleteProgress() {
    try {
      this.config.delete(this.key);
      return true;
    } catch (error) {
      console.error('Error deleting progress:', error);
      return false;
    }
  }
}

export default Storage;
