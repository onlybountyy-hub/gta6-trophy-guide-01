# Leonida Legend — GTA VI Trophy Guide & Tracker

![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/onlybountyy-hub/gta6-trophy-guide-01/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/onlybountyy-hub/gta6-trophy-guide-01/reward.svg)

**The complete offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5** — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01) ([referral](https://make.fun/r/q6ckzx1w)).

Every trophy with its official name, description and grade; a checklist that saves in your browser; a spoiler setting that hides story trophies until you earn them; filters by grade, category and status; a four-phase roadmap to the platinum; and a cited, step-by-step guide for each trophy — all in static files that work with the network off.

## What is inside

- `app/` — the guide itself: `index.html`, `style.css`, `app.js`, and `app/data/trophies.json` (all 55 trophies: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden, 27 visible; 1,000 Gamerscore; 1,350 PSN points).
- `screenshots/` — four renders of the guide running in a browser.
- `main.ts` — the entry program (Node 22, standard library only): copies `app/` and `screenshots/` to the output and writes `dossier.json`.
- `serve.ts` — a tiny static server for trying the guide locally.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## Try it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network needed.

## The guide at a glance

- **Tracker:** tick trophies as you earn them; progress saves in localStorage, exports to a file, and imports back. Search, sort (list / grade / name / rarity), and filter by grade, status and category, including a Missable category.
- **Next up:** the five easiest trophies you have not earned yet, updating as you check boxes off.
- **Spoilers:** hidden trophies stay masked by default until earned or revealed.
- **Roadmap:** four phases in order — story, side characters & the map, activities & challenges, crime & the 100% cleanup.
- **Guides:** every trophy has numbered steps in our own words, with its sources named beside it. Only one trophy is flagged as possibly missable (Positive Mental Attitude), hedged as the sources hedge it.
- **Honesty note:** no earn-rate percentages are published for this game anywhere, so this guide shows none. Rarity order is grade, then Gamerscore.

## Sources

Names, descriptions and grades: the official list via Exophase (verified live). Hidden / visible split: ofzenandcomputing and EGamers. PSN points and progress targets: PSNProfiles. Gamerscore scale and the missable flag: GTABase and PowerPyx. 100% counts and stranger details: GTA Zone. Full citations live in the app's Sources section and beside each trophy's guide.

## License

MIT — see [LICENSE](LICENSE). An unofficial fan guide, not affiliated with Rockstar Games; it uses no official artwork or logos.
