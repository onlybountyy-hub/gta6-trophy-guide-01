# Leonida Legend — GTA VI Trophy Guide & Tracker

![make.fun gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/onlybountyy-hub/gta6-trophy-guide-01/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/onlybountyy-hub/gta6-trophy-guide-01/reward.svg)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI:
1 Platinum, 2 Gold, 6 Silver and 46 Bronze — 28 of them hidden, 1,000 Gamerscore and
1,350 PSN points in total.

Built for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Full checklist** — every trophy with its official name, description and grade, exactly
  as PlayStation publishes them.
- **Tracker** — tick trophies off as you earn them; progress is saved in your browser
  (localStorage) and can be **exported to a file and imported back** on any machine.
- **Progress at a glance** — a completion ring, per-grade progress bars, and running
  Gamerscore / PSN-points totals.
- **Spoiler shield** — hidden trophies are masked by default; reveal them only when you
  want to. Your choice is remembered and can be shared as a link.
- **Filters, search and sorts** — by status (earned / remaining), grade, and category
  (story, strands, collectibles, activities, world — plus a dedicated Missable view),
  with sorts by list order, grade, name, or rarity.
- **A guide for every trophy** — in our own words, each with its sources cited beside it.
  No earn-rate percentages are shown, because no source publishes a trustworthy one;
  rarity here is ordered by grade and Gamerscore, and the app says so.
- **Platinum roadmap** — the seven-stage order we recommend, from the opening mission
  to the 100% sweep, with the one possibly-missable trophy flagged up front.
- **Works fully offline** — static files only; open it, bookmark it, take it anywhere.

## Run it

```sh
node serve.ts            # serves app/ at http://localhost:8080
```

or serve the `app/` folder with any static file server. No build step, no network needed.

## Hand it in (make.fun program)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored `buildDossier` from `vendor/makefun-frontend.ts`
(the kit's library, byte for byte).

## Data & sources

Trophy names, descriptions and grades are the official ones, as listed by
[Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and
[PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) (the two agree on
every name, description and grade). PSN progress counts (250 stunts, 42 shooting-range
challenges, 500 choices…) are PSN's own, via PSNProfiles. The hidden/visible split and the
Gamerscore values are cross-checked against GTABase's list and PlanetGTA6's table; the one
possibly-missable trophy (Positive Mental Attitude) is flagged following PowerPyx and
GTABase. Every guide in the app is written for this entry and names its sources next to the
trophy it covers.

## Referral

Found this through make.fun? Join with our referral link: https://make.fun/r/q6ckzx1w

## License

MIT — see [LICENSE](LICENSE).
