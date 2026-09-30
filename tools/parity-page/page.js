const S = [
  { id: 'ts', label: 'TypeScript', how: 'Serenity/JS with Cucumber.js' },
  { id: 'py', label: 'Python', how: 'pytest-bdd' },
  { id: 'cs', label: 'C#', how: 'Reqnroll with NUnit, .NET 10' },
];
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const $ = (id) => document.getElementById(id);
const ok = (r, s) => r.res[s][0] === 'PASSED';

// Theme: follows the viewer's setting until the button is used, then flips between light and dark
$('theme-toggle').addEventListener('click', () => {
  const root = document.documentElement, attr = root.getAttribute('data-theme');
  const dark = attr ? attr === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', dark ? 'light' : 'dark');
});

// Hero
const clean = DATA.cases.clean;
const pass = clean.exit === 0;
$('verdict').className = `pill ${pass ? 'pass' : 'fail'}`;
$('verdict').textContent = `PARITY ${pass ? 'PASS' : 'FAIL'}`;
const execs = DATA.rows.length * S.length;
const passed = DATA.rows.reduce((n, r) => n + S.filter((s) => ok(r, s.id)).length, 0);
const steps = DATA.rows.reduce((n, r) => n + r.steps.length, 0);
$('tally').textContent = `${DATA.rows.length} scenarios · ${steps} steps each · ${execs} executions · ${passed} passed`;
$('provenance').innerHTML = [
  DATA.meta.sha ? `commit <a href="https://github.com/${esc(DATA.meta.repo)}/commit/${esc(DATA.meta.sha)}">${esc(DATA.meta.sha.slice(0, 7))}</a>` : 'local build',
  DATA.meta.runId ? `<a href="https://github.com/${esc(DATA.meta.repo)}/actions/runs/${esc(DATA.meta.runId)}">run ${esc(DATA.meta.runId)}</a>` : null,
  esc(DATA.meta.generated),
].filter(Boolean).join(' · ');
if (DATA.meta.runId) { const a = $('runlink'); a.hidden = false; a.href = `https://github.com/${DATA.meta.repo}/actions/runs/${DATA.meta.runId}#artifacts`; }
$('bench').innerHTML = S.map((s) => {
  const good = DATA.rows.filter((r) => ok(r, s.id)).length;
  const ticks = DATA.rows.map((r) => `<i class="${ok(r, s.id) ? '' : 'bad'}" title="${esc(r.name)}${r.n ? ' (row ' + (r.n + 1) + ')' : ''}"></i>`).join('');
  return `<div class="lane lane-${s.id}"><div><span class="label">${s.label}</span><span class="how">${s.how}</span></div><div class="ticks" aria-hidden="true">${ticks}</div><span class="count">${good} of ${DATA.rows.length} passed</span></div>`;
}).join('');

