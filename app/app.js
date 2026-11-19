/* Leonida Legend — tracker logic.
   Loads the official list from data/trophies.json, renders the checklist, keeps
   progress in localStorage, and wires the filters, sorts, spoiler shield, detail
   panel, roadmap, export/import and shareable URL state. No network beyond the
   app's own files: fetch() only ever asks for data/trophies.json beside this file. */

'use strict';

const STORAGE_KEY = 'leonida-legend-progress-v1';
const RING_CIRCUMFERENCE = 326.73; // 2 * pi * 52, the ring in index.html

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABELS = {
  story: 'Story',
  strands: 'Strangers & strands',
  collectibles: 'Collectibles',
  activities: 'Activities',
  world: 'Open world',
};

const ROADMAP = [
  {
    stage: 1,
    title: 'The opening & Chapter 1',
    text: 'Play the prologue (Gone Fishing) and Chapter 1, with Breakfast Run on the way, and stop for the cocktail on Ocean Beach. Before Chapter 1 ends, meditate at the spot at home: guides report it disappears afterwards, and it belongs to the one possibly-missable trophy, Positive Mental Attitude.',
  },
  {
    stage: 2,
    title: 'Chapters 2–3',
    text: 'Push through Chapters 2 and 3. The Cartel Heist lands inside Chapter 3, so the story bronzes keep pace with the chapters themselves.',
  },
  {
    stage: 3,
    title: 'Chapter 4 & the strands',
    text: 'Finish the Chapter 4 missions — Child\'s Play, Headliners, VCIA Takedown, Operation Savage Glory — and grab the unscheduled VCIA departure while you are at the airport. In parallel, clear the stranger strands as they open: the finals for Andy, Kenton, Billy, Randy and Tyrone, and Bret\'s hunt.',
  },
  {
    stage: 4,
    title: 'The finale',
    text: 'Complete the final mission for the story gold. Keep a manual save before it if you want the ending on file; everything from here is the open-world sweep.',
  },
  {
    stage: 5,
    title: 'The open-world sweep',
    text: 'Activities and collectibles: 250 stunts, gold at all 42 shooting ranges, the drone races and 20 race wins, card sets, 100 WAiNK stops, the remaining meditation spots, 100 vehicles, all 52 areas, 50 challenges — plus the arcade, the fishing challenge and a game of bowling.',
  },
  {
    stage: 6,
    title: 'Feats & fortune',
    text: 'The robbery ladder and the money trophies: bank vaults, the armored truck, the stealth jewelry job, one illegal operation per gang, the partner feats, $250,000 laundered, $100,000 spent, all 8 garages and 10 Scooter Bros registrations. The cryptic hidden bronzes (a second chance, a strange encounter, a Rhino, a partnership moment) tend to pop somewhere in this noise.',
  },
  {
    stage: 7,
    title: '100% & the Platinum',
    text: 'Close out the completion checklist for A Long Road — the tracker\'s bars show what is left — and Vice Got a Price!, the platinum, follows on its own.',
  },
];

const SOURCES = [
  {
    name: 'Exophase — Grand Theft Auto VI trophies (PS5)',
    url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
    note: 'The official list as PlayStation publishes it: every name, description and grade in this app.',
  },
  {
    name: 'PSNProfiles — Grand Theft Auto VI trophies',
    url: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
    note: 'Agrees with Exophase on every name, description and grade; the source of the progress counts PlayStation tracks (250 stunts, 42 ranges, 500 choices…).',
  },
  {
    name: 'PlanetGTA6 — GTA 6 trophies and achievements',
    url: 'https://www.planetgta6.com/en/gta-6-trophies/',
    note: 'The hidden/visible split (28 hidden, 27 visible) and the Gamerscore table, cross-checked against TrueAchievements; the Gamerscore column sums to exactly 1,000G.',
  },
  {
    name: 'GTABase — GTA VI trophy list (named, no link)',
    url: '',
    note: 'Chapter placements for the story missions and, with PowerPyx, the possibly-missable flag on Positive Mental Attitude.',
  },
  {
    name: 'PowerPyx — GTA VI trophy guide (named, no link)',
    url: '',
    note: 'The missable warning on Positive Mental Attitude and the note that 100% completion is more forgiving than it looks.',
  },
];

