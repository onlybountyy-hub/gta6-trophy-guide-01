// Leonida Legend — tracker logic.
//
// Loads the trophy data, renders the checklist and the guide panel, and
// keeps progress in localStorage. Filters, search, sorts and the spoiler
// setting can all be set from the URL (grade, status, q, cat, sort,
// spoilers=1, open=<id>, view=roadmap) so any view is reproducible.

const EARNED_KEY = "leonidaLegend.earned.v1";
const SPOILERS_KEY = "leonidaLegend.spoilers.v1";
const RING_CIRCUMFERENCE = 213.6;

const GRADE_RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const GRADE_LABEL = { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" };
const KIND_LABEL = {
  story: "Story",
  side: "Side missions",
  collectibles: "Collectibles",
  activities: "Activities",
  crime: "Crime & heists",
  world: "World & money",
};

const state = {
  trophies: [],
  sources: [],
  earned: new Set(),
  spoilers: false,
  grade: "all",
  cat: "all",
  status: "all",
  q: "",
  sort: "list",
  selected: 1,
};

const $ = (selector) => document.querySelector(selector);

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function isMasked(trophy) {
  return trophy.hidden && !state.earned.has(trophy.id) && !state.spoilers;
}

function saveProgress() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...state.earned]));
  localStorage.setItem(SPOILERS_KEY, state.spoilers ? "1" : "0");
}

function loadProgress() {
  try {
    const ids = JSON.parse(localStorage.getItem(EARNED_KEY) ?? "[]");
    if (Array.isArray(ids)) {
      state.earned = new Set(ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55));
    }
  } catch {
    state.earned = new Set();
  }
  state.spoilers = localStorage.getItem(SPOILERS_KEY) === "1";
}

function applyParams() {
  const params = new URLSearchParams(location.search);
  const grade = params.get("grade");
  if (grade && (grade === "all" || grade in GRADE_RANK)) state.grade = grade;
  const status = params.get("status");
  if (status && ["all", "earned", "missing"].includes(status)) state.status = status;
  const cat = params.get("cat");
  if (cat && (cat === "all" || cat === "missable" || cat in KIND_LABEL)) state.cat = cat;
  const sort = params.get("sort");
  if (sort && ["list", "grade", "name", "rarity"].includes(sort)) state.sort = sort;
  if (params.get("q")) state.q = params.get("q");
  if (params.get("spoilers") === "1") state.spoilers = true;
  const open = Number(params.get("open"));
  if (Number.isInteger(open) && open >= 1 && open <= 55) state.selected = open;
  return params.get("view");
}

function syncControls() {
  $("#q").value = state.q;
  $("#status").value = state.status;
  $("#sort").value = state.sort;
  $("#spoilers").checked = state.spoilers;
  for (const chip of document.querySelectorAll("#grade-chips .chip")) {
    chip.classList.toggle("active", chip.dataset.grade === state.grade);
  }
  for (const chip of document.querySelectorAll("#cat-chips .chip")) {
    chip.classList.toggle("active", chip.dataset.cat === state.cat);
  }
}

