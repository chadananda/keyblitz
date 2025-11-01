export default {
  id: 'hyprland',
  name: 'Hyprland',
  description: 'Master Hyprland tiling window manager keybindings',
  version: '1.0.0',

  groups: [
    {
      name: 'Window Navigation',
      description: 'Core movement between windows',
      commands: [
        {keys: 'Super+h', concept: 'FOCUS LEFT', color: 'cyan', complexity: 1.0, targetType: 'window'},
        {keys: 'Super+j', concept: 'FOCUS DOWN', color: 'cyan', complexity: 1.0, targetType: 'window'},
        {keys: 'Super+k', concept: 'FOCUS UP', color: 'cyan', complexity: 1.0, targetType: 'window'},
        {keys: 'Super+l', concept: 'FOCUS RIGHT', color: 'cyan', complexity: 1.0, targetType: 'window'},
        {keys: 'Super+Tab', concept: 'NEXT WINDOW', color: 'cyan', complexity: 1.1, targetType: 'window'},
        {keys: 'Super+Shift+Tab', concept: 'PREV WINDOW', color: 'cyan', complexity: 1.2, targetType: 'window'},
        {keys: 'Alt+Tab', concept: 'CYCLE RECENT', color: 'blue', complexity: 1.0, targetType: 'window'}
      ]
    },
    {
      name: 'Workspace Control',
      description: 'Switch and manage workspaces',
      commands: [
        {keys: 'Super+1', concept: 'WORKSPACE 1', color: 'blue', complexity: 1.0, targetType: 'workspace'},
        {keys: 'Super+2', concept: 'WORKSPACE 2', color: 'blue', complexity: 1.0, targetType: 'workspace'},
        {keys: 'Super+3', concept: 'WORKSPACE 3', color: 'blue', complexity: 1.0, targetType: 'workspace'},
        {keys: 'Super+4', concept: 'WORKSPACE 4', color: 'blue', complexity: 1.0, targetType: 'workspace'},
        {keys: 'Super+5', concept: 'WORKSPACE 5', color: 'blue', complexity: 1.0, targetType: 'workspace'},
        {keys: 'Super+6', concept: 'WORKSPACE 6', color: 'blue', complexity: 1.0, targetType: 'workspace'},
        {keys: 'Super+7', concept: 'WORKSPACE 7', color: 'blue', complexity: 1.0, targetType: 'workspace'},
        {keys: 'Super+8', concept: 'WORKSPACE 8', color: 'blue', complexity: 1.0, targetType: 'workspace'},
        {keys: 'Super+9', concept: 'WORKSPACE 9', color: 'blue', complexity: 1.0, targetType: 'workspace'},
        {keys: 'Super+Shift+1', concept: 'MOVE TO WORKSPACE 1', color: 'blue', complexity: 1.3, targetType: 'workspace'},
        {keys: 'Super+Shift+2', concept: 'MOVE TO WORKSPACE 2', color: 'blue', complexity: 1.3, targetType: 'workspace'},
        {keys: 'Super+Shift+3', concept: 'MOVE TO WORKSPACE 3', color: 'blue', complexity: 1.3, targetType: 'workspace'},
        {keys: 'Super+Shift+4', concept: 'MOVE TO WORKSPACE 4', color: 'blue', complexity: 1.3, targetType: 'workspace'},
        {keys: 'Super+Shift+5', concept: 'MOVE TO WORKSPACE 5', color: 'blue', complexity: 1.3, targetType: 'workspace'},
        {keys: 'Super+mouse_down', concept: 'PREV WORKSPACE', color: 'blue', complexity: 1.2, targetType: 'workspace'},
        {keys: 'Super+mouse_up', concept: 'NEXT WORKSPACE', color: 'blue', complexity: 1.2, targetType: 'workspace'}
      ]
    },
    {
      name: 'Window Management',
      description: 'Manipulate window layout and state',
      commands: [
        {keys: 'Super+v', concept: 'SPLIT VERTICAL', color: 'yellow', complexity: 1.2, targetType: 'layout'},
        {keys: 'Super+b', concept: 'SPLIT HORIZONTAL', color: 'yellow', complexity: 1.2, targetType: 'layout'},
        {keys: 'Super+f', concept: 'FULLSCREEN TOGGLE', color: 'magenta', complexity: 1.0, targetType: 'window'},
        {keys: 'Super+q', concept: 'CLOSE WINDOW', color: 'red', complexity: 1.0, targetType: 'window'},
        {keys: 'Super+Shift+q', concept: 'KILL WINDOW', color: 'red', complexity: 1.3, targetType: 'window'},
        {keys: 'Super+t', concept: 'FLOATING TOGGLE', color: 'magenta', complexity: 1.2, targetType: 'window'},
        {keys: 'Super+m', concept: 'MAXIMIZE TOGGLE', color: 'magenta', complexity: 1.0, targetType: 'window'},
        {keys: 'Super+p', concept: 'PIN WINDOW', color: 'yellow', complexity: 1.2, targetType: 'window'},
        {keys: 'Super+s', concept: 'PSEUDO TILE', color: 'yellow', complexity: 1.3, targetType: 'layout'},
        {keys: 'Super+j', concept: 'TOGGLE SPLIT', color: 'yellow', complexity: 1.2, targetType: 'layout'}
      ]
    },
    {
      name: 'Window Movement',
      description: 'Move windows around workspace',
      commands: [
        {keys: 'Super+Shift+h', concept: 'MOVE WINDOW LEFT', color: 'cyan', complexity: 1.3, targetType: 'window'},
        {keys: 'Super+Shift+j', concept: 'MOVE WINDOW DOWN', color: 'cyan', complexity: 1.3, targetType: 'window'},
        {keys: 'Super+Shift+k', concept: 'MOVE WINDOW UP', color: 'cyan', complexity: 1.3, targetType: 'window'},
        {keys: 'Super+Shift+l', concept: 'MOVE WINDOW RIGHT', color: 'cyan', complexity: 1.3, targetType: 'window'},
        {keys: 'Super+Ctrl+h', concept: 'RESIZE LEFT', color: 'yellow', complexity: 1.4, targetType: 'window'},
        {keys: 'Super+Ctrl+j', concept: 'RESIZE DOWN', color: 'yellow', complexity: 1.4, targetType: 'window'},
        {keys: 'Super+Ctrl+k', concept: 'RESIZE UP', color: 'yellow', complexity: 1.4, targetType: 'window'},
        {keys: 'Super+Ctrl+l', concept: 'RESIZE RIGHT', color: 'yellow', complexity: 1.4, targetType: 'window'}
      ]
    },
    {
      name: 'Advanced Commands',
      description: 'Power user shortcuts',
      commands: [
        {keys: 'Super+Return', concept: 'LAUNCH TERMINAL', color: 'green', complexity: 1.0, targetType: 'app'},
        {keys: 'Super+d', concept: 'LAUNCH MENU', color: 'green', complexity: 1.0, targetType: 'app'},
        {keys: 'Super+e', concept: 'TOGGLE LAYOUT', color: 'yellow', complexity: 1.2, targetType: 'layout'},
        {keys: 'Super+w', concept: 'WORKSPACE OVERVIEW', color: 'blue', complexity: 1.2, targetType: 'workspace'},
        {keys: 'Super+Shift+r', concept: 'RELOAD CONFIG', color: 'yellow', complexity: 1.3, targetType: 'system'},
        {keys: 'Super+Shift+e', concept: 'EXIT HYPRLAND', color: 'red', complexity: 1.5, targetType: 'system'},
        {keys: 'Super+Shift+Space', concept: 'TOGGLE FLOAT', color: 'magenta', complexity: 1.2, targetType: 'window'},
        {keys: 'Super+Ctrl+Space', concept: 'CENTER FLOAT', color: 'magenta', complexity: 1.3, targetType: 'window'},
        {keys: 'Super+g', concept: 'TOGGLE GROUP', color: 'yellow', complexity: 1.3, targetType: 'layout'},
        {keys: 'Super+Shift+g', concept: 'LOCK GROUPS', color: 'yellow', complexity: 1.4, targetType: 'layout'}
      ]
    }
  ],

  targetGenerators: {
    window: () => {
      const windows = [
        'Browser  Terminal  Editor  [current window]',
        '┌─────┬─────┐\n│  *  │     │  Focus: Window 1\n└─────┴─────┘',
        '┌─────┬─────┐\n│     │  *  │  Focus: Window 2\n└─────┴─────┘',
        'Window Focus: [Firefox] Terminal Code Spotify'
      ];
      return windows[Math.floor(Math.random() * windows.length)];
    },
    workspace: () => {
      const workspaces = [
        'Workspace: [ 1 2 3 4 5 6 7 8 9 ]',
        'Current: 3  →  Target: 5',
        '[ Code ] [ Web ] [ Music ] [ Chat ] [ Mail ]',
        'WS: ●○○●○●○○○  (Active: 1,4,6)'
      ];
      return workspaces[Math.floor(Math.random() * workspaces.length)];
    },
    layout: () => {
      const layouts = [
        '┌─────┬─────┐\n│  A  │  B  │\n└─────┴─────┘',
        '┌───────────┐\n│     A     │\n├─────┬─────┤\n│  B  │  C  │\n└─────┴─────┘',
        '┌─────┬─────┐\n│  A  │  B  │\n├─────┼─────┤\n│  C  │  D  │\n└─────┴─────┘',
        'Master-Stack Layout:\n┌──────┬───┐\n│      │ 2 │\n│  1   ├───┤\n│      │ 3 │\n└──────┴───┘'
      ];
      return layouts[Math.floor(Math.random() * layouts.length)];
    },
    app: () => {
      const apps = [
        'Applications: Terminal, Browser, Editor...',
        'Launcher: [Type to search apps]',
        '🚀 Quick Launch Menu',
        'Apps: Kitty | Firefox | Code | Spotify'
      ];
      return apps[Math.floor(Math.random() * apps.length)];
    },
    system: () => {
      const systems = [
        'Hyprland System Control',
        '⚙️  Configuration Manager',
        'System: [Reload] [Exit] [Lock]',
        'Hyprland v0.32.3 - Ready'
      ];
      return systems[Math.floor(Math.random() * systems.length)];
    }
  },

  keyNotation: {
    'Super+': 'Super+',
    'Shift+': 'Shift+',
    'Ctrl+': 'Ctrl+',
    'Alt+': 'Alt+'
  }
};
