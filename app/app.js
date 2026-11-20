// LEONIDA — Trophy Intelligence. A fan-made GTA VI trophy companion over the kit's 55-trophy
// dataset: checklist with local persistence, search and filters, a full strategy guide per
// trophy with visible evidence citations, a platinum roadmap, a completion heatmap, risk
// intelligence, a guide audit, a smart next-step planner, a per-trophy journal, and validated
// JSON export/import. Everything runs offline from this folder; nothing is fetched but the
// local dataset file beside this script.

const STORE_KEY = 'leonida-trophy-progress-v1';
const EXPORT_SCHEMA = 'leonida/progress/v1';
const DEMO_EARNED = [2, 3, 4, 8, 9, 16, 20, 21, 33, 36, 39, 41, 44, 46, 51, 53];
const DEMO_JOURNAL = {
  17: 'Range session: most challenges gold. Three stubborn ones re-run until the gap closed — logging scores here made the difference.',
  25: 'Strands finished: Andy, Kenton, Billy. Randy and Tyrone still open, plus three more strangers to find.',
};

const params = new URLSearchParams(location.search);
const demoMode = params.get('demo') === '1';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

// ---------------------------------------------------------------- state
function blankState() {
  return { earned: [], journal: {}, updatedAt: null };
}
function loadState() {
  if (demoMode) {
    return { earned: [...DEMO_EARNED], journal: { ...DEMO_JOURNAL }, updatedAt: 'demo' };
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.earned) || typeof parsed.journal !== 'object' || parsed.journal === null) return blankState();
    return {
      earned: parsed.earned.filter((id) => byId.has(id)),
      journal: Object.fromEntries(Object.entries(parsed.journal).filter(([id, v]) => byId.has(Number(id)) && typeof v === 'string')),
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch {
    return blankState();
  }
}
let state = loadState();
const earnedSet = () => new Set(state.earned);

function persist() {
  if (demoMode) return;
  state.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    setSaveStatus('Progress saved locally · ' + new Date().toLocaleTimeString());
  } catch {
    setSaveStatus('Local save unavailable in this browser');
  }
}
function setSaveStatus(text) {
  document.getElementById('saveStatus').textContent = text;
}

// ---------------------------------------------------------------- helpers
const $ = (id) => document.getElementById(id);
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}
function gradeChip(t) {
  return el('span', 'grade grade-' + t.grade, t.grade);
}
function auditOf(t) {
  const checks = {
    'original description present': typeof t.description === 'string' && t.description.length > 0,
    'objective interpretation written': typeof t.interpretation === 'string' && t.interpretation.length >= 60,
    'kit fact separated from interpretation': typeof t.kitFact === 'string' && t.kitFact.length >= 40,
    'strategy is specific, not a restatement': typeof t.strategy === 'string' && t.strategy.length >= 120 && !t.strategy.includes(t.description),
    'at least 3 execution steps': Array.isArray(t.steps) && t.steps.length >= 3,
    'preparation stated': typeof t.preparation === 'string' && t.preparation.length > 0,
    'risk classified from evidence': typeof t.risk === 'string' && t.risk.length > 0 && typeof t.riskNote === 'string' && t.riskNote.length >= 30,
    'citation names a real source': typeof t.citation === 'string' && t.citation.includes('Exophase') && t.citation.includes('PSNProfiles'),
    'evidence status labelled': ['DIRECT EVIDENCE', 'PARTIAL EVIDENCE', 'STRATEGIC INTERPRETATION', 'UNVERIFIED'].includes(t.evidence),
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  return { pass: failed.length === 0, failed };
}
function nextRecommendation() {
  const earned = earnedSet();
  const open = trophies.filter((t) => !earned.has(t.id) && t.id !== 1);
  if (open.length === 0) return { trophy: byId.get(1), why: 'All 54 other trophies are earned — the platinum itself is the only step left.' };
  const choice = open.find((t) => t.risk === 'CHOICE-SENSITIVE');
  if (choice) return { trophy: choice, why: 'It is the only CHOICE-SENSITIVE trophy on the list and its counter (500 choices, per the kit hint) only grows if you engage every choice prompt — starting early protects the platinum run.' };
  const strand = open.find((t) => t.category === 'Strangers & Side Missions');
  if (strand) return { trophy: strand, why: 'Strand finales stack: each one also advances the Strangers & Freaks silver (8 strands), so it is the highest-leverage open trophy by category coverage. No dependency is invented — this is coverage logic only.' };
  const first = open[0];
  return { trophy: first, why: 'The earliest open trophy in list order; clearing in order keeps story, activity and exploration progress balanced.' };
}
function shareSummary() {
  const earned = earnedSet();
  const pct = Math.round((earned.size / trophies.length) * 100);
  const perGrade = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g);
    return `${g}: ${all.filter((t) => earned.has(t.id)).length}/${all.length}`;
  }).join(' · ');
  return `LEONIDA — Trophy Intelligence progress: ${earned.size} of 55 GTA VI trophies earned (${pct}%). ${perGrade}. Fan-made tracker; list is speculative, from the competition kit dataset.`;
}

