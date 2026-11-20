# LEONIDA — Trophy Intelligence

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/onlybountyy-hub/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/onlybountyy-hub/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**The definitive fan-made GTA VI trophy companion.** LEONIDA is a complete, offline trophy
intelligence platform for all 55 PlayStation 5 trophies in the competition kit dataset —
not just a checklist, but a strategy library where every guide separates what the kit
actually confirms from LEONIDA's own labelled strategic interpretation, with its source
citation visible inside the guide itself.

## What it does

- **Command Center** — platinum progress ring, the full 55-trophy checklist, search,
  grade/state filters, a spoiler shield for story trophies, an expanded guide panel,
  risk summary, and export/import/share controls in one frame.
- **55 authored strategy guides** — one per trophy, each with the objective as published,
  an objective interpretation, what the kit actually confirms, a strategic approach,
  numbered execution steps, preparation, and an evidence-based risk assessment.
- **Visible citations** — every guide carries its source traceability in-frame:
  the Exophase and PSNProfiles trophy listings, which agree on every name, description
  and grade as PlayStation publishes them. Strategy text is labelled
  STRATEGIC INTERPRETATION; riddle trophies whose descriptions state no concrete
  action are honestly labelled UNVERIFIED instead of being given invented walkthroughs.
- **Platinum Navigator** — a 5-phase roadmap using the real trophy names, with
  per-phase progress, a 55-cell completion heatmap (earned / not started /
  needs-verification), risk intelligence, and a verified-relationships panel that
  states plainly which dependencies the kit does and does not establish.
- **Risk intelligence, applied strictly** — CONFIRMED MISSABLE / POTENTIALLY MISSABLE /
  CHOICE-SENSITIVE / NO MISSABLE EVIDENCE / UNKNOWN. On kit evidence exactly one trophy
  is CHOICE-SENSITIVE (Actions Speak Louder — its own description is about choices,
  tracked to 500) and four vague riddle trophies are UNKNOWN. LEONIDA does not inflate
  missable labels without evidence.
- **Trophy audit system** — every guide is machine-checked for description,
  interpretation, kit fact, specific strategy, 3+ steps, preparation, risk and a
  genuine citation; the audit summary is shown in the Player Toolkit.
- **Smart planner** — a next-trophy recommendation that explains its reasoning from
  category coverage and risk class, never from invented dependencies.
- **Player Toolkit** — validated JSON export/import (schema and version checked,
  invalid files rejected without touching current progress, replacement confirmed
  first), local persistence, grade and category statistics, a shareable progress
  summary, reset with confirmation, and a per-trophy journal whose notes travel
  inside the export.
- **Honest unknowns** — difficulty and completion-time fields read
  "Unknown — Not established" throughout, because no reliable evidence exists.

## Run it

```
node main.ts            # copies app/ + screenshots/ to the output dir and writes dossier.json
node serve.ts           # serves app/ locally at http://localhost:8080
```

Or simply open `app/index.html` through any static file server. The app is plain
HTML/CSS/JavaScript with no build step and works fully offline: it fetches only its
own local dataset, `app/data/trophies.json`. Demonstration state: append `?demo=1`
to the URL for a fixed, clearly labelled demo progress set (16 of 55 earned), and
`&view=guide|navigator|toolkit&trophy=<id>` to open a specific view — the four
screenshots in `screenshots/` were captured exactly that way, all on the same demo data.

## Sources

- **Exophase** — GTA VI trophy list (names, descriptions and grades as PlayStation
  publishes them).
- **PSNProfiles** — GTA VI trophy list (agrees with Exophase on every name,
  description and grade).

The local copy used by the app is the competition kit dataset
(`app/data/trophies.json`): all 55 trophy names, descriptions, grades and kit hints
are transcribed exactly; the guide text around them is LEONIDA's own work.
No source text is copied beyond the official trophy names and descriptions,
which are shown as published.

## Disclaimer

LEONIDA is fan-made and speculative. The trophy list comes from the make.fun
competition kit and is **not** the officially confirmed final GTA VI trophy list.
This project is not affiliated with, endorsed by, or connected to Rockstar Games,
Take-Two Interactive, or Sony Interactive Entertainment. No official artwork,
logos or game screenshots are used; the visual identity is original.

## License

MIT — see `LICENSE`.

<sub>Entered on [make.fun](https://make.fun/?ref=q6ckzx1w&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