/* ---------------- state ---------------- */

let trophyData = [];
let progress = readProgress();
let filters = { q: '', grade: '', status: '', cat: '', sort: 'list' };
let openId = null;

function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: [], spoilers: false };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      spoilers: parsed.spoilers === true,
    };
  } catch {
    return { earned: [], spoilers: false };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function isEarned(trophy) {
  return progress.earned.includes(trophy.id);
}

function isMasked(trophy) {
  return trophy.hidden && !progress.spoilers && !isEarned(trophy);
}

/* ---------------- URL state ---------------- */

function stateFromUrl() {
  const params = new URLSearchParams(location.search);
  if (params.get('grade')) filters.grade = params.get('grade');
  if (params.get('status')) filters.status = params.get('status');
  if (params.get('q')) filters.q = params.get('q');
  if (params.get('cat')) filters.cat = params.get('cat');
  if (params.get('sort')) filters.sort = params.get('sort');
  if (params.get('spoilers') === '1') progress.spoilers = true;
  const open = Number(params.get('open'));
  if (Number.isInteger(open) && open >= 1) openId = open;
}

function syncUrl() {
  const params = new URLSearchParams();
  if (filters.grade) params.set('grade', filters.grade);
  if (filters.status) params.set('status', filters.status);
  if (filters.q) params.set('q', filters.q);
  if (filters.cat) params.set('cat', filters.cat);
  if (filters.sort !== 'list') params.set('sort', filters.sort);
  if (progress.spoilers) params.set('spoilers', '1');
  if (openId) params.set('open', String(openId));
  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

/* ---------------- progress summary ---------------- */

function completionTotals() {
  const earned = trophyData.filter(isEarned);
  return {
    earnedCount: earned.length,
    gamerscore: earned.reduce((sum, t) => sum + t.gamerscore, 0),
    psnPoints: earned.reduce((sum, t) => sum + t.psnPoints, 0),
    hiddenFound: earned.filter((t) => t.hidden).length,
  };
}

function gradeProgress(grade) {
  const all = trophyData.filter((t) => t.grade === grade);
  return { earned: all.filter(isEarned).length, total: all.length };
}

function renderProgress() {
  const totals = completionTotals();
  const percent = trophyData.length ? Math.round((totals.earnedCount / trophyData.length) * 100) : 0;
  document.getElementById('ring-count').textContent = `${totals.earnedCount}/${trophyData.length}`;
  document.getElementById('ring-percent').textContent = `${percent}%`;
  document.getElementById('ring-value').style.strokeDashoffset =
    String(RING_CIRCUMFERENCE * (1 - totals.earnedCount / Math.max(trophyData.length, 1)));
  document.getElementById('total-gamerscore').textContent = `${totals.gamerscore.toLocaleString('en-US')} / 1,000G`;
  document.getElementById('total-psn').textContent = `${totals.psnPoints.toLocaleString('en-US')} / 1,350`;
  document.getElementById('total-hidden').textContent = `${totals.hiddenFound} / 28`;

  const bars = document.getElementById('grade-bars');
  bars.textContent = '';
  for (const grade of Object.keys(GRADE_ORDER)) {
    const { earned, total } = gradeProgress(grade);
    const row = document.createElement('div');
    row.className = 'grade-bar';
    const label = document.createElement('span');
    label.textContent = GRADE_LABELS[grade];
    const bar = document.createElement('span');
    bar.className = 'bar';
    const fill = document.createElement('span');
    fill.className = `fill fill-${grade}`;
    fill.style.display = 'block';
    fill.style.width = total ? `${(earned / total) * 100}%` : '0%';
    bar.appendChild(fill);
    const count = document.createElement('span');
    count.textContent = `${earned}/${total}`;
    row.append(label, bar, count);
    bars.appendChild(row);
  }
}

/* ---------------- filtering & sorting ---------------- */

function visibleTrophies() {
  const q = filters.q.trim().toLowerCase();
  const list = trophyData.filter((t) => {
    if (filters.grade && t.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !isEarned(t)) return false;
    if (filters.status === 'remaining' && isEarned(t)) return false;
    if (filters.cat === 'missable' && !t.missable) return false;
    if (filters.cat && filters.cat !== 'missable' && t.kind !== filters.cat) return false;
    if (q) {
      const haystack = `${t.name} ${t.description} ${KIND_LABELS[t.kind]} ${t.guide}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
  if (filters.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  if (filters.sort === 'grade') list.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  if (filters.sort === 'rarity') {
    list.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || b.gamerscore - a.gamerscore || a.id - b.id);
  }
  return list;
}

/* ---------------- checklist rendering ---------------- */

function chip(text, className) {
  const el = document.createElement('span');
  el.className = `chip ${className || ''}`.trim();
  el.textContent = text;
  return el;
}

function trophyCard(trophy) {
  const masked = isMasked(trophy);
  const earned = isEarned(trophy);
  const card = document.createElement('article');
  card.className = `trophy-card grade-${trophy.grade}${earned ? ' earned' : ''}${masked ? ' masked' : ''}`;
  card.dataset.trophyId = String(trophy.id);

  const toggleWrap = document.createElement('label');
  toggleWrap.className = 'earn-toggle';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => toggleEarned(trophy.id, box.checked));
  toggleWrap.appendChild(box);

  const main = document.createElement('div');
  main.className = 'card-main';
  const titleRow = document.createElement('div');
  titleRow.className = 'card-title';
  const heading = document.createElement('h3');
  heading.textContent = masked ? `Hidden Trophy #${trophy.id}` : trophy.name;
  titleRow.appendChild(heading);
  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = masked ? 'Hidden until earned — reveal spoilers to peek.' : trophy.description;
  const meta = document.createElement('div');
  meta.className = 'card-meta';
  meta.appendChild(chip(GRADE_LABELS[trophy.grade], `grade-${trophy.grade}`));
  meta.appendChild(chip(KIND_LABELS[trophy.kind]));
  meta.appendChild(chip(`${trophy.gamerscore}G`));
  if (trophy.count) meta.appendChild(chip(`Target ${trophy.count.toLocaleString('en-US')}`));
  if (trophy.hidden) meta.appendChild(chip('Hidden', 'hidden-chip'));
  if (trophy.missable) meta.appendChild(chip('⚠ Possibly missable', 'missable'));
  if (earned) meta.appendChild(chip('✓ Earned', 'earned-chip'));
  main.append(titleRow, desc, meta);

  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'card-open';
  open.textContent = 'Guide →';
  open.addEventListener('click', (event) => {
    event.stopPropagation();
    openDetail(trophy.id);
  });

  card.append(toggleWrap, main, open);
  card.addEventListener('click', () => openDetail(trophy.id));
  return card;
}

function renderList() {
  const list = visibleTrophies();
  const host = document.getElementById('trophy-list');
  host.textContent = '';
  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No trophies match those filters. Loosen one and the list comes back.';
    host.appendChild(empty);
  } else {
    for (const trophy of list) host.appendChild(trophyCard(trophy));
  }
  document.getElementById('result-count').textContent =
    `Showing ${list.length} of ${trophyData.length} trophies` +
    (progress.spoilers ? ' · spoilers revealed' : ' · hidden trophies masked');
}

/* ---------------- detail panel ---------------- */

function openDetail(id) {
  const trophy = trophyData.find((t) => t.id === id);
  if (!trophy) return;
  openId = id;
  const panel = document.getElementById('detail-panel');
  const body = document.getElementById('detail-body');
  body.textContent = '';
  const masked = isMasked(trophy);

  const heading = document.createElement('h2');
  heading.textContent = masked ? `Hidden Trophy #${trophy.id}` : trophy.name;
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = masked ? 'This trophy is hidden on PlayStation until it is earned.' : `“${trophy.description}”`;
  body.append(heading, desc);

  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  meta.appendChild(chip(GRADE_LABELS[trophy.grade], `grade-${trophy.grade}`));
  meta.appendChild(chip(KIND_LABELS[trophy.kind]));
  meta.appendChild(chip(`${trophy.gamerscore} Gamerscore`));
  meta.appendChild(chip(`${trophy.psnPoints} PSN points`));
  meta.appendChild(chip(`Roadmap stage ${trophy.stage}`));
  if (trophy.count) meta.appendChild(chip(`PSN target ${trophy.count.toLocaleString('en-US')}`));
  if (trophy.hidden) meta.appendChild(chip('Hidden', 'hidden-chip'));
  if (trophy.missable) meta.appendChild(chip('⚠ Possibly missable', 'missable'));
  body.appendChild(meta);

  const guideBox = document.createElement('div');
  guideBox.className = 'detail-guide';
  const guideTitle = document.createElement('h3');
  guideTitle.textContent = 'Guide';
  const guideText = document.createElement('p');
  guideText.textContent = masked
    ? 'Spoilers are off, so this guide stays under wraps. Reveal spoilers above to read it — or earn the trophy and it unmasks itself.'
    : trophy.guide;
  guideBox.append(guideTitle, guideText);
  body.appendChild(guideBox);

  if (!masked) {
    const srcBox = document.createElement('div');
    srcBox.className = 'detail-sources';
    const srcTitle = document.createElement('h3');
    srcTitle.textContent = 'Sources';
    const srcText = document.createElement('p');
    srcText.textContent = trophy.sources;
    srcBox.append(srcTitle, srcText);
    body.appendChild(srcBox);
  }

  const earnRow = document.createElement('label');
  earnRow.className = 'detail-earn';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(trophy);
  box.addEventListener('change', () => toggleEarned(trophy.id, box.checked));
  earnRow.append(box, document.createTextNode('I have earned this trophy'));
  body.appendChild(earnRow);

  panel.hidden = false;
  document.getElementById('guide-layout').classList.add('with-detail');
  syncUrl();
}

function closeDetail() {
  openId = null;
  document.getElementById('detail-panel').hidden = true;
  document.getElementById('guide-layout').classList.remove('with-detail');
  syncUrl();
}

/* ---------------- progress changes ---------------- */

function toggleEarned(id, earned) {
  const set = new Set(progress.earned);
  if (earned) set.add(id); else set.delete(id);
  progress.earned = [...set].sort((a, b) => a - b);
  saveProgress();
  renderProgress();
  renderList();
  if (openId === id) openDetail(id);
}

function exportProgress() {
  const payload = JSON.stringify(
    { app: 'leonida-legend', version: 1, earned: progress.earned, spoilers: progress.spoilers },
    null,
    2,
  );
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  link.download = 'leonida-legend-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
  setToolsStatus(`Exported ${progress.earned.length} earned trophies.`);
}

function importProgress(file) {
  file.text().then((text) => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.earned)) throw new Error('no earned list');
      const valid = new Set(trophyData.map((t) => t.id));
      progress.earned = parsed.earned.filter((n) => valid.has(n));
      if (typeof parsed.spoilers === 'boolean') progress.spoilers = parsed.spoilers;
      saveProgress();
      applySpoilerToggle();
      renderProgress();
      renderList();
      setToolsStatus(`Imported ${progress.earned.length} earned trophies.`);
    } catch {
      setToolsStatus('That file is not a Leonida Legend progress export.');
    }
  });
}