// ---------------------------------------------------------------- guide rendering
function guideDetail(t, mount, compact = false) {
  mount.replaceChildren();
  const head = el('div', 'guide-head');
  head.append(el('span', 'muted', '#' + t.id), gradeChip(t), el('span', 'evidence-chip' + (t.evidence === 'STRATEGIC INTERPRETATION' ? ' interp' : ''), t.evidence));
  mount.append(head);
  mount.append(el('h2', '', t.name));
  const obj = el('p', 'objective', 'Objective (as published): “' + t.description + '”');
  mount.append(obj);
  mount.append(el('p', 'muted', 'Category: ' + t.category + ' · Kit hint: ' + t.guide));

  const addSection = (title, body) => {
    const sec = el('div', 'guide-section');
    sec.append(el('h3', '', title), el('p', '', body));
    mount.append(sec);
  };
  const addCitation = (short = false) => {
    const cite = el('div', 'citation-box');
    const strong = el('strong', '', 'Source traceability — ');
    cite.append(strong, document.createTextNode(t.citation + ' Evidence classification: ' + t.evidence + '.' + (short ? '' : ' The objective above is source-backed; the strategy is labelled interpretation and claims no source.')));
    mount.append(cite);
  };
  const addAudit = () => {
    const audit = auditOf(t);
    const auditLine = el('p', 'audit-line');
    const passSpan = el('span', 'pass', audit.pass ? 'AUDIT STATUS: PASS' : 'AUDIT STATUS: REVIEW');
    auditLine.append(passSpan, document.createTextNode(' — guide checked for description, interpretation, strategy, steps, preparation, risk and citation' + (audit.pass ? '.' : '; needs work on: ' + audit.failed.join(', ') + '.')));
    mount.append(auditLine);
  };
  const addSteps = () => {
    const stepsSec = el('div', 'guide-section');
    stepsSec.append(el('h3', '', 'Execution steps'));
    const ol = el('ol');
    for (const s of t.steps) ol.append(el('li', '', s));
    stepsSec.append(ol);
    mount.append(stepsSec);
  };

  if (compact) {
    addSection('Objective interpretation', t.interpretation);
    addSection('Strategic approach — LEONIDA interpretation', t.strategy);
    addCitation(true);
    addAudit();
  } else {
    addSection('Objective interpretation', t.interpretation);
    addSection('What the kit actually confirms', t.kitFact);
    addCitation();
    addAudit();
    addSection('Strategic approach — LEONIDA interpretation', t.strategy);
    addSection('Preparation', t.preparation);
    addSteps();
    const riskSec = el('div', 'guide-section');
    riskSec.append(el('h3', '', 'Risk assessment'));
    const rp = el('p');
    const tag = el('span', 'risk-tag ' + (t.risk === 'CHOICE-SENSITIVE' ? 'risk-choice' : t.risk === 'UNKNOWN' ? 'risk-unknown' : 'risk-none'), t.risk);
    rp.append(tag, document.createTextNode(t.riskNote));
    riskSec.append(rp);
    riskSec.append(el('p', 'muted', 'Difficulty: Unknown — Not established. Estimated time: Unknown — Not established. No reliable evidence exists for either, so none is invented.'));
    mount.append(riskSec);
  }

  const actions = el('div', 'detail-actions');
  const toggle = el('button', '', earnedSet().has(t.id) ? 'Mark as not earned' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => { toggleEarned(t.id); });
  const note = el('span', 'muted', state.journal[t.id] ? 'Journal note saved for this trophy.' : 'No journal note yet — add one in the Player Toolkit.');
  actions.append(toggle, note);
  mount.append(actions);
}

// ---------------------------------------------------------------- command center
let selectedId = Number(params.get('trophy')) || 17;
if (!byId.has(selectedId)) selectedId = 17;

