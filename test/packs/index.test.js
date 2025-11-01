/**
 * Unit tests for pack registry
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PACKS,
  getPack,
  listPacks,
  getPackSummary
} from '../../src/packs/index.js';

describe('Pack Registry', () => {
  describe('PACKS export', () => {
    it('should export all three packs', () => {
      assert.ok(PACKS.neovim, 'neovim pack should exist');
      assert.ok(PACKS.hyprland, 'hyprland pack should exist');
      assert.ok(PACKS.tmux, 'tmux pack should exist');
    });

    it('should have correct pack IDs', () => {
      assert.equal(PACKS.neovim.id, 'neovim');
      assert.equal(PACKS.hyprland.id, 'hyprland');
      assert.equal(PACKS.tmux.id, 'tmux');
    });

    it('should have all required pack fields', () => {
      Object.values(PACKS).forEach(pack => {
        assert.ok(pack.name, `Pack should have a name: ${pack.id}`);
        assert.ok(pack.description, `Pack should have a description: ${pack.id}`);
        assert.ok(Array.isArray(pack.groups), `Pack should have groups array: ${pack.id}`);
        assert.ok(pack.version, `Pack should have a version: ${pack.id}`);
      });
    });

    it('should have groups with proper structure', () => {
      Object.values(PACKS).forEach(pack => {
        pack.groups.forEach((group, idx) => {
          assert.ok(group.name, `Group ${idx} should have a name in ${pack.id}`);
          assert.ok(group.description, `Group ${idx} should have a description in ${pack.id}`);
          assert.ok(Array.isArray(group.commands), `Group ${idx} should have commands array in ${pack.id}`);
          assert.ok(group.commands.length > 0, `Group ${idx} should have at least one command in ${pack.id}`);
        });
      });
    });

    it('should have commands with proper structure', () => {
      Object.values(PACKS).forEach(pack => {
        pack.groups.forEach((group, groupIdx) => {
          group.commands.forEach((cmd, cmdIdx) => {
            assert.ok(cmd.keys, `Command ${cmdIdx} in group ${groupIdx} should have keys in ${pack.id}`);
            assert.ok(cmd.concept, `Command ${cmdIdx} in group ${groupIdx} should have concept in ${pack.id}`);
            assert.ok(cmd.color, `Command ${cmdIdx} in group ${groupIdx} should have color in ${pack.id}`);
            assert.ok(typeof cmd.complexity === 'number', `Command ${cmdIdx} in group ${groupIdx} should have numeric complexity in ${pack.id}`);
            assert.ok(cmd.targetType, `Command ${cmdIdx} in group ${groupIdx} should have targetType in ${pack.id}`);
          });
        });
      });
    });

    it('should have target generators', () => {
      Object.values(PACKS).forEach(pack => {
        assert.ok(pack.targetGenerators, `Pack should have targetGenerators: ${pack.id}`);
        assert.ok(typeof pack.targetGenerators === 'object', `targetGenerators should be an object: ${pack.id}`);
      });
    });

    it('should have key notation mapping', () => {
      Object.values(PACKS).forEach(pack => {
        assert.ok(pack.keyNotation, `Pack should have keyNotation: ${pack.id}`);
        assert.ok(typeof pack.keyNotation === 'object', `keyNotation should be an object: ${pack.id}`);
      });
    });
  });

  describe('getPack', () => {
    it('should retrieve pack by ID', () => {
      const neovim = getPack('neovim');
      assert.equal(neovim.id, 'neovim');
      assert.equal(neovim.name, 'Neovim');

      const hyprland = getPack('hyprland');
      assert.equal(hyprland.id, 'hyprland');
      assert.equal(hyprland.name, 'Hyprland');

      const tmux = getPack('tmux');
      assert.equal(tmux.id, 'tmux');
      assert.equal(tmux.name, 'Tmux');
    });

    it('should throw error for non-existent pack', () => {
      assert.throws(
        () => getPack('non-existent'),
        {
          message: /Pack "non-existent" not found/
        }
      );
    });

    it('should include available packs in error message', () => {
      assert.throws(
        () => getPack('invalid'),
        {
          message: /Available packs: neovim, hyprland, tmux/
        }
      );
    });

    it('should return the same reference as PACKS', () => {
      assert.equal(getPack('neovim'), PACKS.neovim);
      assert.equal(getPack('hyprland'), PACKS.hyprland);
      assert.equal(getPack('tmux'), PACKS.tmux);
    });
  });

  describe('listPacks', () => {
    it('should return array of pack summaries', () => {
      const packs = listPacks();
      assert.ok(Array.isArray(packs));
      assert.equal(packs.length, 3);
    });

    it('should include all pack IDs', () => {
      const packs = listPacks();
      const ids = packs.map(p => p.id);
      assert.deepEqual(ids, ['neovim', 'hyprland', 'tmux']);
    });

    it('should have required fields in each pack summary', () => {
      const packs = listPacks();
      packs.forEach(pack => {
        assert.ok(pack.id, 'Pack should have id');
        assert.ok(pack.name, 'Pack should have name');
        assert.ok(pack.description, 'Pack should have description');
        assert.ok(pack.version, 'Pack should have version');
        assert.ok(typeof pack.commandCount === 'number', 'Pack should have numeric commandCount');
        assert.ok(pack.commandCount > 0, 'Pack should have at least one command');
        assert.ok(typeof pack.groupCount === 'number', 'Pack should have numeric groupCount');
        assert.ok(pack.groupCount > 0, 'Pack should have at least one group');
      });
    });

    it('should calculate correct command count', () => {
      const packs = listPacks();
      packs.forEach(pack => {
        const actualCount = PACKS[pack.id].groups.reduce((sum, g) => sum + g.commands.length, 0);
        assert.equal(pack.commandCount, actualCount, `Command count mismatch for ${pack.id}`);
      });
    });

    it('should calculate correct group count', () => {
      const packs = listPacks();
      packs.forEach(pack => {
        const actualCount = PACKS[pack.id].groups.length;
        assert.equal(pack.groupCount, actualCount, `Group count mismatch for ${pack.id}`);
      });
    });

    it('should have realistic version format', () => {
      const packs = listPacks();
      packs.forEach(pack => {
        assert.match(pack.version, /\d+\.\d+\.\d+/, `Version should be semantic: ${pack.version}`);
      });
    });

    it('should preserve pack order consistently', () => {
      const list1 = listPacks();
      const list2 = listPacks();
      list1.forEach((pack, idx) => {
        assert.equal(pack.id, list2[idx].id);
      });
    });
  });

  describe('getPackSummary', () => {
    it('should return summary for valid pack', () => {
      const summary = getPackSummary('neovim');
      assert.ok(summary);
      assert.equal(summary.id, 'neovim');
      assert.equal(summary.name, 'Neovim');
    });

    it('should have required fields in summary', () => {
      const summary = getPackSummary('hyprland');
      assert.ok(summary.id, 'Should have id');
      assert.ok(summary.name, 'Should have name');
      assert.ok(summary.description, 'Should have description');
      assert.ok(typeof summary.totalCommands === 'number', 'Should have totalCommands');
      assert.ok(Array.isArray(summary.groups), 'Should have groups array');
    });

    it('should calculate correct total commands', () => {
      const summary = getPackSummary('neovim');
      const expectedTotal = PACKS.neovim.groups.reduce((sum, g) => sum + g.commands.length, 0);
      assert.equal(summary.totalCommands, expectedTotal);
    });

    it('should have all groups in summary', () => {
      const summary = getPackSummary('tmux');
      assert.equal(summary.groups.length, PACKS.tmux.groups.length);
    });

    it('should provide group breakdown', () => {
      const summary = getPackSummary('neovim');
      summary.groups.forEach((group, idx) => {
        assert.ok(group.name, `Group ${idx} should have name`);
        assert.ok(group.description, `Group ${idx} should have description`);
        assert.ok(typeof group.commandCount === 'number', `Group ${idx} should have numeric commandCount`);
        assert.ok(group.commandCount > 0, `Group ${idx} should have at least one command`);
      });
    });

    it('should calculate correct command count per group', () => {
      const summary = getPackSummary('hyprland');
      summary.groups.forEach((group, idx) => {
        const expectedCount = PACKS.hyprland.groups[idx].commands.length;
        assert.equal(group.commandCount, expectedCount, `Command count mismatch for group ${idx}`);
      });
    });

    it('should throw error for non-existent pack', () => {
      assert.throws(
        () => getPackSummary('non-existent'),
        {
          message: /Pack "non-existent" not found/
        }
      );
    });

    it('should work for all packs', () => {
      Object.keys(PACKS).forEach(packId => {
        const summary = getPackSummary(packId);
        assert.equal(summary.id, packId);
        assert.ok(summary.name);
        assert.ok(summary.groups.length > 0);
      });
    });

    it('should provide accurate group summaries for neovim', () => {
      const summary = getPackSummary('neovim');
      assert.equal(summary.groups[0].name, 'Core Movement');
      assert.equal(summary.groups[0].commandCount, 9);
      assert.equal(summary.groups[1].name, 'Essential Editing');
      assert.equal(summary.groups[1].commandCount, 6);
    });

    it('should provide accurate group summaries for hyprland', () => {
      const summary = getPackSummary('hyprland');
      assert.equal(summary.groups[0].name, 'Window Navigation');
      assert.equal(summary.groups[0].commandCount, 7);
      assert.equal(summary.groups[1].name, 'Workspace Control');
      assert.equal(summary.groups[1].commandCount, 16);
    });

    it('should provide accurate group summaries for tmux', () => {
      const summary = getPackSummary('tmux');
      assert.equal(summary.groups[0].name, 'Pane Management');
      assert.equal(summary.groups[0].commandCount, 9);
      assert.equal(summary.groups[1].name, 'Window Management');
      assert.equal(summary.groups[1].commandCount, 9);
    });
  });

  describe('Integration', () => {
    it('should allow discovering all packs programmatically', () => {
      const packs = listPacks();
      assert.equal(packs.length, Object.keys(PACKS).length);

      packs.forEach(packInfo => {
        const fullPack = getPack(packInfo.id);
        assert.equal(fullPack.id, packInfo.id);
        assert.equal(fullPack.name, packInfo.name);
      });
    });

    it('should provide consistent data across functions', () => {
      const packId = 'neovim';
      const listInfo = listPacks().find(p => p.id === packId);
      const packRef = getPack(packId);
      const summary = getPackSummary(packId);

      assert.equal(listInfo.name, packRef.name);
      assert.equal(listInfo.name, summary.name);
      assert.equal(listInfo.commandCount, summary.totalCommands);
      assert.equal(listInfo.groupCount, summary.groups.length);
    });

    it('should handle edge cases gracefully', () => {
      // Empty string
      assert.throws(() => getPack(''), { message: /Pack "" not found/ });

      // Case sensitivity
      assert.throws(() => getPack('Neovim'), { message: /Pack "Neovim" not found/ });

      // Whitespace
      assert.throws(() => getPack(' neovim'), { message: /Pack " neovim" not found/ });
    });

    it('should have sensible data across all packs', () => {
      const packs = listPacks();

      // All packs should have at least 3 groups
      packs.forEach(pack => {
        assert.ok(pack.groupCount >= 3, `Pack ${pack.id} should have at least 3 groups`);
      });

      // All packs should have at least 15 commands total
      packs.forEach(pack => {
        assert.ok(pack.commandCount >= 15, `Pack ${pack.id} should have at least 15 commands`);
      });

      // neovim should have the most groups (9)
      const neovimPack = packs.find(p => p.id === 'neovim');
      assert.equal(neovimPack.groupCount, 9);

      // neovim should have high command count
      assert.ok(neovimPack.commandCount > 50);
    });
  });
});