function resetProgress() {
  if (!window.confirm('Reset all progress? Every checkmark will be cleared.')) return;
  progress = { earned: [], spoilers: false };
  saveProgress();
  applySpoilerToggle();
  renderProgress();
  renderList();
  if (openId) openDetail(openId);
  setToolsStatus('Progress reset.');
}

function setToolsStatus(message) {
  document.getElementById('tools-status').textContent = message;
}

/* ---------------- roadmap & sources ---------------- */

function renderRoadmap() {
  const host = document.getElementById('roadmap-steps');
  host.textContent = '';
  for (const step of ROADMAP) {
    const item = document.createElement('li');
    item.className = 'roadmap-step';
    const num = document.createElement('span');
    num.className = 'step-num';
    num.textContent = String(step.stage);
    const body = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = `Stage ${step.stage} — ${step.title}`;
    const text = document.createElement('p');
    text.textContent = step.text;
    const chips = document.createElement('div');
    chips.className = 'step-trophies';
    for (const trophy of trophyData.filter((t) => t.stage === step.stage)) {
      const c = chip(isMasked(trophy) ? `Hidden #${trophy.id}` : trophy.name, `grade-${trophy.grade}`);
      c.style.cursor = 'pointer';
      c.addEventListener('click', () => openDetail(trophy.id));
      chips.appendChild(c);
    }
    body.append(title, text, chips);
    item.append(num, body);
    host.appendChild(item);
  }
}