// Matrix
let query = '';
const openSec = new Set(DATA.sections.slice(1, 2));
$('q').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); renderMatrix(); });
const mark = (v) => v ? '<i class="mark p" aria-label="passed">✓</i>' : '<i class="mark f" aria-label="did not pass">✗</i>';
const stepHtml = (s) => esc(s).replace(/^(Given|When|Then|And|But)\b/, '<b>$1</b>');
const label = (r) => r.name + (DATA.rows.filter((x) => x.name === r.name).length > 1 ? ` · row ${r.n + 1}` : '');
function renderMatrix() {
  const rows = DATA.rows.filter((r) => !query || (r.name + ' ' + r.steps.join(' ') + ' ' + r.section).toLowerCase().includes(query));
  const secs = DATA.sections.filter((t) => rows.some((r) => r.section === t));
  let html = '';
  secs.forEach((t) => {
    const sr = rows.filter((r) => r.section === t), open = openSec.has(t) || !!query;
    html += `<tr class="feat" data-s="${esc(t)}" data-open="${open}"><td><button class="fname" type="button" aria-expanded="${open}">${esc(t)} <span class="num" style="color:var(--muted);font-weight:400">(${sr.length})</span></button></td>` +
      S.map((s) => { const g = sr.filter((r) => ok(r, s.id)).length; return `<td class="cell num${g < sr.length ? ' bad' : ''}">${g}/${sr.length} ${g === sr.length ? '✓' : '✗'}</td>`; }).join('') + '</tr>';
    if (!open) return;
    sr.forEach((r) => {
      html += `<tr class="sc" data-i="${DATA.rows.indexOf(r)}" data-open="false"><td><button class="name" type="button" aria-expanded="false">${esc(label(r))}</button></td>` +
        S.map((s) => `<td class="cell">${mark(ok(r, s.id))}</td>`).join('') + '</tr>';
    });
  });
  if (!rows.length) html = '<tr><td colspan="4" style="padding:1rem .75rem;color:var(--muted)">No scenarios match that filter.</td></tr>';
  document.querySelector('#mtable tbody').innerHTML = html;
  $('mcount').textContent = `${rows.length} of ${DATA.rows.length} scenarios in ${secs.length} sections`;
  $('expall').textContent = secs.length && secs.every((t) => openSec.has(t)) ? 'Collapse all' : 'Expand all';
}
$('expall').addEventListener('click', () => {
  const all = DATA.sections.every((t) => openSec.has(t));
  DATA.sections.forEach((t) => (all ? openSec.delete(t) : openSec.add(t)));
  renderMatrix();
});
document.querySelector('#mtable tbody').addEventListener('click', (e) => {
  const fb = e.target.closest('button.fname');
  if (fb) { const t = fb.closest('tr.feat').dataset.s; openSec.has(t) ? openSec.delete(t) : openSec.add(t); renderMatrix(); return; }
  const btn = e.target.closest('button.name'); if (!btn) return;
  const tr = btn.closest('tr.sc'), r = DATA.rows[+tr.dataset.i], open = tr.dataset.open === 'true';
  if (open) { if (tr.nextElementSibling?.classList.contains('detail')) tr.nextElementSibling.remove(); }
  else {
    const d = document.createElement('tr'); d.className = 'detail';
    const t = S.map((s) => `${s.label} ${r.res[s.id][1]} ms`).join(' · ');
    d.innerHTML = `<td colspan="4"><div class="gherkin">${r.steps.map(stepHtml).join('\n')}</div><div class="detail-links"><span>${esc(r.section)}</span><span class="num">${t}</span></div></td>`;
    tr.after(d);
  }
  tr.dataset.open = String(!open); btn.setAttribute('aria-expanded', String(!open));
});
renderMatrix();

// Same step, three languages
const ex = DATA.rows.find((r) => r.name === DATA.planted_step.scenario);
const lastStep = ex.steps[ex.steps.length - 1];
$('samestep').textContent = S.map((s) => `${s.label.padEnd(12)}${lastStep}`).join('\n');
const IMPL = {
  ts: 'Cucumber expression with typed parameters. The step hands the value to a Screenplay task.',
  py: 'pytest-bdd parses the same text with a format string, then uses the same Screenplay task.',
  cs: 'A regular expression over the same text. NUnit asserts the algorithm name, then the task runs.',
};
let cur = 'ts';
$('impltabs').innerHTML = S.map((s) => `<button type="button" role="tab" class="lane-${s.id}" data-s="${s.id}" aria-selected="${s.id === cur}">${s.label}</button>`).join('');
function renderImpl() {
  const s = S.find((x) => x.id === cur), m = DATA.impl[cur];
  const p = $('implpanel'); p.className = `panel impl lane-${cur}`;
  p.innerHTML = `<span class="eyebrow">${esc(s.how)}</span><p>${esc(IMPL[cur])}</p><pre class="code">${esc(m.code)}</pre><span class="where mono">${esc(m.where)}</span>`;
}
$('impltabs').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return; cur = b.dataset.s;
  $('impltabs').querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  renderImpl();
});
renderImpl();

// Techniques
$('tech').innerHTML = DATA.sections.map((t) => {
  const sr = DATA.rows.filter((r) => r.section === t);
  const good = sr.filter((r) => S.every((s) => ok(r, s.id))).length;
  return `<div class="panel"><span class="t">${esc(t)}</span><div class="bar" aria-hidden="true">${sr.map((r) => `<i class="${S.every((s) => ok(r, s.id)) ? '' : 'bad'}"></i>`).join('')}</div><span class="n">${good} of ${sr.length} passed on all three Stacks</span></div>`;
}).join('');

