// Construiește site-ul într-un singur app.js + app.css (fără module ES => merge și din file://, cu dublu-click pe index.html)
// Folosire:  npm install && npm run build
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const esbuild = require('esbuild');
const root = path.dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes('--watch');
const opts = {
  absWorkingDir: root,
  entryPoints: { app: 'src/main.js' },
  outdir: '.',
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: !watch,
  sourcemap: watch ? 'inline' : false,
  loader: { '.woff2': 'dataurl', '.svg': 'text', '.png': 'dataurl', '.gif': 'dataurl', '.jpg': 'dataurl' },
  legalComments: 'none',
  nodePaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [],
  logLevel: 'info',
};
if (watch) { const ctx = await esbuild.context(opts); await ctx.watch(); console.log('Urmăresc modificările…'); }
else { await esbuild.build(opts); }