function visibleTrophies() {
  const query = state.q.trim().toLowerCase();
  const list = state.trophies.filter((trophy) => {
    if (state.grade !== "all" && trophy.grade !== state.grade) return false;
    if (state.cat === "missable" && !trophy.missable) return false;
    if (state.cat !== "all" && state.cat !== "missable" && trophy.kind !== state.cat) return false;
    if (state.status === "earned" && !state.earned.has(trophy.id)) return false;
    if (state.status === "missing" && state.earned.has(trophy.id)) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${KIND_LABEL[trophy.kind]}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
  const byId = (a, b) => a.id - b.id;
  if (state.sort === "grade") {
    list.sort((a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade] || byId(a, b));
  } else if (state.sort === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sort === "rarity") {
    // Rarity = grade first, then Gamerscore. No earn-rate percentages
    // exist for this game yet, so none are used or shown.
    list.sort(
      (a, b) =>
        GRADE_RANK[a.grade] - GRADE_RANK[b.grade] ||
        b.gamerscore - a.gamerscore ||
        byId(a, b),
    );
  } else {
    list.sort(byId);
  }
  return list;
}

function flagsHtml(trophy) {
  let html = "";
  if (trophy.hidden) html += `<span class="hidden-flag">Hidden</span>`;
  if (trophy.missable) html += `<span class="missable-flag">Possibly missable</span>`;
  return html;
}

function cardHtml(trophy) {
  const masked = isMasked(trophy);
  const earned = state.earned.has(trophy.id);
  return `
  <article class="card${earned ? " is-earned" : ""}${trophy.id === state.selected ? " is-selected" : ""}" data-id="${trophy.id}">
    <div class="card-top">
      <span class="pill grade-${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>
      <span class="score">${trophy.gamerscore}G</span>
      <span class="kind">${KIND_LABEL[trophy.kind]}</span>
      ${flagsHtml(trophy)}
    </div>
    <h3 class="${masked ? "blur" : ""}">${esc(trophy.name)}</h3>
    <p class="desc ${masked ? "blur" : ""}">${esc(trophy.description)}</p>
    <div class="card-bottom">
      <label class="earned-toggle">
        <input type="checkbox" data-earn="${trophy.id}" ${earned ? "checked" : ""}> Earned
      </label>
      <button type="button" class="guide-btn" data-open="${trophy.id}">Guide</button>
    </div>
  </article>`;
}

function renderGrid() {
  const list = visibleTrophies();
  $("#grid").innerHTML = list.map(cardHtml).join("");
  $("#empty").hidden = list.length > 0;
  $("#visible-count").textContent = `Showing ${list.length} of ${state.trophies.length} trophies`;
}

function renderGuidePanel() {
  const trophy = state.trophies.find((t) => t.id === state.selected) ?? state.trophies[0];
  if (!trophy) return;
  const panel = $("#guide-panel");
  if (isMasked(trophy)) {
    panel.innerHTML = `
      <div class="card-top">
        <span class="pill grade-${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>
        <span class="kind">${KIND_LABEL[trophy.kind]}</span>
        <span class="hidden-flag">Hidden</span>
      </div>
      <h3>Hidden trophy</h3>
      <p class="panel-desc">This trophy is hidden on PlayStation until it is earned.</p>
      <p class="panel-guide">Its name, description and guide stay masked while the spoiler setting is off. Turn on “Reveal hidden trophies” above, or earn it and tick it off, to read the guide.</p>`;
    return;
  }
  panel.innerHTML = `
    <div class="card-top">
      <span class="pill grade-${trophy.grade}">${GRADE_LABEL[trophy.grade]}</span>
      <span class="score">${trophy.gamerscore}G</span>
      <span class="kind">${KIND_LABEL[trophy.kind]}</span>
      ${flagsHtml(trophy)}
    </div>
    <h3>${esc(trophy.name)}</h3>
    <p class="panel-desc">“${esc(trophy.description)}”</p>
    ${trophy.target ? `<p class="panel-target">PlayStation tracks: <strong>${esc(trophy.target)}</strong></p>` : ""}
    ${trophy.missable ? `<p class="panel-missable"><strong>Possibly missable.</strong> Read the missable watch in the roadmap before you finish Chapter 1.</p>` : ""}
    <p class="panel-guide">${esc(trophy.guide)}</p>
    <p class="panel-sources">Sources: <strong>${esc(trophy.sources)}</strong></p>`;
}

function renderProgress() {
  const total = state.trophies.length;
  const earnedCount = state.earned.size;
  const earnedScore = state.trophies
    .filter((t) => state.earned.has(t.id))
    .reduce((sum, t) => sum + t.gamerscore, 0);
  const totalScore = state.trophies.reduce((sum, t) => sum + t.gamerscore, 0);
  $("#ring-count").textContent = `${earnedCount}/${total}`;
  $("#stat-count").textContent = `${earnedCount} of ${total}`;
  $("#stat-score").textContent = `${earnedScore.toLocaleString("en-US")} of ${totalScore.toLocaleString("en-US")}G`;
  $("#ring-fg").style.strokeDashoffset = String(
    RING_CIRCUMFERENCE * (1 - (total ? earnedCount / total : 0)),
  );
  $("#grade-bars").innerHTML = Object.keys(GRADE_RANK)
    .map((grade) => {
      const inGrade = state.trophies.filter((t) => t.grade === grade);
      const done = inGrade.filter((t) => state.earned.has(t.id)).length;
      const pct = inGrade.length ? Math.round((done / inGrade.length) * 100) : 0;
      return `
      <div class="grade-bar">
        <span>${GRADE_LABEL[grade]}</span>
        <span class="track"><span class="fill" style="display:block;width:${pct}%;background:var(--${grade})"></span></span>
        <span class="num">${done}/${inGrade.length}</span>
      </div>`;
    })
    .join("");
}

function renderSources() {
  $("#source-list").innerHTML = state.sources
    .map(
      (source) =>
        `<li><a href="${esc(source.url)}">${esc(source.name)}</a> — ${esc(source.for)}</li>`,
    )
    .join("");
}

function renderAll() {
  renderProgress();
  renderGrid();
  renderGuidePanel();
}

function bindControls() {
  $("#q").addEventListener("input", (event) => {
    state.q = event.target.value;
    renderGrid();
  });
  $("#status").addEventListener("change", (event) => {
    state.status = event.target.value;
    renderGrid();
  });
  $("#sort").addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderGrid();
  });
  $("#spoilers").addEventListener("change", (event) => {
    state.spoilers = event.target.checked;
    saveProgress();
    renderGrid();
    renderGuidePanel();
  });
  $("#grade-chips").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-grade]");
    if (!chip) return;
    state.grade = chip.dataset.grade;
    syncControls();
    renderGrid();
  });
  $("#cat-chips").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-cat]");
    if (!chip) return;
    state.cat = chip.dataset.cat;
    syncControls();
    renderGrid();
  });
  $("#grid").addEventListener("change", (event) => {
    const box = event.target.closest("[data-earn]");
    if (!box) return;
    const id = Number(box.dataset.earn);
    if (box.checked) state.earned.add(id);
    else state.earned.delete(id);
    saveProgress();
    renderAll();
  });
  $("#grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-open]");
    if (!button) return;
    state.selected = Number(button.dataset.open);
    renderGrid();
    renderGuidePanel();
    $("#guide-panel").scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
  $("#reset").addEventListener("click", () => {
    if (!confirm("Reset all tracked progress? Every ticked trophy is cleared.")) return;
    state.earned.clear();
    saveProgress();
    renderAll();
  });
  $("#export").addEventListener("click", () => {
    const payload = JSON.stringify(
      { app: "leonida-legend", version: 1, earned: [...state.earned].sort((a, b) => a - b) },
      null,
      2,
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    link.download = "leonida-legend-progress.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });
  $("#import-btn").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error("no earned list");
      state.earned = new Set(
        ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55),
      );
      saveProgress();
      renderAll();
    } catch {
      alert("That file does not look like a Leonida Legend progress export.");
    }
    event.target.value = "";
  });
}

async function init() {
  const response = await fetch("data/trophies.json");
  const data = await response.json();
  state.trophies = data.trophies;
  state.sources = data.sources ?? [];
  loadProgress();
  const view = applyParams();
  syncControls();
  bindControls();
  renderSources();
  renderAll();
  if (view === "roadmap") {
    document.getElementById("roadmap").scrollIntoView();
  }
}

init().catch((error) => {
  document.getElementById("grid").innerHTML =
    `<p class="empty">The trophy data failed to load (${esc(error.message)}). Serve the app over HTTP — see serve.ts — rather than opening the file directly.</p>`;
});
