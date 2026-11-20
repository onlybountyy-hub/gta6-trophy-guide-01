// LEONIDA — Trophy Intelligence: the hand-in program for the make.fun entry gta6-trophy-guide-01.
// The product itself is the static web app in app/ (open app/index.html in a browser; it needs no
// build step and loads nothing over the network). This program's one job is delivery: copy app/
// and screenshots/ from beside this file into the output directory, then write dossier.json
// there with the vendored make.fun library, byte for byte as the scorer's own copy writes it.
// Node 22, standard library only. Outside the grader, point MAKEFUN_OUTPUT_DIR at a scratch
// folder:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's gate so this program refuses exactly what the scorer would
// refuse: dossier text capped at 163,840 bytes, at most 4 screenshots of at most 262,144 bytes
// each, at most 993 entries and 48 MiB under app/.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
