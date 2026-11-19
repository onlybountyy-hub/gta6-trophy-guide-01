// Leonida Legend — hand-in program for the make.fun bounty gta6-trophy-guide-01.
//
// The guide itself is the static web app in app/ (open app/index.html in a browser; it
// works with the network off). This program is only the delivery van: it copies app/
// and screenshots/ into the output directory and writes dossier.json there with the
// kit's buildDossier, so the judge receives exactly the bytes the scorer rebuilds.
//
// Run locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader's container the output directory is /output and MAKEFUN_OUTPUT_DIR
// is unset, which is why it is the default below.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outDir, 'app'), { recursive: true });

const shotsDir = join(outDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), shotsDir, { recursive: true });
}

// The caps mirror the scorer's gate (reference/gate.json): at most 4 screenshots of
// at most 256 KiB, at most 993 files and 48 MiB under app/, dossier text capped at
// 160 KiB. buildDossier refuses anything past them, which is what we want locally too.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`Leonida Legend handed in: app/ + screenshots/ + dossier.json -> ${outDir}`);