// Timings
const METRICS = [['total', 'Suite, sum of steps', 's'], ['p50', 'Scenario median', 'ms'], ['p95', 'Scenario p95', 'ms']];
let metric = 'total';
$('metric').innerHTML = METRICS.map(([k, l]) => `<button type="button" data-m="${k}" aria-pressed="${k === metric}">${l}</button>`).join('');
$('metric').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return; metric = b.dataset.m;
  $('metric').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  renderChart();
});
function niceMax(v) { const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p; return 10 * p; }
function renderChart() {
  const [, lab, unit] = METRICS.find((m) => m[0] === metric);
  const val = (s) => unit === 's' ? DATA.timings[s.id].total / 1000 : DATA.timings[s.id][metric];
  const max = niceMax(Math.max(...S.map(val)));
  const W = 560, rowH = 46, left = 86, right = 80, top = 8, H = top + rowH * S.length + 26;
  const x = (v) => left + (v / max) * (W - left - right);
  const fmt = (v) => unit === 's' ? `${v.toFixed(2)} s` : `${v.toFixed(1)} ms`;
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = (max / 4) * i, xx = x(v); g += `<line class="grid" x1="${xx}" x2="${xx}" y1="${top}" y2="${top + rowH * S.length}"/><text x="${xx}" y="${H - 6}" text-anchor="middle">${+v.toFixed(2)}</text>`; }
  S.forEach((s, i) => {
    const y = top + i * rowH + 8, v = val(s);
    g += `<text class="lab" x="0" y="${y + 17}">${s.label}</text><rect x="${left}" y="${y}" width="${Math.max(2, x(v) - left)}" height="22" rx="3" fill="var(--s-${s.id})"/><text class="val" x="${x(v) + 6}" y="${y + 15}">${fmt(v)}</text>`;
  });
  $('chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${lab} by Stack">${g}</svg>`;
}
renderChart();
$('tt').innerHTML = '<thead><tr><th>Stack</th><th>Suite</th><th>p50</th><th>p95</th></tr></thead><tbody>' +
  S.map((s) => { const m = DATA.timings[s.id]; return `<tr><td>${s.label}</td><td>${(m.total / 1000).toFixed(2)} s</td><td>${m.p50} ms</td><td>${m.p95} ms</td></tr>`; }).join('') + '</tbody>';

// The gate fails when it should
const CASES = [
  ['text', 'Step text changed', 'Planted in a copy of the Python results. Scenario counts stay identical, so a count-only gate would pass.'],
  ['fail_ts', 'TypeScript scenario fails', 'The last step of one scenario is set to failed in a copy of the Cucumber JSON.'],
  ['fail_py', 'Python scenario fails', 'The last step of one scenario is set to failed in a copy of the pytest-bdd JSON.'],
  ['fail_cs', 'C# scenario fails', 'One step result is set to FAILED in a copy of the Cucumber Messages file.'],
];
let cs = 'text';
$('cases').innerHTML = CASES.map(([k, l]) => `<button type="button" data-c="${k}" aria-pressed="${k === cs}">${l}</button>`).join('');
function showCase() {
  const [k, l, note] = CASES.find((c) => c[0] === cs), c = DATA.cases[k];
  $('casetitle').textContent = l;
  $('diff').innerHTML = k === 'text'
    ? `<span class="del">- ${esc(DATA.planted_step.before)}</span>\n<span class="add">+ ${esc(DATA.planted_step.after)}</span>`
    : `<span class="del">- status: passed</span>\n<span class="add">+ status: failed</span>`;
  $('negnote').textContent = `${note} Gate exit codes: ${c.exit} with the change, ${DATA.cases.clean.exit} without. The real results are untouched.`;
  $('term').innerHTML = '$ node tools/parity-page/check-parity.mjs';
}
$('cases').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return; cs = b.dataset.c;
  $('cases').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  showCase();
});
$('replay').addEventListener('click', () => {
  const t = $('term'), c = DATA.cases[cs], lines = ['$ node tools/parity-page/check-parity.mjs', ...c.lines];
  t.innerHTML = ''; let i = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = () => {
    if (i >= lines.length) return;
    const s = lines[i++], cls = /FAIL/.test(s) ? 'bad' : /PASS/.test(s) ? 'ok' : '';
    t.insertAdjacentHTML('beforeend', (i > 1 ? '\n' : '') + (cls ? `<span class="${cls}">${esc(s)}</span>` : esc(s)));
    reduce ? step() : setTimeout(step, 90);
  };
  step();
});
showCase();