function renderSources() {
  const host = document.getElementById('source-list');
  host.textContent = '';
  for (const source of SOURCES) {
    const item = document.createElement('li');
    if (source.url) {
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.name;
      link.rel = 'noopener';
      item.appendChild(link);
    } else {
      const strong = document.createElement('strong');
      strong.textContent = source.name;
      item.appendChild(strong);
    }
    item.appendChild(document.createTextNode(` — ${source.note}`));
    host.appendChild(item);
  }
}

/* ---------------- toolbar wiring ---------------- */

function applySpoilerToggle() {
  const button = document.getElementById('spoiler-toggle');
  button.setAttribute('aria-pressed', String(progress.spoilers));
  button.textContent = progress.spoilers ? '🙈 Hide spoilers' : '👁 Reveal spoilers';
}

function bindToolbar() {
  const q = document.getElementById('filter-q');
  const grade = document.getElementById('filter-grade');
  const status = document.getElementById('filter-status');
  const cat = document.getElementById('filter-cat');
  const sort = document.getElementById('filter-sort');
  q.value = filters.q;
  grade.value = filters.grade;
  status.value = filters.status;
  cat.value = filters.cat;
  sort.value = filters.sort;

  q.addEventListener('input', () => { filters.q = q.value; renderList(); syncUrl(); });
  grade.addEventListener('change', () => { filters.grade = grade.value; renderList(); syncUrl(); });
  status.addEventListener('change', () => { filters.status = status.value; renderList(); syncUrl(); });
  cat.addEventListener('change', () => { filters.cat = cat.value; renderList(); syncUrl(); });
  sort.addEventListener('change', () => { filters.sort = sort.value; renderList(); syncUrl(); });

  document.getElementById('spoiler-toggle').addEventListener('click', () => {
    progress.spoilers = !progress.spoilers;
    saveProgress();
    applySpoilerToggle();
    renderList();
    renderRoadmap();
    if (openId) openDetail(openId);
    syncUrl();
  });

  document.getElementById('detail-close').addEventListener('click', closeDetail);
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  document.getElementById('import-file').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importProgress(file);
    event.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', resetProgress);
}

/* ---------------- boot ---------------- */

function loadTrophyData() {
  return fetch('data/trophies.json').then((response) => {
    if (!response.ok) throw new Error(`trophies.json: ${response.status}`);
    return response.json();
  });
}

function boot() {
  stateFromUrl();
  loadTrophyData()
    .then((data) => {
      trophyData = data.trophies;
      bindToolbar();
      applySpoilerToggle();
      renderProgress();
      renderList();
      renderRoadmap();
      renderSources();
      if (openId) openDetail(openId);
    })
    .catch((error) => {
      const host = document.getElementById('trophy-list');
      host.textContent = '';
      const p = document.createElement('p');
      p.className = 'empty-state';
      p.textContent = `The trophy list could not be loaded (${error.message}). Serve the app/ folder over HTTP — file:// blocks the data fetch.`;
      host.appendChild(p);
    });
}

boot();