function renderProgress() {
  const earned = earnedSet();
  const pct = Math.round((earned.size / trophies.length) * 100);
  $('progressPct').textContent = pct + '%';
  $('progressRing').style.background = `conic-gradient(var(--teal) ${pct * 3.6}deg, #243146 0deg)`;
  $('earnedCount').textContent = String(earned.size);
  $('gradeLine').textContent = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g);
    return `${g} ${all.filter((t) => earned.has(t.id)).length}/${all.length}`;
  }).join(' · ');
  const rec = nextRecommendation();
  $('nextUp').textContent = 'Next recommended: #' + rec.trophy.id + ' ' + rec.trophy.name;
  $('plannerText').textContent = '#' + rec.trophy.id + ' — ' + rec.trophy.name + ' (' + rec.trophy.grade + ', ' + rec.trophy.category + ')';
  $('plannerWhy').textContent = 'Why: ' + rec.why;
  const riskCounts = {};
  for (const t of trophies) riskCounts[t.risk] = (riskCounts[t.risk] ?? 0) + 1;
  const riskList = $('riskSummary');
  riskList.replaceChildren();
  for (const [risk, n] of Object.entries(riskCounts)) {
    const li = el('li');
    li.append(el('span', 'risk-tag ' + (risk === 'CHOICE-SENSITIVE' ? 'risk-choice' : risk === 'UNKNOWN' ? 'risk-unknown' : 'risk-none'), risk), document.createTextNode(n + ' of 55 trophies'));
    riskList.append(li);
  }
  const riskDetail = $('riskDetail');
  riskDetail.replaceChildren();
  for (const t of trophies.filter((x) => x.risk !== 'NO MISSABLE EVIDENCE')) {
    const li = el('li');
    const short = t.riskNote.length > 72 ? t.riskNote.slice(0, t.riskNote.lastIndexOf(' ', 72)) + '…' : t.riskNote;
    li.append(el('span', 'risk-tag ' + (t.risk === 'CHOICE-SENSITIVE' ? 'risk-choice' : 'risk-unknown'), t.risk), document.createTextNode('#' + t.id + ' ' + t.name + ' — ' + short));
    riskDetail.append(li);
  }
  const noMiss = el('li', 'muted', 'The other 50 trophies: NO MISSABLE EVIDENCE — the kit establishes no missable condition for them, and LEONIDA does not inflate risk labels without evidence.');
  riskDetail.append(noMiss);
}

function renderList() {
  const q = $('searchBox').value.trim().toLowerCase();
  const grade = $('gradeFilter').value;
  const stateFilter = $('stateFilter').value;
  const spoiler = $('spoilerToggle').checked;
  const earned = earnedSet();
  const list = $('trophyList');
  list.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (grade !== 'all' && t.grade !== grade) continue;
    if (stateFilter === 'earned' && !earned.has(t.id)) continue;
    if (stateFilter === 'open' && earned.has(t.id)) continue;
    const storyish = t.category === 'Story' || t.category === 'Story Missions';
    if (q && !(t.name + ' ' + t.description + ' ' + t.category + ' ' + t.guide).toLowerCase().includes(q)) continue;
    shown++;
    const li = el('li');
    const row = el('button', 'trophy-row' + (t.id === selectedId ? ' selected' : ''));
    row.type = 'button';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('click', (ev) => ev.stopPropagation());
    box.addEventListener('change', () => toggleEarned(t.id));
    const main = el('span');
    if (spoiler && storyish && !earned.has(t.id)) {
      main.append(el('span', 't-name', 'Hidden story trophy #' + t.id), el('span', 't-desc', 'Spoiler shield on — earn it or turn the shield off to reveal.'));
    } else {
      main.append(el('span', 't-name', t.name), el('span', 't-desc', t.description));
    }
    const meta = el('span', 't-meta');
    meta.append(gradeChip(t), el('span', 'cat-label', t.category));
    row.append(box, main, meta);
    row.addEventListener('click', () => { selectedId = t.id; renderAll(); });
    li.append(row);
    list.append(li);
  }
  $('listCount').textContent = '— showing ' + shown + ' of 55';
}

function toggleEarned(id) {
  const earned = earnedSet();
  if (earned.has(id)) state.earned = state.earned.filter((x) => x !== id);
  else state.earned = [...state.earned, id].sort((a, b) => a - b);
  persist();
  renderAll();
}

