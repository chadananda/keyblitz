import * as esbuild from 'esbuild';
import { glob } from 'glob';

const files = await glob('src/**/*.js');

await esbuild.build({
  entryPoints: files,
  outdir: 'dist',
  format: 'esm',
  platform: 'node',
  target: ['node16'],
  jsx: 'automatic',
  jsxImportSource: 'react',
  loader: { '.js': 'jsx' },
  bundle: false,
  preserveSymlinks: false,
});

console.log('✓ Build complete!');
