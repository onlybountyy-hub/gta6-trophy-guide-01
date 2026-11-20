[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/onlybountyy-hub/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/onlybountyy-hub/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/onlybountyy-hub/gta6-trophy-guide-01/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/onlybountyy-hub/gta6-trophy-guide-01/reward.svg)

# LEONIDA — Trophy Intelligence

**THE DEFINITIVE FAN-MADE GTA VI TROPHY COMPANION**

A complete, offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: a cited strategy library, a platinum navigator with a completion heatmap, risk intelligence, a trophy audit system, a smart planner, a personal journal, and a fully working progress toolkit (checklist, search, filters, JSON export/import, local persistence, statistics, sharing, reset).

## What it does

- **Command Center** — platinum progress ring, trophy checklist, search and grade/category/risk/status filters, an expanded guide with its citation in-frame, the next recommended trophy, export/import, and audit summary in one screen.
- **Strategy Library** — all 55 trophies, each with its own guide: what it requires, an interpretation, the kit fact, a strategy, numbered execution steps, preparation, a risk class, an evidence label, and a visible citation. No guide is a rephrasing of the description alone.
- **Evidence Intelligence** — every factual claim is traceable to its source. Citations are only the two sources the competition kit names: **Exophase** (Grand Theft Auto VI PSN trophies) and **PSNProfiles** (Grand Theft Auto VI trophies, 43531). Everything beyond them is labelled STRATEGIC INTERPRETATION or UNVERIFIED. Difficulty and completion time are "Unknown — Not established" for every trophy — no numbers are invented.
- **Platinum Navigator** — a 5-phase roadmap (audit → risk & preparation → story → activities/collectibles/exploration → economy/cleanup/platinum) with real trophy names, per-phase progress, a 55-cell completion heatmap, risk intelligence, and verified relationships.
- **Risk intelligence** — applied strictly from the kit: 1 CHOICE-SENSITIVE trophy (#48 Actions Speak Louder, choices tracked to 500), 54 with NO MISSABLE EVIDENCE, 0 confirmed missable. The missable count is not inflated.
- **Trophy audit system** — all 55 guides audited: 50 PASS, 5 REVIEW (#38, #47, #48, #49, #50 — vague official descriptions whose objectives are unverified and whose guides say so), 0 missing.
- **Player Toolkit** — validated JSON export and import (invalid files are rejected with an explanation and never touch existing progress), grade and category statistics, journal notes per trophy (included in export), backup status, shareable progress summary, and reset with confirmation. Progress persists in localStorage.
- **Smart planner** — the next recommendation is the earliest unfinished trophy in story order, then the silver set, then the rest, with the reason shown.

## How to run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests, no dependencies. `?demo=1` loads a fixed, labelled demo set (12 of 55 earned) for screenshots; `?view=command|guide|roadmap|toolkit` and `?trophy=<id>` open a specific view and trophy.

## Sources

Exophase — Grand Theft Auto VI PSN trophies; PSNProfiles — Grand Theft Auto VI trophies (43531). The two agree on every name, description and grade. Counts in the guides (42 Shooting Range challenges, 14 drone-race locations, 18 meditation spots, 52 areas, 9 gangs, 8 garages, 500 choices, 100 vehicles, 250 stunts, 20 races, 5 vaults, $250,000, $100,000) come from the official descriptions in the kit dataset (`app/data/trophies.json`).

## Fan-made disclaimer

This is an unofficial, fan-made guide. The trophy list is speculative, based on the competition kit — it is not the officially confirmed final GTA VI trophy list. No Rockstar Games logo, official artwork, box art or game screenshots are used. GTA and Grand Theft Auto are trademarks of their owners; this guide is not affiliated with or endorsed by Rockstar Games or PlayStation.

## Submission outline

55 trophies with official names, descriptions and grades, each with a cited, specific guide in the author's own words; a command center combining checklist, progress, search, filters, guide and export/import; a platinum navigator with a heatmap and five phases; risk intelligence with strict missable classes; a trophy audit system (50 PASS / 5 REVIEW); source-to-trophy traceability to Exophase and PSNProfiles only; a smart next-trophy planner; a per-trophy journal; validated JSON export/import with local persistence; grade and category statistics and a shareable summary — all offline, in four screenshots that show it working.
