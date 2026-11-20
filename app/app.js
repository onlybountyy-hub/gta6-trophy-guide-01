// Leonida Legend — GTA VI trophy guide & tracker.
// Single-page app: loads app/data/trophies.json, renders the checklist, the
// roadmap and the detail panel, and keeps earned progress in localStorage.

const DATA_URL = 'data/trophies.json';
const STORAGE_KEY = 'leonida-legend-progress-v8';
const GRADE_ORDER = { bronze: 0, silver: 1, gold: 2, platinum: 3 };
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const GRADE_ICON = { platinum: '◆', gold: '●', silver: '●', bronze: '●' };
const CATEGORY_LABEL = {
  story: 'Story', mission: 'Mission', activity: 'Activity', collectible: 'Collectible',
  challenge: 'Challenge', crime: 'Crime', completion: 'Completion',
};
const ROADMAP_PHASES = [
  {
    title: 'Phase 1 — Play the story',
    text: 'Finish the campaign first. Chapters, named missions and the vague story moments all land here, and nothing in this phase can be missed.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 47, 48, 49, 50],
  },
  {
    title: 'Phase 2 — Side characters, strangers & the map',
    text: 'Finish every side-character strand and the stranger strands, then sweep the map: meditation spots, cards, WAiNK, vehicles, areas, garages and the Scooter Bros app.',
    ids: [22, 23, 24, 25, 26, 27, 29, 28, 30, 31, 35, 42, 54, 55],
  },
  {
    title: 'Phase 3 — Activities & challenges',
    text: 'Races, drone races, fishing, bowling, the arcade, stunts, the shooting range and the challenge list. Do the fun ones first; the grinds last.',
    ids: [15, 16, 17, 18, 19, 20, 21, 32, 36, 37, 38, 44, 45, 46, 51],
  },
  {
    title: 'Phase 4 — Crime & the 100% cleanup',
    text: 'Partner robberies, vaults, trucks, jewelry, gangs, laundering and spending — then push the 100% checklist to the end for A Long Road and the platinum.',
    ids: [33, 34, 39, 40, 41, 43, 52, 53, 14, 1],
  },
];

let trophies = [];
let earned = new Set();
const filters = { q: '', grade: 'all', status: 'all', category: 'all', sort: 'list', spoilers: true };

const $ = (id) => document.getElementById(id);

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatNumber(n) {
  return n.toLocaleString('en-US');
}

async function loadTrophies() {
  const response = await fetch(DATA_URL);
  const data = await response.json();
  trophies = data.trophies;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    earned = new Set((ids || []).filter((id) => trophies.some((t) => t.id === id)));
  } catch {
    earned = new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ app: 'leonida-legend', earned: [...earned].sort((a, b) => a - b) }));
}

function isMasked(trophy) {
  return trophy.hidden && !earned.has(trophy.id) && filters.spoilers;
}

function rarityRank(trophy) {
  return GRADE_ORDER[trophy.grade] * 1000 + trophy.gamerscore;
}

function applyFilters() {
  const q = filters.q.trim().toLowerCase();
  let list = trophies.filter((t) => {
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !earned.has(t.id)) return false;
    if (filters.status === 'remaining' && earned.has(t.id)) return false;
    if (filters.category === 'missable' && !t.missable) return false;
    if (filters.category !== 'all' && filters.category !== 'missable' && t.category !== filters.category) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.hint.toLowerCase().includes(q))) return false;
    return true;
  });
  if (filters.sort === 'grade') list.sort((a, b) => GRADE_ORDER[b.grade] - GRADE_ORDER[a.grade] || a.id - b.id);
  else if (filters.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else if (filters.sort === 'rarity') list.sort((a, b) => rarityRank(b) - rarityRank(a) || a.id - b.id);
  else list.sort((a, b) => a.id - b.id);
  return list;
}

function renderHeroStats() {
  const total = trophies.length;
  const got = earned.size;
  const gsEarned = trophies.filter((t) => earned.has(t.id)).reduce((s, t) => s + t.gamerscore, 0);
  const psnEarned = trophies.filter((t) => earned.has(t.id)).reduce((s, t) => s + t.psn, 0);
  const pct = total ? Math.round((got / total) * 100) : 0;
  $('ringPct').textContent = pct + '%';
  $('ringCount').textContent = got + ' / ' + total;
  $('ringFill').style.strokeDashoffset = String(527.8 * (1 - got / total));
  $('heroStats').innerHTML =
    '<div class="stat-chip"><b>' + got + ' / ' + total + '</b><span>Trophies earned</span></div>' +
    '<div class="stat-chip"><b>' + formatNumber(gsEarned) + ' / 1,000G</b><span>Gamerscore</span></div>' +
    '<div class="stat-chip"><b>' + formatNumber(psnEarned) + ' / 1,350</b><span>PSN points</span></div>' +
    '<div class="stat-chip"><b>' + trophies.filter((t) => t.missable).length + '</b><span>Possibly missable</span></div>';
}

