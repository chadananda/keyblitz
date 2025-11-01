export default {
  id: 'neovim',
  name: 'Neovim',
  description: 'Master Vim/Neovim keybindings through muscle memory',
  version: '1.0.0',

  groups: [
    {
      name: 'Core Movement',
      description: 'Essential navigation - you cannot edit without this',
      commands: [
        {keys: 'h', concept: 'MOVE LEFT', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'j', concept: 'MOVE DOWN', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'k', concept: 'MOVE UP', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'l', concept: 'MOVE RIGHT', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'w', concept: 'WORD FORWARD', color: 'cyan', complexity: 1.0, targetType: 'word'},
        {keys: 'b', concept: 'WORD BACK', color: 'cyan', complexity: 1.0, targetType: 'word'},
        {keys: 'e', concept: 'WORD END', color: 'cyan', complexity: 1.0, targetType: 'word'},
        {keys: '0', concept: 'LINE START', color: 'blue', complexity: 1.0, targetType: 'line'},
        {keys: '$', concept: 'LINE END', color: 'blue', complexity: 1.0, targetType: 'line'}
      ]
    },
    {
      name: 'Essential Editing',
      description: '80% of basic edits - master these first',
      commands: [
        {keys: 'i', concept: 'INSERT BEFORE', color: 'yellow', complexity: 1.0, targetType: 'line'},
        {keys: 'a', concept: 'INSERT AFTER', color: 'yellow', complexity: 1.0, targetType: 'line'},
        {keys: 'x', concept: 'DELETE CHAR', color: 'red', complexity: 1.0, targetType: 'line'},
        {keys: 'dd', concept: 'DELETE LINE', color: 'red', complexity: 1.3, targetType: 'line'},
        {keys: 'u', concept: 'UNDO', color: 'magenta', complexity: 1.0, targetType: 'line'},
        {keys: 'p', concept: 'PASTE AFTER', color: 'magenta', complexity: 1.0, targetType: 'line'}
      ]
    },
    {
      name: 'Efficient Insert',
      description: 'Speed up text entry and line creation',
      commands: [
        {keys: 'I', concept: 'INSERT LINE START', color: 'yellow', complexity: 1.2, targetType: 'line'},
        {keys: 'A', concept: 'INSERT LINE END', color: 'yellow', complexity: 1.2, targetType: 'line'},
        {keys: 'o', concept: 'NEW LINE BELOW', color: 'yellow', complexity: 1.2, targetType: 'line'},
        {keys: 'O', concept: 'NEW LINE ABOVE', color: 'yellow', complexity: 1.2, targetType: 'line'}
      ]
    },
    {
      name: 'Word Operations',
      description: 'Professional speed - operate on words efficiently',
      commands: [
        {keys: 'dw', concept: 'DELETE WORD', color: 'red', complexity: 1.4, targetType: 'word'},
        {keys: 'cw', concept: 'CHANGE WORD', color: 'red', complexity: 1.4, targetType: 'word'},
        {keys: 'yy', concept: 'YANK LINE', color: 'magenta', complexity: 1.3, targetType: 'line'},
        {keys: 'yw', concept: 'YANK WORD', color: 'magenta', complexity: 1.4, targetType: 'word'}
      ]
    },
    {
      name: 'Line Power Moves',
      description: 'Navigate files like a pro',
      commands: [
        {keys: 'gg', concept: 'TOP OF FILE', color: 'blue', complexity: 1.3, targetType: 'line'},
        {keys: 'G', concept: 'BOTTOM OF FILE', color: 'blue', complexity: 1.0, targetType: 'line'},
        {keys: '<C-d>', concept: 'HALF PAGE DOWN', color: 'blue', complexity: 1.2, targetType: 'line'},
        {keys: '<C-u>', concept: 'HALF PAGE UP', color: 'blue', complexity: 1.2, targetType: 'line'},
        {keys: '%', concept: 'MATCHING BRACKET', color: 'blue', complexity: 1.0, targetType: 'paren'}
      ]
    },
    {
      name: 'Text Objects',
      description: 'Game-changing power - operate on semantic units',
      commands: [
        {keys: 'diw', concept: 'DELETE INNER WORD', color: 'red', complexity: 1.8, targetType: 'word'},
        {keys: 'daw', concept: 'DELETE AROUND WORD', color: 'red', complexity: 1.8, targetType: 'word'},
        {keys: 'ci"', concept: 'CHANGE INNER QUOTES', color: 'red', complexity: 1.8, targetType: 'quote'},
        {keys: 'ca"', concept: 'CHANGE AROUND QUOTES', color: 'red', complexity: 1.8, targetType: 'quote'},
        {keys: 'di(', concept: 'DELETE INNER PARENS', color: 'red', complexity: 1.8, targetType: 'paren'},
        {keys: 'da(', concept: 'DELETE AROUND PARENS', color: 'red', complexity: 1.8, targetType: 'paren'},
        {keys: 'di{', concept: 'DELETE INNER BRACES', color: 'red', complexity: 1.8, targetType: 'block'},
        {keys: 'da{', concept: 'DELETE AROUND BRACES', color: 'red', complexity: 1.8, targetType: 'block'}
      ]
    },
    {
      name: 'Visual Mode',
      description: 'Select and operate on regions',
      commands: [
        {keys: 'v', concept: 'VISUAL CHAR', color: 'magenta', complexity: 1.0, targetType: 'visual'},
        {keys: 'V', concept: 'VISUAL LINE', color: 'magenta', complexity: 1.0, targetType: 'visual'},
        {keys: '<C-v>', concept: 'VISUAL BLOCK', color: 'magenta', complexity: 1.2, targetType: 'visual'}
      ]
    },
    {
      name: 'Search',
      description: 'Find anything instantly',
      commands: [
        {keys: '/', concept: 'SEARCH FORWARD', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: '?', concept: 'SEARCH BACKWARD', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'n', concept: 'NEXT RESULT', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'N', concept: 'PREV RESULT', color: 'cyan', complexity: 1.0, targetType: 'line'},
        {keys: 'f', concept: 'FIND CHAR FORWARD', color: 'cyan', complexity: 1.2, targetType: 'line'},
        {keys: 'F', concept: 'FIND CHAR BACK', color: 'cyan', complexity: 1.2, targetType: 'line'},
        {keys: 't', concept: 'TO CHAR FORWARD', color: 'cyan', complexity: 1.3, targetType: 'line'},
        {keys: 'T', concept: 'TO CHAR BACK', color: 'cyan', complexity: 1.3, targetType: 'line'}
      ]
    },
    {
      name: 'Advanced Combos',
      description: 'Mastery level - chain commands for maximum efficiency',
      commands: [
        {keys: '3w', concept: 'THREE WORDS FORWARD', color: 'cyan', complexity: 1.6, targetType: 'word'},
        {keys: '5j', concept: 'FIVE LINES DOWN', color: 'cyan', complexity: 1.6, targetType: 'line'},
        {keys: 'dt"', concept: 'DELETE TO QUOTE', color: 'red', complexity: 1.8, targetType: 'quote'},
        {keys: 'df)', concept: 'DELETE FIND PAREN', color: 'red', complexity: 1.8, targetType: 'paren'},
        {keys: 'ci[', concept: 'CHANGE INNER BRACKET', color: 'red', complexity: 1.8, targetType: 'block'},
        {keys: 'ya}', concept: 'YANK AROUND BRACE', color: 'magenta', complexity: 1.8, targetType: 'block'},
        {keys: '.', concept: 'REPEAT LAST', color: 'yellow', complexity: 1.0, targetType: 'line'}
      ]
    }
  ],

  targetGenerators: {
    line: () => {
      const lines = [
        'The quick brown fox jumps over the lazy dog',
        'Pack my box with five dozen liquor jugs',
        'How vexingly quick daft zebras jump',
        'Sphinx of black quartz, judge my vow'
      ]
      return lines[Math.floor(Math.random() * lines.length)]
    },
    word: () => {
      const words = [
        'hello world goodbye',
        'function argument parameter',
        'variable constant expression',
        'iterate traverse navigate'
      ]
      return words[Math.floor(Math.random() * words.length)]
    },
    block: () => {
      const blocks = [
        '{\n  name: "value",\n  other: "data"\n}',
        '{\n  x: 10,\n  y: 20,\n  z: 30\n}',
        'function example() {\n  return true\n}'
      ]
      return blocks[Math.floor(Math.random() * blocks.length)]
    },
    quote: () => {
      const quotes = [
        'The "important" word is here',
        'She said "hello world" quietly',
        'Key is "value" in JSON'
      ]
      return quotes[Math.floor(Math.random() * quotes.length)]
    },
    paren: () => {
      const parens = [
        'function(arg1, arg2, arg3)',
        'calculate(x, y, z)',
        'method(param)'
      ]
      return parens[Math.floor(Math.random() * parens.length)]
    },
    visual: () => {
      return 'Select this entire\nmultiline block\nof text here'
    }
  },

  keyNotation: {
    'C-': 'Ctrl+',
    'M-': 'Alt+',
    '<CR>': 'Enter',
    '<Esc>': 'Escape',
    '<Tab>': 'Tab',
    '<Space>': 'Space'
  }
}
