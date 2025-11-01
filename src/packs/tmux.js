export default {
  id: 'tmux',
  name: 'Tmux',
  description: 'Master tmux terminal multiplexer commands',
  version: '1.0.0',

  groups: [
    {
      name: 'Pane Management',
      description: 'Split, navigate, and manage panes',
      commands: [
        {keys: 'C-b %', concept: 'SPLIT VERTICAL', color: 'yellow', complexity: 1.3, targetType: 'pane'},
        {keys: 'C-b "', concept: 'SPLIT HORIZONTAL', color: 'yellow', complexity: 1.3, targetType: 'pane'},
        {keys: 'C-b o', concept: 'NEXT PANE', color: 'cyan', complexity: 1.0, targetType: 'pane'},
        {keys: 'C-b ;', concept: 'LAST PANE', color: 'cyan', complexity: 1.0, targetType: 'pane'},
        {keys: 'C-b x', concept: 'CLOSE PANE', color: 'red', complexity: 1.0, targetType: 'pane'},
        {keys: 'C-b z', concept: 'ZOOM PANE', color: 'magenta', complexity: 1.0, targetType: 'pane'},
        {keys: 'C-b {', concept: 'SWAP PANE LEFT', color: 'blue', complexity: 1.4, targetType: 'pane'},
        {keys: 'C-b }', concept: 'SWAP PANE RIGHT', color: 'blue', complexity: 1.4, targetType: 'pane'},
        {keys: 'C-b q', concept: 'SHOW PANE NUMBERS', color: 'cyan', complexity: 1.0, targetType: 'pane'},
      ]
    },
    {
      name: 'Window Management',
      description: 'Create and navigate windows',
      commands: [
        {keys: 'C-b c', concept: 'NEW WINDOW', color: 'yellow', complexity: 1.0, targetType: 'window'},
        {keys: 'C-b n', concept: 'NEXT WINDOW', color: 'cyan', complexity: 1.0, targetType: 'window'},
        {keys: 'C-b p', concept: 'PREVIOUS WINDOW', color: 'cyan', complexity: 1.0, targetType: 'window'},
        {keys: 'C-b l', concept: 'LAST WINDOW', color: 'cyan', complexity: 1.0, targetType: 'window'},
        {keys: 'C-b 0', concept: 'WINDOW 0', color: 'blue', complexity: 1.0, targetType: 'window'},
        {keys: 'C-b 1', concept: 'WINDOW 1', color: 'blue', complexity: 1.0, targetType: 'window'},
        {keys: 'C-b &', concept: 'CLOSE WINDOW', color: 'red', complexity: 1.2, targetType: 'window'},
        {keys: 'C-b ,', concept: 'RENAME WINDOW', color: 'yellow', complexity: 1.2, targetType: 'window'},
        {keys: 'C-b w', concept: 'LIST WINDOWS', color: 'cyan', complexity: 1.0, targetType: 'window'},
      ]
    },
    {
      name: 'Session & Other',
      description: 'Session management and utilities',
      commands: [
        {keys: 'C-b d', concept: 'DETACH SESSION', color: 'magenta', complexity: 1.0, targetType: 'session'},
        {keys: 'C-b s', concept: 'LIST SESSIONS', color: 'cyan', complexity: 1.0, targetType: 'session'},
        {keys: 'C-b $', concept: 'RENAME SESSION', color: 'yellow', complexity: 1.2, targetType: 'session'},
        {keys: 'C-b [', concept: 'COPY MODE', color: 'magenta', complexity: 1.3, targetType: 'mode'},
        {keys: 'C-b ]', concept: 'PASTE BUFFER', color: 'magenta', complexity: 1.3, targetType: 'mode'},
        {keys: 'C-b ?', concept: 'SHOW BINDINGS', color: 'cyan', complexity: 1.0, targetType: 'help'},
        {keys: 'C-b :', concept: 'COMMAND PROMPT', color: 'yellow', complexity: 1.4, targetType: 'command'},
      ]
    }
  ],

  targetGenerators: {
    pane: () => '┌──────┬──────┐\n│  1   │  2   │\n└──────┴──────┘',
    window: () => '[0:bash] [1:vim] [2:htop] [3:logs]',
    session: () => 'Sessions: main, dev, logs',
    mode: () => 'Tmux buffer operations',
    help: () => 'Tmux help and commands',
    command: () => 'Tmux command mode'
  },

  keyNotation: {
    'C-b': 'Ctrl+b ',
    'C-': 'Ctrl+',
  }
}
