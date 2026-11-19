# Leonida Legend — GTA 6 Trophy Guide

[![Competition](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-7c3aed)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Entry](https://img.shields.io/badge/entry-Leonida%20Legend-ff2e88)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Referral](https://img.shields.io/badge/referral-q6ckzx1w-22d3ee)](https://make.fun/r/q6ckzx1w)

An offline trophy guide and tracker for the 55 PlayStation 5 trophies of
Grand Theft Auto VI. Open `app/index.html` in a browser — no network, no
build step — and you get the full official list with a guide to every
trophy, a checklist that saves in your browser, and a roadmap to the
platinum.

## What it does

- All 55 official trophies with their PlayStation names, descriptions and
  grades (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), Gamerscore values that
  add up to 1,000G, and the 28 hidden trophies flagged.
- A guide to every trophy in our own words, with its sources named beside
  it. Where no source confirms a trigger yet, the guide says so instead of
  inventing steps.
- A tracker: tick trophies off as you earn them; progress (trophy count,
  Gamerscore, per-grade bars and a completion ring) saves to localStorage
  and can be exported to a file and imported back.
- A spoiler setting that keeps hidden trophies masked until you reveal
  them or earn them.
- Filters by status, grade and kind (story, side missions, collectibles,
  activities, crime & heists, world & money, missable), text search, and
  sorts by list order, grade, name and rarity. Rarity ranks by grade, then
  Gamerscore — no earn-rate percentages are shown, because none exist yet
  for a game this new.
- A three-step Platinum roadmap and the one possibly-missable trophy
  (Positive Mental Attitude) flagged with its Chapter 1 warning.
- Reproducible views through URL parameters: `grade`, `status`, `q`,
  `cat`, `sort`, `spoilers=1`, `open=<id>`, `view=roadmap`.

## Run it

```sh
node main.ts          # copies app/ and screenshots/ to the output dir and writes dossier.json
node serve.ts         # serves the guide locally for screenshots and trying it out
```

`main.ts` writes to `$MAKEFUN_OUTPUT_DIR` when set, else `./out`.

## Sources

Trophy names, descriptions, grades and hidden flags are the official list
as PlayStation publishes it, cross-checked across Exophase and
PSNProfiles. Gamerscore values, progress counts and the facts each guide
relies on are cited per trophy from GTABase and Output Lag. The guides are
original text written for this entry; nothing is copied from those sites.

## License

MIT — see [LICENSE](LICENSE). Fan-made; not affiliated with Rockstar
Games or Take-Two Interactive. No Rockstar logo or artwork is used.

Built for [make.fun/gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) — referral [q6ckzx1w](https://make.fun/r/q6ckzx1w).