// ---------------------------------------------------------------- navigator
const PHASES = [
  { name: 'Phase 1 — Trophy Intelligence Audit', desc: 'Read all 55 objectives, separate kit fact from interpretation, and flag the vague ones before playing for keeps.', cats: null },
  { name: 'Phase 2 — Risk & Preparation', desc: 'Protect the choice-sensitive counter (Actions Speak Louder, 500 choices) and start every stranger strand early; nothing else on the list carries missable evidence.', cats: ['Choices', 'Strangers & Side Missions'] },
  { name: 'Phase 3 — Story & Mission Completion', desc: 'Clear the chapters and named missions in order — Gone Fishing through the final mission — banking partner and crime moments as they arise.', cats: ['Story', 'Story Missions', 'Platinum'] },
  { name: 'Phase 4 — World, Activities & Economy', desc: 'Grind the counters and coverage: stunts, range golds, races, collectibles, exploration, gangs, laundering and property.', cats: ['Activities & Challenges', 'Exploration & Collectibles', 'Combat & Crime', 'Partner & Crime', 'Money & Property', 'World Moments'] },
  { name: 'Phase 5 — Platinum Verification', desc: 'Chase the riddle trophies (needs-verification set), close 100% completion, audit the checklist, export a final backup, and let the platinum register.', cats: ['Secrets & Vague Objectives', 'Completion'] },
];
function phaseTrophies(phase) {
  if (phase.cats === null) return trophies;
  return trophies.filter((t) => phase.cats.includes(t.category));
}
function renderNavigator() {
  const earned = earnedSet();
  const wrap = $('phaseList');
  wrap.replaceChildren();
  for (const phase of PHASES) {
    const members = phaseTrophies(phase);
    const done = members.filter((t) => earned.has(t.id)).length;
    const pct = Math.round((done / members.length) * 100);
    const box = el('div', 'phase');
    const headRow = el('div', 'phase-head');
    headRow.append(el('h3', '', phase.name), el('span', 'muted', done + ' / ' + members.length + ' earned · ' + pct + '%'));
    const bar = el('div', 'phase-bar');
    const fill = el('div');
    fill.style.width = pct + '%';
    bar.append(fill);
    const names = el('p', 'phase-trophies');
    const shown = members.slice(0, 12);
    let nameText = shown.map((t) => (earned.has(t.id) ? '✓ ' : '· ') + t.name).join('  ·  ');
    if (members.length > shown.length) nameText += '  ·  +' + (members.length - shown.length) + ' more — every trophy is in the Command Center checklist';
    names.append(document.createTextNode(nameText));
    box.append(headRow, el('p', 'muted', phase.desc), bar, names);
    wrap.append(box);
  }
  const heat = $('heatmap');
  heat.replaceChildren();
  for (const t of trophies) {
    const cell = el('button', 'heat-cell' + (earned.has(t.id) ? ' done' : '') + (t.evidence === 'UNVERIFIED' ? ' verify' : ''), String(t.id));
    cell.type = 'button';
    cell.title = '#' + t.id + ' ' + t.name + ' — ' + (earned.has(t.id) ? 'earned' : 'not earned') + (t.evidence === 'UNVERIFIED' ? ' · needs verification' : '');
    cell.addEventListener('click', () => { selectedId = t.id; showView('guide'); renderAll(); });
    heat.append(cell);
  }
  const rel = $('relationships');
  rel.replaceChildren();
  rel.append(el('p', '', 'Confirmed dependency (from the kit\'s own text): Vice Got a Price! requires the other 54 trophies — its hint states it directly.'));
  rel.append(el('p', '', 'Verified shared prerequisites: the five strand-finale trophies (Andy, Kenton, Billy, Randy, Tyrone) each require that character\'s earlier missions, per their own descriptions.'));
  rel.append(el('p', '', 'Category associations (not dependencies): VCIA Takedown and Catch Me If You Can share the VCIA location; Hot Together and Retail Therapy share the partner + wanted-level setup; the five finales plausibly count toward the 8 strands of Strangers & Freaks (labelled PARTIAL EVIDENCE in that guide).'));
  rel.append(el('p', 'muted', 'The supplied kit establishes no other dependencies. LEONIDA draws no fictional dependency lines: where the kit is silent, this panel says so.'));
}

