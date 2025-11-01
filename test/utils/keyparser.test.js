/**
 * Unit tests for Key Parser utility
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseKeyNotation, normalizeKeys, InputBuffer } from '../../src/utils/keyparser.js';

describe('parseKeyNotation', () => {
  it('should handle simple key sequences', () => {
    assert.strictEqual(parseKeyNotation('gg'), 'gg');
    assert.strictEqual(parseKeyNotation('dd'), 'dd');
    assert.strictEqual(parseKeyNotation('x'), 'x');
  });

  it('should convert bracketed Ctrl notation', () => {
    assert.strictEqual(parseKeyNotation('<C-d>'), 'Ctrl+d');
    assert.strictEqual(parseKeyNotation('<C-x>'), 'Ctrl+x');
    assert.strictEqual(parseKeyNotation('<C-s>'), 'Ctrl+s');
  });

  it('should convert bracketed Alt notation', () => {
    assert.strictEqual(parseKeyNotation('<M-x>'), 'Alt+x');
    assert.strictEqual(parseKeyNotation('<M-f>'), 'Alt+f');
    assert.strictEqual(parseKeyNotation('<M-b>'), 'Alt+b');
  });

  it('should convert bracketed Shift notation', () => {
    assert.strictEqual(parseKeyNotation('<S-a>'), 'Shift+a');
    assert.strictEqual(parseKeyNotation('<S-j>'), 'Shift+j');
  });

  it('should convert combined modifiers', () => {
    assert.strictEqual(parseKeyNotation('<C-S-p>'), 'Ctrl+Shift+p');
    assert.strictEqual(parseKeyNotation('<C-M-x>'), 'Ctrl+Alt+x');
    assert.strictEqual(parseKeyNotation('<M-S-f>'), 'Alt+Shift+f');
  });

  it('should convert bare C- prefix', () => {
    assert.strictEqual(parseKeyNotation('C-d'), 'Ctrl+d');
    assert.strictEqual(parseKeyNotation('C-x'), 'Ctrl+x');
  });

  it('should convert bare M- prefix', () => {
    assert.strictEqual(parseKeyNotation('M-x'), 'Alt+x');
    assert.strictEqual(parseKeyNotation('M-f'), 'Alt+f');
  });

  it('should handle special keys', () => {
    assert.strictEqual(parseKeyNotation('<CR>'), 'Enter');
    assert.strictEqual(parseKeyNotation('<Enter>'), 'Enter');
    assert.strictEqual(parseKeyNotation('<Esc>'), 'Escape');
    assert.strictEqual(parseKeyNotation('<Escape>'), 'Escape');
    assert.strictEqual(parseKeyNotation('<Tab>'), 'Tab');
    assert.strictEqual(parseKeyNotation('<Space>'), ' ');
    assert.strictEqual(parseKeyNotation('<BS>'), 'Backspace');
    assert.strictEqual(parseKeyNotation('<Backspace>'), 'Backspace');
    assert.strictEqual(parseKeyNotation('<Del>'), 'Delete');
    assert.strictEqual(parseKeyNotation('<Delete>'), 'Delete');
  });

  it('should handle arrow keys', () => {
    assert.strictEqual(parseKeyNotation('<Up>'), 'ArrowUp');
    assert.strictEqual(parseKeyNotation('<Down>'), 'ArrowDown');
    assert.strictEqual(parseKeyNotation('<Left>'), 'ArrowLeft');
    assert.strictEqual(parseKeyNotation('<Right>'), 'ArrowRight');
  });

  it('should handle navigation keys', () => {
    assert.strictEqual(parseKeyNotation('<Home>'), 'Home');
    assert.strictEqual(parseKeyNotation('<End>'), 'End');
    assert.strictEqual(parseKeyNotation('<PageUp>'), 'PageUp');
    assert.strictEqual(parseKeyNotation('<PageDown>'), 'PageDown');
  });

  it('should apply custom notation mappings', () => {
    const tmuxNotation = { 'C-b': 'Ctrl+b ' };
    // The custom notation adds a space, resulting in double space before the next char
    assert.strictEqual(parseKeyNotation('C-b %', tmuxNotation), 'Ctrl+b  %');
    assert.strictEqual(parseKeyNotation('C-b "', tmuxNotation), 'Ctrl+b  "');
    assert.strictEqual(parseKeyNotation('C-b c', tmuxNotation), 'Ctrl+b  c');
  });

  it('should handle modifiers with special keys', () => {
    assert.strictEqual(parseKeyNotation('<C-Enter>'), 'Ctrl+Enter');
    assert.strictEqual(parseKeyNotation('<C-Tab>'), 'Ctrl+Tab');
    assert.strictEqual(parseKeyNotation('<M-Space>'), 'Alt+ ');
  });

  it('should handle case insensitive modifiers', () => {
    assert.strictEqual(parseKeyNotation('<c-d>'), 'Ctrl+d');
    assert.strictEqual(parseKeyNotation('<m-x>'), 'Alt+x');
    assert.strictEqual(parseKeyNotation('<s-a>'), 'Shift+a');
    assert.strictEqual(parseKeyNotation('c-d'), 'Ctrl+d');
    assert.strictEqual(parseKeyNotation('m-x'), 'Alt+x');
  });

  it('should handle empty or invalid input', () => {
    assert.strictEqual(parseKeyNotation(''), '');
    assert.strictEqual(parseKeyNotation(null), '');
    assert.strictEqual(parseKeyNotation(undefined), '');
  });

  it('should preserve sequences with mixed notation', () => {
    assert.strictEqual(parseKeyNotation('gg<C-d>'), 'ggCtrl+d');
    assert.strictEqual(parseKeyNotation('d<C-x>'), 'dCtrl+x');
  });
});

describe('normalizeKeys', () => {
  it('should convert to lowercase', () => {
    assert.strictEqual(normalizeKeys('Ctrl+D'), 'ctrl+d');
    assert.strictEqual(normalizeKeys('Alt+X'), 'alt+x');
    assert.strictEqual(normalizeKeys('GG'), 'gg');
  });

  it('should trim whitespace', () => {
    assert.strictEqual(normalizeKeys('  gg  '), 'gg');
    assert.strictEqual(normalizeKeys('  Ctrl+d  '), 'ctrl+d');
  });

  it('should normalize multiple spaces to single space', () => {
    assert.strictEqual(normalizeKeys('Ctrl+b  %'), 'ctrl+b %');
    assert.strictEqual(normalizeKeys('g   g'), 'g g');
  });

  it('should handle empty or invalid input', () => {
    assert.strictEqual(normalizeKeys(''), '');
    assert.strictEqual(normalizeKeys(null), '');
    assert.strictEqual(normalizeKeys(undefined), '');
  });

  it('should handle single characters', () => {
    assert.strictEqual(normalizeKeys('X'), 'x');
    assert.strictEqual(normalizeKeys('G'), 'g');
  });
});

describe('InputBuffer', () => {
  it('should initialize with empty buffer', () => {
    const buffer = new InputBuffer();
    assert.strictEqual(buffer.get(), '');
    assert.strictEqual(buffer.length(), 0);
  });

  it('should accumulate keys', () => {
    const buffer = new InputBuffer();
    buffer.addKey('g');
    assert.strictEqual(buffer.get(), 'g');
    buffer.addKey('g');
    assert.strictEqual(buffer.get(), 'gg');
  });

  it('should match exact sequences', () => {
    const buffer = new InputBuffer();
    buffer.addKey('g');
    buffer.addKey('g');
    assert.strictEqual(buffer.matches('gg'), true);
    assert.strictEqual(buffer.matches('dd'), false);
  });

  it('should detect partial matches', () => {
    const buffer = new InputBuffer();
    buffer.addKey('g');
    assert.strictEqual(buffer.isPartialMatch('gg'), true);
    assert.strictEqual(buffer.isPartialMatch('dd'), false);
    buffer.addKey('g');
    assert.strictEqual(buffer.isPartialMatch('gg'), false); // now exact match
  });

  it('should clear buffer', () => {
    const buffer = new InputBuffer();
    buffer.addKey('g');
    buffer.addKey('g');
    assert.strictEqual(buffer.length(), 2);
    buffer.clear();
    assert.strictEqual(buffer.get(), '');
    assert.strictEqual(buffer.length(), 0);
  });

  it('should auto-clear after timeout', (t, done) => {
    const buffer = new InputBuffer(100); // 100ms timeout
    buffer.addKey('g');
    assert.strictEqual(buffer.get(), 'g');

    setTimeout(() => {
      assert.strictEqual(buffer.get(), '', 'Buffer should be cleared after timeout');
      done();
    }, 150);
  });

  it('should reset timer on each key', (t, done) => {
    const buffer = new InputBuffer(100);
    buffer.addKey('g');

    setTimeout(() => {
      buffer.addKey('g'); // Reset timer
      assert.strictEqual(buffer.get(), 'gg', 'Buffer should still contain keys');
    }, 50);

    setTimeout(() => {
      assert.strictEqual(buffer.get(), 'gg', 'Buffer should still have keys before final timeout');
    }, 120);

    setTimeout(() => {
      assert.strictEqual(buffer.get(), '', 'Buffer should be cleared after final timeout');
      done();
    }, 180);
  });

  it('should handle custom timeout values', () => {
    const shortBuffer = new InputBuffer(50);
    const longBuffer = new InputBuffer(5000);

    assert.strictEqual(shortBuffer.timeout, 50);
    assert.strictEqual(longBuffer.timeout, 5000);
  });

  it('should handle rapid key sequences', () => {
    const buffer = new InputBuffer();
    buffer.addKey('d');
    buffer.addKey('d');
    buffer.addKey('p');
    assert.strictEqual(buffer.get(), 'ddp');
    assert.strictEqual(buffer.matches('ddp'), true);
  });

  it('should not match if buffer is empty', () => {
    const buffer = new InputBuffer();
    assert.strictEqual(buffer.matches('gg'), false);
    assert.strictEqual(buffer.isPartialMatch('gg'), false);
  });

  it('should handle single character matches', () => {
    const buffer = new InputBuffer();
    buffer.addKey('x');
    assert.strictEqual(buffer.matches('x'), true);
    assert.strictEqual(buffer.matches('xx'), false);
  });
});
