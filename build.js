import * as esbuild from 'esbuild';
import { readdir } from 'fs/promises';
import { join } from 'path';

// Build all UI components
const uiFiles = await readdir('src/ui');
const uiEntryPoints = uiFiles
  .filter(f => f.endsWith('.js'))
  .map(f => `src/ui/${f}`);

// Build all src files
await esbuild.build({
  entryPoints: ['src/index.js', ...uiEntryPoints, 'src/packs/index.js', 'src/utils/storage.js'],
  bundle: false,
  format: 'esm',
  platform: 'node',
  target: 'node16',
  outdir: 'dist',
  outExtension: { '.js': '.js' },
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  external: ['react', 'ink', 'chalk', 'conf', 'meow'],
});

console.log('Build complete!');