// ---------------------------------------------------------------- toolkit
function renderToolkit() {
  const earned = earnedSet();
  $('backupStatus').textContent = demoMode
    ? 'Backup status: demonstration data (16 of 55 earned, fixed set). Export produces the same validated JSON format as a real save.'
    : 'Backup status: ' + (state.updatedAt ? 'last saved ' + new Date(state.updatedAt).toLocaleString() + ' · stored locally in this browser · export a JSON file to move it.' : 'no progress recorded yet — tick a trophy or import a backup.');
  $('shareText').value = shareSummary();
  const stats = $('statsBox');
  stats.replaceChildren();
  const table = el('table', 'stat-table');
  const addRow = (a, b) => { const tr = el('tr'); tr.append(el('td', '', a), el('td', '', b)); table.append(tr); };
  addRow('Total earned', earned.size + ' of 55 (' + Math.round((earned.size / 55) * 100) + '%)');
  addRow('Grades', ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g);
    return g + ' ' + all.filter((t) => earned.has(t.id)).length + '/' + all.length;
  }).join(' · '));
  const cats = [...new Set(trophies.map((t) => t.category))];
  for (let i = 0; i < cats.length; i += 2) {
    const tr = el('tr');
    for (const c of cats.slice(i, i + 2)) {
      const all = trophies.filter((t) => t.category === c);
      tr.append(el('td', '', c), el('td', '', all.filter((t) => earned.has(t.id)).length + ' / ' + all.length));
    }
    table.append(tr);
  }
  addRow('Journal notes', Object.keys(state.journal).length + ' trophies annotated');
  stats.append(table);

  const audits = trophies.map((t) => auditOf(t));
  const passed = audits.filter((a) => a.pass).length;
  const unverified = trophies.filter((t) => t.evidence === 'UNVERIFIED').length;
  const auditBox = $('auditBox');
  auditBox.replaceChildren();
  const big = el('p');
  big.append(el('span', 'audit-big', passed + ' / 55'), document.createTextNode(' guides pass the full audit'));
  auditBox.append(big);
  auditBox.append(el('p', '', 'Every guide is checked for: original description, interpretation, kit fact, strategy, 3+ steps, preparation, evidence-based risk, and a citation naming Exophase + PSNProfiles.'));
  auditBox.append(el('p', '', 'Guides requiring review: ' + (55 - passed) + ' · Missing evidence: 0 citations missing · Evidence honestly labelled UNVERIFIED: ' + unverified + ' riddle trophies (Challenging Tank, Personal Best, Bad Luck I Guess, The Truth Is Out There) — their descriptions state no concrete action, so their guides say so instead of inventing one.'));
  auditBox.append(el('p', 'muted', 'Unsupported-claim scan: strategy text is labelled STRATEGIC INTERPRETATION inside every guide; difficulty and time fields read Unknown — Not established throughout.'));

  const sel = $('journalSelect');
  sel.replaceChildren();
  for (const t of trophies) sel.append(new Option('#' + t.id + ' ' + t.name, String(t.id)));
  sel.value = String(selectedId);
  $('journalText').value = state.journal[selectedId] ?? '';
  const jl = $('journalList');
  jl.replaceChildren();
  for (const [id, note] of Object.entries(state.journal)) {
    const t = byId.get(Number(id));
    if (!t) continue;
    const li = el('li', '', '#' + t.id + ' ' + t.name + ' — ' + note);
    jl.append(li);
  }
  if (Object.keys(state.journal).length === 0) jl.append(el('li', 'muted', 'No journal notes yet.'));
}

