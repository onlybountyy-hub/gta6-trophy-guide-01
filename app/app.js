// LEONIDA v9 — Trophy Intelligence. One source of truth: app/data/trophies.json.
// Offline, no network calls. Progress + journal persist in localStorage; ?demo=1
// seeds a fixed, labelled demo set for screenshots (never persisted).
const KEY = 'leonida-v9-progress';
const params = new URLSearchParams(location.search);
const DEMO = params.get('demo') === '1';
const DEMO_EARNED = [2, 3, 8, 15, 16, 21, 28, 35, 42, 46, 53, 55];
const doc = await (await fetch('data/trophies.json')).json();
const TROPHIES = doc.trophies;
const byId = new Map(TROPHIES.map(t => [t.id, t]));
const CITATION = 'Exophase — Grand Theft Auto VI PSN trophies; PSNProfiles — Grand Theft Auto VI trophies (43531)';

let earned = new Set();
let journal = {};
try {
  const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
  if (saved && Array.isArray(saved.earned)) earned = new Set(saved.earned.filter(n => byId.has(n)));
  if (saved && saved.journal && typeof saved.journal === 'object') journal = saved.journal;
} catch { /* corrupted save: start clean, never crash */ }
if (DEMO) earned = new Set(DEMO_EARNED);
let selectedId = Number(params.get('trophy') ?? 17);
if (!byId.has(selectedId)) selectedId = 17;
let view = params.get('view') ?? 'command';
if (!['command', 'guide', 'roadmap', 'toolkit'].includes(view)) view = 'command';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const gradePill = g => `<span class="grade g-${g}">${g}</span>`;
const auditPill = a => a === 'PASS' ? '<span class="pill p-pass">AUDIT: PASS</span>' : '<span class="pill p-review">AUDIT: REVIEW</span>';
const evPill = e => e.startsWith('DIRECT') ? '<span class="pill p-direct">DIRECT EVIDENCE</span>' : e.startsWith('PARTIAL') ? '<span class="pill p-interp">PARTIAL EVIDENCE</span>' : '<span class="pill p-unver">UNVERIFIED</span>';
const riskPill = r => `<span class="pill p-risk">RISK: ${esc(r)}</span>`;

