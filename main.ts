// Leonida Legend — hands the guide in.
//
// Copies app/ and screenshots/ from this repository into the output
// directory and writes dossier.json there with the kit's frontend
// library, byte for byte as the scorer will rebuild it. In the grader
// the output directory is /output; outside it, MAKEFUN_OUTPUT_DIR
// stands in for it.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// The scorer's caps (reference/gate.json): text_max_bytes shapes the
// dossier's bytes; the rest refuse anything the scorer would refuse.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(out, "dossier.json"), dossier);

const shots = readdirSync(join(out, "screenshots")).filter((name) => !name.startsWith("."));
console.log(`Leonida Legend: ${shots.length} screenshots, dossier ${dossier.length} bytes written to ${join(out, "dossier.json")}`);
