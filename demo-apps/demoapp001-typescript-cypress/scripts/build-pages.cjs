// Assembles the static evidence site (BACKLOG-071 / DR-040) into an output dir
// (default: pages-dist) for GitHub Pages. Reuses the maintained public/ assets
// (grid.js, player.js, styles.css) verbatim and the static pages/ source
// (index.html, js/app.js), and writes precomputed data. Plain Node against
// built dist/ — no new dependency. Build first (npm run build) or use
// `npm run build:pages`.
//
// Usage: node scripts/build-pages.cjs [outDir]   (default: pages-dist)
const { mkdirSync, writeFileSync, copyFileSync, rmSync } = require('node:fs');
const { resolve } = require('node:path');
const { precompute } = require('./lib/precompute-visualise.cjs');

const APP = resolve(__dirname, '..');
const OUT = resolve(process.cwd(), process.argv[2] || 'pages-dist');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(resolve(OUT, 'data/visualise'), { recursive: true });
mkdirSync(resolve(OUT, 'js'), { recursive: true });
mkdirSync(resolve(OUT, 'css'), { recursive: true });

// Static viewer files: maintained rendering modules (single-source in public/)
// plus the static-evidence index.html and client.
copyFileSync(resolve(APP, 'app_src/server/public/js/grid.js'), resolve(OUT, 'js/grid.js'));
copyFileSync(resolve(APP, 'app_src/server/public/js/player.js'), resolve(OUT, 'js/player.js'));
copyFileSync(resolve(APP, 'app_src/server/public/css/styles.css'), resolve(OUT, 'css/styles.css'));
copyFileSync(resolve(APP, 'pages/js/app.js'), resolve(OUT, 'js/app.js'));
copyFileSync(resolve(APP, 'pages/index.html'), resolve(OUT, 'index.html'));

// Precomputed data.
const { puzzles, payloads } = precompute();
writeFileSync(resolve(OUT, 'data/puzzles.json'), `${JSON.stringify({ puzzles }, null, 2)}\n`);
for (const p of puzzles) {
  writeFileSync(
    resolve(OUT, 'data/visualise', `${p.slug}.json`),
    `${JSON.stringify(payloads[p.slug], null, 2)}\n`,
  );
}

console.log(`build-pages: wrote ${OUT} (${puzzles.length} puzzles: ${puzzles.map((p) => p.slug).join(', ')})`);