function save() {
  if (DEMO) return;
  try { localStorage.setItem(KEY, JSON.stringify({ version: 1, earned: [...earned].sort((a, b) => a - b), journal })); $('saveState').textContent = 'Progress saved'; } catch { $('saveState').textContent = 'Save failed — storage unavailable'; }
}
function detailHTML(t, mode) {
  const note = journal[t.id];
  const cite = `<div class="cite"><b>Source — citation:</b> ${esc(t.citation)}. Name, description and grade as listed by both sources; counts in the guide come from the official description. Strategy above is labelled interpretation where it goes beyond the kit.</div>`;
  const head = `<h3>#${t.id} ${esc(t.name)} ${gradePill(t.grade)}</h3>
  <p><strong>Category:</strong> ${esc(t.category)} &nbsp;·&nbsp; <strong>Difficulty:</strong> ${esc(t.difficulty)} &nbsp;·&nbsp; <strong>Time:</strong> ${esc(t.time)}</p>
  <p class="off">Official description: “${esc(t.description)}”</p>`;
  const pills = `<p>${riskPill(t.risk)} ${esc(t.riskNote)}</p><p>${auditPill(t.audit)} ${evPill(t.evidence)}</p>`;
  const steps = `<p><strong>Execution steps</strong></p><ol class="steps">${t.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
  if (mode === 'compact') {
    return `${head}
  <dl class="kv"><dt>What it requires</dt><dd>${esc(t.guide)}</dd>
  <dt>Strategy</dt><dd>${esc(t.strategy)}</dd></dl>
  ${cite}
  <p><strong>Execution steps</strong></p><ol class="steps">${t.steps.slice(0, 3).map(s => `<li>${esc(s)}</li>`).join('')}</ol>
  <p class="tmeta">Full guide — interpretation, kit fact, preparation and all steps — in the Strategy Library.</p>
  ${pills}${note ? `<p><strong>Your journal note:</strong> ${esc(note)}</p>` : ''}`;
  }
  return `${head}
  <dl class="kv">
  <dt>What it requires</dt><dd>${esc(t.guide)}</dd>
  <dt>Interpretation</dt><dd>${esc(t.interpretation)}</dd>
  <dt>Kit fact</dt><dd>${esc(t.kitFact)}</dd>
  <dt>Strategy</dt><dd>${esc(t.strategy)}</dd>
  <dt>Preparation</dt><dd>${esc(t.preparation)}</dd>
  </dl>
  ${cite}
  ${pills}
  ${steps}
  ${note ? `<p><strong>Your journal note:</strong> ${esc(note)}</p>` : ''}`;
}
function filtered() {
  const q = $('search').value.trim().toLowerCase();
  return TROPHIES.filter(t => {
    if ($('grade').value !== 'all' && t.grade !== $('grade').value) return false;
    if ($('category').value !== 'all' && t.category !== $('category').value) return false;
    if ($('risk').value !== 'all' && t.risk !== $('risk').value) return false;
    if ($('status').value === 'earned' && !earned.has(t.id)) return false;
    if ($('status').value === 'remaining' && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.category).toLowerCase().includes(q)) return false;
    return true;
  });
}
function renderList() {
  const list = filtered();
  $('countLine').textContent = `${list.length} of 55 shown · ${earned.size} earned`;
  for (const [el, compact] of [[$('list'), false], [$('guideList'), true]]) {
    el.replaceChildren();
    for (const t of list) {
      const li = document.createElement('li');
      if (t.id === selectedId) li.className = 'sel';
      if (earned.has(t.id)) li.classList.add('earned');
      const box = document.createElement('input');
      box.type = 'checkbox'; box.className = 'check'; box.checked = earned.has(t.id);
      box.setAttribute('aria-label', `Mark ${t.name} earned`);
      box.addEventListener('change', () => { box.checked ? earned.add(t.id) : earned.delete(t.id); save(); renderAll(); });
      const div = document.createElement('div');
      div.innerHTML = `<span class="tname">#${t.id} ${esc(t.name)}</span>${gradePill(t.grade)}<br><span class="tmeta">${esc(compact ? t.guide : t.description)} · ${esc(t.category)} · ${esc(t.risk)}</span>`;
      div.addEventListener('click', () => { selectedId = t.id; renderAll(); });
      li.append(box, div); el.append(li);
    }
  }
}
function renderProgress() {
  const pct = Math.round(earned.size / 55 * 100);
  $('ringPct').textContent = pct + '%';
  $('ringFg').style.strokeDasharray = `${pct * 3.27} 327`;
  $('progressLine').textContent = `${earned.size} of 55 earned`;
  $('progressSub').textContent = `Platinum: Vice Got a Price! — ${earned.size - (earned.has(1) ? 1 : 0)} of 54 others earned · ${pct}%`;
  $('saveState').textContent = DEMO ? 'Demo progress — not saved' : 'Progress saved';
  $('demoBadge').hidden = !DEMO;
}
function renderNext() {
  const order = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27, 25, 15, 17, 30, 31, 40, 14, ...TROPHIES.map(t => t.id)];
  const next = order.map(id => byId.get(id)).find(t => t && !earned.has(t.id));
  $('nextRec').innerHTML = next ? `<p><strong>#${next.id} ${esc(next.name)}</strong> ${gradePill(next.grade)}</p><p>${esc(next.guide)}</p><p class="tmeta">Why now: it is the earliest unfinished trophy in story order, then the silver set, then the rest. ${esc(next.riskNote)}</p>` : '<p>All 55 earned — platinum complete.</p>';
}
function renderMini() {
  const g = {};
  for (const t of TROPHIES) { g[t.grade] = g[t.grade] || [0, 0]; g[t.grade][1]++; if (earned.has(t.id)) g[t.grade][0]++; }
  $('miniStats').innerHTML = Object.entries(g).map(([k, v]) => `<div><span>${k}</span><span>${v[0]} / ${v[1]}</span></div>`).join('');
  const pass = TROPHIES.filter(t => t.audit === 'PASS').length;
  $('miniAudit').innerHTML = `<div><span>Guides audited</span><span>55 / 55</span></div><div><span>PASS</span><span>${pass}</span></div><div><span>REVIEW (vague description)</span><span>${55 - pass}</span></div><div><span>Missing evidence</span><span>0</span></div>`;
}