function renderProgressBars() {
  $('progressBars').innerHTML = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const total = trophies.filter((t) => t.grade === grade).length;
    const got = trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
    const pct = total ? Math.round((got / total) * 100) : 0;
    return '<div class="grade-bar"><div class="grade-bar-top"><span>' + GRADE_LABEL[grade] + '</span><span>' +
      got + ' / ' + total + ' · ' + pct + '%</span></div>' +
      '<div class="grade-bar-track"><div class="grade-bar-fill fill-' + grade + '" style="width:' + pct + '%"></div></div></div>';
  }).join('');
}

function renderNextUp() {
  const easiest = trophies
    .filter((t) => !earned.has(t.id))
    .sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.gamerscore - b.gamerscore || a.id - b.id)
    .slice(0, 5);
  if (!easiest.length) {
    $('nextUpList').innerHTML = '<p class="nextup-empty">All 55 earned — you are a Leonida Legend. Time to enjoy the platinum.</p>';
    return;
  }
  $('nextUpList').innerHTML = easiest.map((t, i) => {
    const label = isMasked(t) ? 'Hidden trophy' : escapeHtml(t.name);
    return '<button type="button" class="nextup-card" data-open="' + t.id + '">' +
      '<span class="nextup-rank">' + (i + 1) + '</span>' +
      '<span><span class="nextup-name">' + label + '</span>' +
      '<span class="nextup-meta">' + GRADE_LABEL[t.grade] + ' · ' + t.gamerscore + 'G · ' + escapeHtml(CATEGORY_LABEL[t.category] || t.category) + '</span></span>' +
      '</button>';
  }).join('');
}

function renderCards() {
  const list = applyFilters();
  $('resultCount').textContent = 'Showing ' + list.length + ' of ' + trophies.length + ' trophies';
  $('emptyNote').hidden = list.length > 0;
  $('cardGrid').innerHTML = list.map((t) => {
    const masked = isMasked(t);
    const name = masked ? 'Hidden Trophy' : escapeHtml(t.name);
    const desc = masked ? 'Hidden on PlayStation until earned — switch spoilers off to reveal it.' : escapeHtml(t.description);
    const hint = masked ? '' : '<p class="card-hint"><b>How to:</b> ' + escapeHtml(t.hint) + '</p>';
    return '<article class="card card-grade-' + t.grade + (earned.has(t.id) ? ' earned' : '') + (masked ? ' hidden-masked' : '') + '" data-open="' + t.id + '" tabindex="0" role="button" aria-label="' + (masked ? 'Hidden trophy' : escapeHtml(t.name)) + '">' +
      '<div class="card-top">' +
      '<span class="grade-badge badge-' + t.grade + '">' + GRADE_ICON[t.grade] + ' ' + GRADE_LABEL[t.grade] + '</span>' +
      '<span class="points-chip">' + t.gamerscore + 'G · ' + t.psn + ' pts</span>' +
      '<span class="cat-tag">' + escapeHtml(CATEGORY_LABEL[t.category] || t.category) + '</span>' +
      (t.missable ? '<span class="missable-flag">Possibly missable</span>' : '') +
      (masked ? '<span class="hidden-lock">Hidden</span>' : '') +
      '</div>' +
      '<h3 class="card-name">' + name + '</h3>' +
      '<p class="card-desc">' + desc + '</p>' +
      hint +
      '<div class="card-foot">' +
      '<label class="earn-check"><input type="checkbox" data-earn="' + t.id + '"' + (earned.has(t.id) ? ' checked' : '') + '> Earned</label>' +
      '<span class="card-more">Guide &amp; sources →</span>' +
      '</div></article>';
  }).join('');
}

