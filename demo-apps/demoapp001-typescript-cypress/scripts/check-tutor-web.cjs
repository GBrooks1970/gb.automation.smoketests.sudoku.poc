// check-tutor-web.cjs — smoke validation for the Express web UI and interactive tutor assets
// Verifies HTML DOM structure, semantic accessibility IDs, static module assets, and live hint workflow.

const http = require('node:http');
const { createApp } = require('../dist/server/app.js');

const app = createApp();
const server = http.createServer(app);

const problems = [];
const check = (ok, msg) => {
  if (!ok) problems.push(msg);
};

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: server.address().port,
        path,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

server.listen(0, '127.0.0.1', async () => {
  try {
    // 1. Check HTML index page
    const indexRes = await request('/');
    check(indexRes.status === 200, `GET / returned HTTP ${indexRes.status}`);
    check(indexRes.body.includes('<!DOCTYPE html>'), 'GET / is not HTML document');
    check(indexRes.body.includes('id="tab-visualiser"'), 'Missing #tab-visualiser');
    check(indexRes.body.includes('id="tab-tutor"'), 'Missing #tab-tutor');
    check(indexRes.body.includes('id="tutor-controls"'), 'Missing #tutor-controls');
    check(indexRes.body.includes('id="btn-get-hint"'), 'Missing #btn-get-hint');
    check(indexRes.body.includes('id="btn-apply-hint"'), 'Missing #btn-apply-hint');
    check(indexRes.body.includes('id="btn-auto-step"'), 'Missing #btn-auto-step');
    check(indexRes.body.includes('id="digit-keypad"'), 'Missing #digit-keypad');
    check(indexRes.body.includes('id="tutor-panel"'), 'Missing #tutor-panel');

    // 2. Check Static Javascript and CSS assets
    const assets = ['/js/app.js', '/js/grid.js', '/js/player.js', '/js/tutor.js', '/css/styles.css'];
    for (const asset of assets) {
      const assetRes = await request(asset);
      check(assetRes.status === 200, `Asset ${asset} returned HTTP ${assetRes.status}`);
      check(assetRes.body.length > 50, `Asset ${asset} is unexpectedly small`);
    }

    // 3. Check Live Tutor Hint API workflow
    const partialGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    partialGrid[0] = [1, 2, 0, 4, 5, 6, 7, 8, 9];

    const hintRes = await request('/api/tutor/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grid: partialGrid }),
    });
    check(hintRes.status === 200, `/api/tutor/hint returned HTTP ${hintRes.status}`);
    const hintData = JSON.parse(hintRes.body);
    check(hintData.status === 'HINT_AVAILABLE', `Expected HINT_AVAILABLE, got ${hintData.status}`);
    check(hintData.technique === 'UnitCompletion', `Expected UnitCompletion, got ${hintData.technique}`);
    check(hintData.move && hintData.move.digit === 3, `Expected move.digit === 3, got ${hintData.move?.digit}`);
    check(typeof hintData.rationale === 'string' && hintData.rationale.length > 20, 'Missing or empty rationale');

    if (problems.length > 0) {
      console.error('check-tutor-web: FAIL');
      for (const p of problems) console.error(`  - ${p}`);
      server.close(() => process.exit(1));
    } else {
      console.log('check-tutor-web: PASS (Web UI, tabs, keypad, static assets, and live hint workflow verified)');
      server.close(() => process.exit(0));
    }
  } catch (err) {
    console.error('check-tutor-web exception:', err);
    server.close(() => process.exit(1));
  }
});
