// Leonida Legend — the entry program (Node 22, standard library only).
// It hands the guide in: copies app/ and screenshots/ from beside this file
// into the output directory and writes output/dossier.json with the vendored
// make.fun library, so the judge can read the guide's screenshots and text.
// Run it outside the grader with MAKEFUN_OUTPUT_DIR set:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    total += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return total;
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots of 256 KiB, app/ at most 993
// files and 48 MiB, and the dossier text at most 163,840 bytes.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);

const shotCount = readdirSync(join(outputDir, 'screenshots')).length;
const appCount = countFiles(join(outputDir, 'app'));
const dossierBytes = statSync(join(outputDir, 'dossier.json')).size;
console.log(`Leonida Legend handed in: ${appCount} app files, ${shotCount} screenshots, dossier.json ${dossierBytes} bytes.`);