function renderRoadmap() {
  $('timeline').innerHTML = ROADMAP_PHASES.map((phase, i) => {
    const done = phase.ids.filter((id) => earned.has(id)).length;
    const chips = phase.ids.map((id) => {
      const t = trophies.find((x) => x.id === id);
      if (!t) return '';
      const label = isMasked(t) ? 'Hidden trophy' : escapeHtml(t.name);
      return '<button type="button" class="phase-chip' + (earned.has(id) ? ' done' : '') + '" data-open="' + id + '">' + label + '</button>';
    }).join('');
    return '<li class="phase"><span class="phase-num">' + (i + 1) + '</span>' +
      '<h3>' + escapeHtml(phase.title) + '</h3>' +
      '<span class="phase-count">' + done + ' / ' + phase.ids.length + ' earned</span>' +
      '<p>' + escapeHtml(phase.text) + '</p>' +
      '<div class="phase-trophies">' + chips + '</div></li>';
  }).join('');
}

function renderAll() {
  renderHeroStats();
  renderProgressBars();
  renderNextUp();
  renderCards();
  renderRoadmap();
}

function openDetail(id) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  const masked = isMasked(t);
  const name = masked ? 'Hidden Trophy' : escapeHtml(t.name);
  const desc = masked ? 'This trophy is hidden on PlayStation until earned. Switch spoilers off to reveal its name and guide.' : escapeHtml(t.description);
  const steps = masked
    ? '<p class="guide-text">Earn this trophy, or switch the spoiler setting off, to see its guide.</p>'
    : '<ol class="steps">' + t.steps.map((s) => '<li>' + escapeHtml(s) + '</li>').join('') + '</ol>';
  const guide = masked ? '' : '<h4>The guide</h4><p class="guide-text">' + escapeHtml(t.guide) + '</p>';
  const sources = masked ? '' : '<h4>Sources</h4><ul class="detail-sources">' + t.sources.map((s) => '<li>' + escapeHtml(s) + '</li>').join('') + '</ul>';
  const missable = t.missable && !masked
    ? '<div class="missable-box"><b>Possibly missable.</b> GTABase and PowerPyx both flag this as the only trophy that may be missable. Clear the meditation spots as you find them, and keep a manual save before big story beats.</div>'
    : '';
  $('detailBody').innerHTML =
    '<div class="card-top">' +
    '<span class="grade-badge badge-' + t.grade + '">' + GRADE_ICON[t.grade] + ' ' + GRADE_LABEL[t.grade] + '</span>' +
    '<span class="points-chip">' + t.gamerscore + 'G · ' + t.psn + ' pts</span>' +
    '<span class="cat-tag">' + escapeHtml(CATEGORY_LABEL[t.category] || t.category) + '</span>' +
    (t.missable ? '<span class="missable-flag">Possibly missable</span>' : '') +
    '</div>' +
    '<h3 class="card-name" id="detailName">' + name + '</h3>' +
    '<p class="card-desc">' + desc + '</p>' +
    '<div class="detail-meta">' + (t.target ? '<span class="points-chip">PSN target: ' + formatNumber(t.target) + '</span>' : '') + '</div>' +
    guide +
    '<h4>Steps</h4>' + steps +
    sources + missable +
    '<button type="button" class="btn detail-earn' + (earned.has(t.id) ? ' earned' : '') + '" id="detailEarnBtn">' +
    (earned.has(t.id) ? '✓ Earned — tap to unmark' : 'Mark as earned') + '</button>';
  $('detailPanel').hidden = false;
  document.body.style.overflow = 'hidden';
  $('detailEarnBtn').addEventListener('click', () => {
    toggleEarned(t.id);
    openDetail(id);
  });
  syncUrlParams(id);
}

function closeDetail() {
  $('detailPanel').hidden = true;
  document.body.style.overflow = '';
  syncUrlParams(null);
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveProgress();
  renderAll();
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 3200);
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ app: 'leonida-legend', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Progress exported — ' + earned.size + ' of ' + trophies.length + ' trophies.');
}

function importProgressFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      const valid = ids.filter((id) => trophies.some((t) => t.id === id));
      earned = new Set(valid);
      saveProgress();
      renderAll();
      showToast('Progress imported — ' + valid.length + ' trophies earned.');
    } catch {
      showToast('That file is not a Leonida Legend progress export.');
    }
  };
  reader.readAsText(file);
}