const PHASES = [
  { n: 'PHASE 1 — Trophy Intelligence Audit', d: 'Read all 55 objectives, learn the counts, and mark the five REVIEW guides whose descriptions are vague.', ids: [16, 38, 47, 48, 49, 50], risk: 'Know what is unverified before you play.' },
  { n: 'PHASE 2 — Risk & Preparation', d: 'Partner and combat trophies first; do story-gated cleanup before the finale.', ids: [33, 34, 36, 39, 7], risk: 'Choice-sensitive: #48 only. Everything else: no missable evidence.' },
  { n: 'PHASE 3 — Main Objective Tracking', d: 'Chapters 1–4, the final mission, named missions, five character strands, 8 stranger strands.', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27, 25], risk: 'Finish strands before the finale (precaution, unverified).' },
  { n: 'PHASE 4 — Activities, Collectibles & Exploration', d: 'Stunts, range, races, fishing, arcade, meditation, hunting, cards, WAiNK, challenges, vehicles, areas, gangs.', ids: [15, 17, 18, 19, 20, 21, 28, 29, 30, 31, 32, 35, 42, 43], risk: 'Long counts — log every unit in the journal.' },
  { n: 'PHASE 5 — Economy, Cleanup & Platinum', d: 'Vaults, trucks, showroom, bowling, drive-by, airport, laundering, spending, garages, Scooter Bros — then 100% and the platinum.', ids: [40, 41, 44, 45, 46, 51, 52, 53, 54, 55, 37, 14, 1], risk: 'Audit the full list; one overlooked trophy blocks the platinum.' },
];
function renderRoadmap() {
  $('phases').innerHTML = PHASES.map(p => {
    const done = p.ids.filter(id => earned.has(id)).length;
    return `<div class="phase"><h3>${esc(p.n)}</h3><p>${esc(p.d)}</p><p class="pstat">Progress: ${done} / ${p.ids.length} earned</p><p class="plist">${p.ids.map(id => `${earned.has(id) ? '✓' : '○'} #${id} ${esc(byId.get(id).name)}`).join(' · ')}</p><p class="pstat">${esc(p.risk)}</p></div>`;
  }).join('');
  const hm = $('heatmap');
  hm.replaceChildren();
  for (const t of TROPHIES) {
    const c = document.createElement('div');
    c.className = 'cell' + (earned.has(t.id) ? ' earned' : '') + (t.audit === 'REVIEW' ? ' review' : '') + (t.id === selectedId ? ' sel' : '');
    c.textContent = t.id; c.title = `#${t.id} ${t.name} (${t.grade}) — ${earned.has(t.id) ? 'earned' : 'not started'}`;
    c.addEventListener('click', () => { selectedId = t.id; view = 'guide'; showView(); renderAll(); });
    hm.append(c);
  }
  $('riskPanel').innerHTML = `<p><strong>CHOICE-SENSITIVE: 1</strong> — #48 Actions Speak Louder (choices, count to 500).</p><p><strong>NO MISSABLE EVIDENCE: 54 · CONFIRMED MISSABLE: 0.</strong> The kit gives no evidence of a missable condition for any other trophy; this guide does not inflate the count.</p>`;
  $('relPanel').innerHTML = `<p><strong>Verified:</strong> #1 requires the other 54 trophies; #14 (100%) is the final audit gate.</p><p><strong>Associations, not dependencies:</strong> #35 feeds #55; #16 samples the activity trophies; #52/#53 are the economy pair. No other dependency is confirmed by the kit.</p>`;
}
function renderToolkit() {
  const g = {};
  for (const t of TROPHIES) { g[t.grade] = g[t.grade] || [0, 0]; g[t.grade][1]++; if (earned.has(t.id)) g[t.grade][0]++; }
  $('gradeStats').innerHTML = '<h3>By grade</h3>' + Object.entries(g).map(([k, v]) => `<div class="ministats"><div><span>${k}</span><span>${v[0]} / ${v[1]} earned (${Math.round(v[0] / v[1] * 100)}%)</span></div></div>`).join('');
  const c = {};
  for (const t of TROPHIES) { c[t.category] = c[t.category] || [0, 0]; c[t.category][1]++; if (earned.has(t.id)) c[t.category][0]++; }
  $('catStats').innerHTML = '<h3>By category</h3>' + Object.entries(c).sort((a, b) => b[1][1] - a[1][1]).map(([k, v]) => `<div class="ministats"><div><span>${k}</span><span>${v[0]} / ${v[1]}</span></div></div>`).join('');
  const review = TROPHIES.filter(t => t.audit === 'REVIEW');
  $('auditPanel').innerHTML = `<p><strong>55 audited · 50 PASS · 5 REVIEW · 0 MISSING.</strong> A guide passes only when its description, interpretation, strategy, steps, source and risk are all present and specific. REVIEW guides (#38, #47, #48, #49, #50) have vague official descriptions — their objectives are unverified and their guides say so instead of guessing.</p><p>${review.map(t => `#${t.id} ${esc(t.name)} — ${esc(t.description)}`).join('<br>')}</p>`;
  $('backupLine').textContent = DEMO ? 'Demo progress — not saved to this browser. Export to keep a copy.' : `Last saved: ${new Date().toLocaleString()} · ${earned.size} earned · ${Object.keys(journal).length} journal note(s) · stored locally (localStorage, key ${KEY}).`;
  const jl = $('journalList');
  jl.replaceChildren();
  const entries = Object.entries(journal);
  if (!entries.length) jl.innerHTML = '<li>No journal notes yet. Demo notes: #17 — gold the easy range challenges first; #31 — log each WAiNK location as you go.</li>';
  for (const [id, note] of entries) { const li = document.createElement('li'); li.innerHTML = `<strong>#${id} ${esc(byId.get(Number(id))?.name ?? '')}:</strong> ${esc(note)}`; jl.append(li); }
}
function exportProgress() {
  const data = { app: 'LEONIDA v9', version: 1, exportedAt: new Date().toISOString(), demo: DEMO, earned: [...earned].sort((a, b) => a - b), journal };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-progress.json'; a.click(); URL.revokeObjectURL(a.href);
}
async function importProgress(file, msgEl) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object' || !Array.isArray(data.earned)) throw new Error('file must be a JSON object with an "earned" array');
    const ids = data.earned.map(Number);
    if (ids.some(n => !Number.isInteger(n) || !byId.has(n))) throw new Error('earned contains an unknown trophy id (must be 1–55)');
    if (new Set(ids).size !== ids.length) throw new Error('earned contains duplicates');
    if (data.journal !== undefined && (typeof data.journal !== 'object' || Array.isArray(data.journal))) throw new Error('journal must be an object');
    earned = new Set(ids);
    if (data.journal) journal = data.journal;
    save(); renderAll();
    msgEl.textContent = `Imported ${ids.length} earned trophies. Existing progress was replaced only after the file passed validation.`; msgEl.className = 'msg ok';
  } catch (e) {
    msgEl.textContent = `Import rejected: ${e.message}. Your existing progress was not changed.`; msgEl.className = 'msg err';
  }
}
function showView() {
  for (const v of ['command', 'guide', 'roadmap', 'toolkit']) $('view-' + v).hidden = v !== view;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  $('controls').hidden = view === 'roadmap' || view === 'toolkit'; // search/filters belong to the trophy lists
}
function renderAll() {
  renderProgress(); renderList();
  $('detail').innerHTML = detailHTML(byId.get(selectedId), 'compact');
  $('guideDetail').innerHTML = detailHTML(byId.get(selectedId), 'full');
  renderNext(); renderMini(); renderRoadmap(); renderToolkit();
  showView();
}
{ // init: categories, tabs, buttons
  const cats = [...new Set(TROPHIES.map(t => t.category))].sort();
  for (const c of cats) { const o = document.createElement('option'); o.value = c; o.textContent = c; $('category').append(o); }
  document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => { view = b.dataset.view; renderAll(); }));
  for (const id of ['search', 'grade', 'category', 'risk', 'status']) $(id).addEventListener('input', renderList);
  $('exportBtn').addEventListener('click', exportProgress);
  $('exportBtn2').addEventListener('click', exportProgress);
  $('importFile').addEventListener('change', e => e.target.files[0] && importProgress(e.target.files[0], $('importMsg')));
  $('importFile2').addEventListener('change', e => e.target.files[0] && importProgress(e.target.files[0], $('importMsg2')));
  $('shareBtn').addEventListener('click', async () => {
    const txt = `LEONIDA — GTA VI trophies: ${earned.size}/55 earned (${Math.round(earned.size / 55 * 100)}%). Platinum: ${earned.has(1) ? 'earned' : 'not yet'}. Next: ${byId.get([2, 3, 4, 5, 6, 7].find(id => !earned.has(id)) ?? 14)?.name ?? 'done'}. Fan-made guide.`;
    try { await navigator.clipboard.writeText(txt); $('shareOut').textContent = 'Progress summary copied to clipboard.'; $('shareOut').className = 'msg ok'; }
    catch { $('shareOut').textContent = txt; $('shareOut').className = 'msg'; }
  });
  $('resetBtn').addEventListener('click', () => { if (confirm('Reset all progress and journal notes? This cannot be undone.')) { earned = new Set(); journal = {}; save(); renderAll(); } });
  $('journalSave').addEventListener('click', () => {
    const v = $('journalText').value.trim();
    if (!v) return;
    journal[selectedId] = v; $('journalText').value = ''; save(); renderAll();
  });
}
renderAll();
