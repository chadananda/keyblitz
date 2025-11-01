/**
 * Unit tests for Pack Loader utility
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validatePack, loadPack, listPacks } from '../../src/utils/loader.js';

describe('validatePack', () => {
  it('should validate a well-formed pack', () => {
    const validPack = {
      id: 'test',
      name: 'Test Pack',
      description: 'A test pack',
      groups: [
        {
          name: 'Group 1',
          description: 'Test group',
          commands: [
            {
              keys: 'gg',
              concept: 'GO TO TOP',
              color: 'cyan',
              complexity: 1.0,
              targetType: 'motion'
            }
          ]
        }
      ],
      targetGenerators: {
        motion: () => 'test target'
      }
    };

    assert.strictEqual(validatePack(validPack), true);
  });

  it('should reject null or non-object packs', () => {
    assert.throws(() => validatePack(null), /Pack must be an object/);
    assert.throws(() => validatePack(undefined), /Pack must be an object/);
    assert.throws(() => validatePack('string'), /Pack must be an object/);
  });

  it('should require id field', () => {
    const pack = {
      name: 'Test',
      description: 'Test',
      groups: [],
      targetGenerators: {}
    };
    assert.throws(() => validatePack(pack), /must have a valid "id" field/);
  });

  it('should require name field', () => {
    const pack = {
      id: 'test',
      description: 'Test',
      groups: [],
      targetGenerators: {}
    };
    assert.throws(() => validatePack(pack), /must have a valid "name" field/);
  });

  it('should require description field', () => {
    const pack = {
      id: 'test',
      name: 'Test',
      groups: [],
      targetGenerators: {}
    };
    assert.throws(() => validatePack(pack), /must have a valid "description" field/);
  });

  it('should require groups array with at least one group', () => {
    const pack = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      targetGenerators: {}
    };
    assert.throws(() => validatePack(pack), /must have at least one group/);

    pack.groups = [];
    assert.throws(() => validatePack(pack), /must have at least one group/);
  });

  it('should validate group structure', () => {
    const pack = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      groups: [{}],
      targetGenerators: {}
    };
    assert.throws(() => validatePack(pack), /must have a valid "name" field/);

    pack.groups = [{name: 'Group'}];
    assert.throws(() => validatePack(pack), /must have a valid "description" field/);

    pack.groups = [{name: 'Group', description: 'Desc'}];
    assert.throws(() => validatePack(pack), /must have at least one command/);
  });

  it('should validate command structure', () => {
    const baseGroup = {
      name: 'Group',
      description: 'Desc',
      commands: [{}]
    };
    const pack = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      groups: [baseGroup],
      targetGenerators: {motion: () => 'test'}
    };

    assert.throws(() => validatePack(pack), /must have a valid "keys" field/);

    pack.groups[0].commands[0].keys = 'gg';
    assert.throws(() => validatePack(pack), /must have a valid "concept" field/);

    pack.groups[0].commands[0].concept = 'GO TOP';
    assert.throws(() => validatePack(pack), /must have a valid "color" field/);

    pack.groups[0].commands[0].color = 'invalid';
    assert.throws(() => validatePack(pack), /has invalid color/);

    pack.groups[0].commands[0].color = 'cyan';
    assert.throws(() => validatePack(pack), /must have a "complexity" field/);

    pack.groups[0].commands[0].complexity = 10.0; // too high
    assert.throws(() => validatePack(pack), /must have a "complexity" field between 1.0 and 5.0/);

    pack.groups[0].commands[0].complexity = 0.5; // too low
    assert.throws(() => validatePack(pack), /must have a "complexity" field between 1.0 and 5.0/);

    pack.groups[0].commands[0].complexity = 1.0;
    assert.throws(() => validatePack(pack), /must have a valid "targetType" field/);
  });

  it('should validate color values', () => {
    const pack = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      groups: [{
        name: 'Group',
        description: 'Desc',
        commands: [{
          keys: 'gg',
          concept: 'GO TOP',
          color: 'invalidcolor',
          complexity: 1.0,
          targetType: 'motion'
        }]
      }],
      targetGenerators: {motion: () => 'test'}
    };

    assert.throws(() => validatePack(pack), /has invalid color "invalidcolor"/);
  });

  it('should accept valid color values', () => {
    const validColors = ['cyan', 'blue', 'yellow', 'red', 'magenta', 'green', 'white'];

    validColors.forEach(color => {
      const pack = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        groups: [{
          name: 'Group',
          description: 'Desc',
          commands: [{
            keys: 'gg',
            concept: 'GO TOP',
            color: color,
            complexity: 1.0,
            targetType: 'motion'
          }]
        }],
        targetGenerators: {motion: () => 'test'}
      };

      assert.doesNotThrow(() => validatePack(pack));
    });
  });

  it('should validate targetType against known types', () => {
    const pack = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      groups: [{
        name: 'Group',
        description: 'Desc',
        commands: [{
          keys: 'gg',
          concept: 'GO TOP',
          color: 'cyan',
          complexity: 1.0,
          targetType: 'invalid_type'
        }]
      }],
      targetGenerators: {invalid_type: () => 'test'}
    };

    assert.throws(() => validatePack(pack), /has invalid targetType "invalid_type"/);
  });

  it('should accept valid targetTypes', () => {
    const validTypes = ['motion', 'text', 'line', 'pane', 'window', 'buffer', 'file'];

    validTypes.forEach(targetType => {
      const pack = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        groups: [{
          name: 'Group',
          description: 'Desc',
          commands: [{
            keys: 'gg',
            concept: 'GO TOP',
            color: 'cyan',
            complexity: 1.0,
            targetType: targetType
          }]
        }],
        targetGenerators: {[targetType]: () => 'test'}
      };

      assert.doesNotThrow(() => validatePack(pack));
    });
  });

  it('should require targetGenerators object', () => {
    const pack = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      groups: [{
        name: 'Group',
        description: 'Desc',
        commands: [{
          keys: 'gg',
          concept: 'GO TOP',
          color: 'cyan',
          complexity: 1.0,
          targetType: 'motion'
        }]
      }]
    };

    assert.throws(() => validatePack(pack), /must have a "targetGenerators" object/);
  });

  it('should require generator functions for all used targetTypes', () => {
    const pack = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      groups: [{
        name: 'Group',
        description: 'Desc',
        commands: [{
          keys: 'gg',
          concept: 'GO TOP',
          color: 'cyan',
          complexity: 1.0,
          targetType: 'motion'
        }]
      }],
      targetGenerators: {
        // missing 'motion' generator
      }
    };

    assert.throws(() => validatePack(pack), /is missing targetGenerator function for targetType "motion"/);
  });

  it('should validate keyNotation if present', () => {
    const pack = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      groups: [{
        name: 'Group',
        description: 'Desc',
        commands: [{
          keys: 'gg',
          concept: 'GO TOP',
          color: 'cyan',
          complexity: 1.0,
          targetType: 'motion'
        }]
      }],
      targetGenerators: {motion: () => 'test'},
      keyNotation: 'invalid'
    };

    assert.throws(() => validatePack(pack), /has invalid "keyNotation" field/);

    pack.keyNotation = {'C-b': 123}; // non-string value
    assert.throws(() => validatePack(pack), /keyNotation entries must be string->string mappings/);

    pack.keyNotation = {'C-b': 'Ctrl+b '}; // valid
    assert.doesNotThrow(() => validatePack(pack));
  });

  it('should accept pack with optional keyNotation', () => {
    const pack = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      groups: [{
        name: 'Group',
        description: 'Desc',
        commands: [{
          keys: 'gg',
          concept: 'GO TOP',
          color: 'cyan',
          complexity: 1.0,
          targetType: 'motion'
        }]
      }],
      targetGenerators: {motion: () => 'test'}
      // keyNotation is optional
    };

    assert.doesNotThrow(() => validatePack(pack));
  });
});

describe('loadPack', async () => {
  it('should load an existing pack', async () => {
    const pack = await loadPack('tmux');
    assert.strictEqual(pack.id, 'tmux');
    assert.strictEqual(pack.name, 'Tmux');
    assert.ok(Array.isArray(pack.groups));
    assert.ok(pack.groups.length > 0);
  });

  it('should validate loaded pack', async () => {
    const pack = await loadPack('tmux');
    assert.doesNotThrow(() => validatePack(pack));
  });

  it('should reject invalid pack ID', async () => {
    await assert.rejects(
      async () => await loadPack(''),
      /Pack ID must be a non-empty string/
    );

    await assert.rejects(
      async () => await loadPack(null),
      /Pack ID must be a non-empty string/
    );
  });

  it('should reject non-existent pack', async () => {
    await assert.rejects(
      async () => await loadPack('nonexistent'),
      /Pack "nonexistent" not found/
    );
  });

  it('should load multiple packs', async () => {
    const tmux = await loadPack('tmux');
    const neovim = await loadPack('neovim');
    const hyprland = await loadPack('hyprland');

    assert.strictEqual(tmux.id, 'tmux');
    assert.strictEqual(neovim.id, 'neovim');
    assert.strictEqual(hyprland.id, 'hyprland');
  });
});

describe('listPacks', async () => {
  it('should return array of pack metadata', async () => {
    const packs = await listPacks();
    assert.ok(Array.isArray(packs));
    assert.ok(packs.length > 0);
  });

  it('should include required metadata fields', async () => {
    const packs = await listPacks();

    packs.forEach(pack => {
      assert.ok(pack.id, 'Pack should have id');
      assert.ok(pack.name, 'Pack should have name');
      assert.ok(pack.description, 'Pack should have description');
    });
  });

  it('should list all available packs', async () => {
    const packs = await listPacks();
    const packIds = packs.map(p => p.id);

    // Should include known packs
    assert.ok(packIds.includes('tmux'));
    assert.ok(packIds.includes('neovim'));
    assert.ok(packIds.includes('hyprland'));
  });

  it('should return packs with consistent metadata', async () => {
    const packs = await listPacks();

    packs.forEach(packMeta => {
      assert.strictEqual(typeof packMeta.id, 'string');
      assert.strictEqual(typeof packMeta.name, 'string');
      assert.strictEqual(typeof packMeta.description, 'string');
    });
  });
});