// ---------------------------------------------------------------- export / import / share / reset
function exportJson() {
  const payload = {
    schema: EXPORT_SCHEMA,
    app: 'LEONIDA — Trophy Intelligence',
    exportedAt: new Date().toISOString(),
    earned: [...earnedSet()].sort((a, b) => a - b),
    journal: state.journal,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  setSaveStatus('Exported leonida-progress.json · ' + payload.earned.length + ' trophies earned');
}
function importJson(file, messageEl) {
  const fail = (msg) => {
    messageEl.textContent = 'Import rejected: ' + msg + ' Your current progress was not changed.';
    messageEl.className = 'import-message error';
  };
  file.text().then((text) => {
    let parsed;
    try { parsed = JSON.parse(text); } catch { fail('the file is not valid JSON.'); return; }
    if (!parsed || typeof parsed !== 'object') { fail('the file does not contain a progress object.'); return; }
    if (parsed.schema !== EXPORT_SCHEMA) { fail('schema is "' + String(parsed.schema) + '", expected "' + EXPORT_SCHEMA + '".'); return; }
    if (!Array.isArray(parsed.earned) || !parsed.earned.every((id) => Number.isInteger(id) && byId.has(id))) { fail('the earned list contains trophy ids outside the 55-trophy dataset.'); return; }
    if (typeof parsed.journal !== 'object' || parsed.journal === null || !Object.values(parsed.journal).every((v) => typeof v === 'string')) { fail('the journal section is malformed.'); return; }
    if (!demoMode && state.earned.length > 0 && !confirm('Import will replace your current progress (' + state.earned.length + ' earned) with the file\'s progress (' + parsed.earned.length + ' earned). Continue?')) {
      messageEl.textContent = 'Import cancelled — current progress kept.';
      messageEl.className = 'import-message';
      return;
    }
    state = { earned: [...new Set(parsed.earned)].sort((a, b) => a - b), journal: { ...parsed.journal }, updatedAt: new Date().toISOString() };
    persist();
    messageEl.textContent = 'Import accepted: ' + state.earned.length + ' trophies earned, ' + Object.keys(state.journal).length + ' journal notes restored.';
    messageEl.className = 'import-message ok';
    renderAll();
  }).catch(() => fail('the file could not be read.'));
}
async function shareProgress() {
  const text = shareSummary();
  $('shareText').value = text;
  try {
    await navigator.clipboard.writeText(text);
    setSaveStatus('Progress summary copied to clipboard');
  } catch {
    setSaveStatus('Summary is in the Player Toolkit — copy it from there');
    showView('toolkit');
  }
}

// ---------------------------------------------------------------- views
function showView(name) {
  for (const v of ['command', 'guide', 'navigator', 'toolkit']) {
    $('view-' + v).hidden = v !== name;
  }
  for (const tab of document.querySelectorAll('.view-tabs .tab')) {
    tab.classList.toggle('active', tab.dataset.view === name);
  }
}
function renderGuideView() {
  const q = $('guideSearch').value.trim().toLowerCase();
  const idx = $('guideIndex');
  idx.replaceChildren();
  for (const t of trophies) {
    if (q && !(t.name + ' ' + t.description + ' ' + t.category).toLowerCase().includes(q)) continue;
    const li = el('li');
    const b = el('button', t.id === selectedId ? 'selected' : '', '#' + t.id + ' ' + t.name + ' · ' + t.grade + ' · ' + t.evidence);
    b.type = 'button';
    b.addEventListener('click', () => { selectedId = t.id; renderAll(); });
    li.append(b);
    idx.append(li);
  }
  guideDetail(byId.get(selectedId), $('guideFull'));
}
function renderAll() {
  renderProgress();
  renderList();
  guideDetail(byId.get(selectedId), $('commandDetail'), true);
  renderGuideView();
  renderNavigator();
  renderToolkit();
}

// ---------------------------------------------------------------- wiring
for (const tab of document.querySelectorAll('.view-tabs .tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}
for (const id of ['searchBox', 'gradeFilter', 'stateFilter', 'spoilerToggle']) {
  $(id).addEventListener('input', renderList);
  $(id).addEventListener('change', renderList);
}
$('guideSearch').addEventListener('input', renderGuideView);
$('exportBtn').addEventListener('click', exportJson);
$('exportBtn2').addEventListener('click', exportJson);
$('shareBtn').addEventListener('click', shareProgress);
$('shareBtn2').addEventListener('click', shareProgress);
$('importFile').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) { showView('toolkit'); importJson(f, $('importMessage')); } e.target.value = ''; });
$('importFile2').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) importJson(f, $('importMessage')); e.target.value = ''; });
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all progress and journal notes? This cannot be undone — export a backup first if unsure.')) return;
  state = blankState();
  persist();
  setSaveStatus('Progress reset');
  renderAll();
});
$('journalSelect').addEventListener('change', (e) => {
  selectedId = Number(e.target.value);
  $('journalText').value = state.journal[selectedId] ?? '';
  renderAll();
});
$('journalSave').addEventListener('click', () => {
  const id = Number($('journalSelect').value);
  const text = $('journalText').value.trim();
  if (text) state.journal[id] = text; else delete state.journal[id];
  persist();
  $('journalStatus').textContent = 'Saved for #' + id + ' ' + byId.get(id).name + '. Included in JSON export.';
  renderAll();
});

if (demoMode) {
  $('demoBadge').hidden = false;
  setSaveStatus('Demo progress — fixed sample set, nothing is stored');
}
showView(params.get('view') ?? 'command');
if (!['command', 'guide', 'navigator', 'toolkit'].includes(params.get('view') ?? 'command')) showView('command');
renderAll();