function shareProgressSummary() {
  const total = trophies.length;
  const got = earned.size;
  const gs = trophies.filter((t) => earned.has(t.id)).reduce((s, t) => s + t.gamerscore, 0);
  const pct = total ? Math.round((got / total) * 100) : 0;
  const next = trophies.filter((t) => !earned.has(t.id))
    .sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.gamerscore - b.gamerscore)[0];
  const text = 'LEONIDA LEGEND — my GTA VI platinum run: ' + got + '/' + total + ' trophies (' + pct + '%), ' +
    formatNumber(gs) + '/1,000G' + (next ? '. Next up: ' + next.name + '.' : ' Platinum earned!');
  const done = () => showToast('Progress summary copied to the clipboard.');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => showToast(text));
  } else {
    showToast(text);
  }
}

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('grade') && ['all', 'platinum', 'gold', 'silver', 'bronze'].includes(params.get('grade'))) filters.grade = params.get('grade');
  if (params.get('status') && ['all', 'earned', 'remaining'].includes(params.get('status'))) filters.status = params.get('status');
  if (params.get('q')) filters.q = params.get('q');
  if (params.get('cat')) filters.category = params.get('cat');
  if (params.get('sort') && ['list', 'grade', 'name', 'rarity'].includes(params.get('sort'))) filters.sort = params.get('sort');
  if (params.get('spoilers') === '1') filters.spoilers = false;
  if (params.get('spoilers') === '0') filters.spoilers = true;
  return params.get('open') ? Number(params.get('open')) : null;
}

function syncUrlParams(openId) {
  const params = new URLSearchParams();
  if (filters.grade !== 'all') params.set('grade', filters.grade);
  if (filters.status !== 'all') params.set('status', filters.status);
  if (filters.q) params.set('q', filters.q);
  if (filters.category !== 'all') params.set('cat', filters.category);
  if (filters.sort !== 'list') params.set('sort', filters.sort);
  if (!filters.spoilers) params.set('spoilers', '1');
  if (openId) params.set('open', String(openId));
  const query = params.toString();
  window.history.replaceState(null, '', query ? '?' + query : window.location.pathname);
}

function bindControls() {
  $('searchInput').addEventListener('input', (e) => { filters.q = e.target.value; renderCards(); syncUrlParams(null); });
  $('gradeChips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-grade]');
    if (!btn) return;
    filters.grade = btn.dataset.grade;
    document.querySelectorAll('#gradeChips .chip').forEach((c) => c.classList.toggle('active', c === btn));
    renderCards();
    syncUrlParams(null);
  });
  $('statusSelect').addEventListener('change', (e) => { filters.status = e.target.value; renderCards(); syncUrlParams(null); });
  $('categorySelect').addEventListener('change', (e) => { filters.category = e.target.value; renderCards(); syncUrlParams(null); });
  $('sortSelect').addEventListener('change', (e) => { filters.sort = e.target.value; renderCards(); syncUrlParams(null); });
  $('spoilerToggle').addEventListener('change', (e) => { filters.spoilers = e.target.checked; renderAll(); syncUrlParams(null); });
  $('exportBtn').addEventListener('click', exportProgress);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgressFile(e.target.files[0]); e.target.value = ''; });
  $('shareBtn').addEventListener('click', shareProgressSummary);
  $('resetBtn').addEventListener('click', () => {
    if (window.confirm('Reset all progress? This clears every earned trophy.')) {
      earned = new Set();
      saveProgress();
      renderAll();
      showToast('Progress reset.');
    }
  });
  $('detailClose').addEventListener('click', closeDetail);
  $('detailBackdrop').addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('detailPanel').hidden) closeDetail(); });
  document.addEventListener('change', (e) => {
    const box = e.target.closest('[data-earn]');
    if (box) toggleEarned(Number(box.dataset.earn));
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('.earn-check')) return;
    const opener = e.target.closest('[data-open]');
    if (opener) openDetail(Number(opener.dataset.open));
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card[data-open]')) {
      e.preventDefault();
      openDetail(Number(e.target.dataset.open));
    }
  });
}

function applyParamsToControls() {
  $('searchInput').value = filters.q;
  document.querySelectorAll('#gradeChips .chip').forEach((c) => c.classList.toggle('active', c.dataset.grade === filters.grade));
  $('statusSelect').value = filters.status;
  $('categorySelect').value = filters.category;
  $('sortSelect').value = filters.sort;
  $('spoilerToggle').checked = filters.spoilers;
}

async function bootGuide() {
  await loadTrophies();
  loadProgress();
  const openId = readUrlParams();
  applyParamsToControls();
  bindControls();
  renderAll();
  if (openId && trophies.some((t) => t.id === openId)) openDetail(openId);
}

bootGuide();
