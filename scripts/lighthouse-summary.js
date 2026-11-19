// Prints the median Lighthouse scores from .lighthouseci/reports/manifest.json (written by `lhci autorun`).
import { readFileSync } from "node:fs";

const runs = JSON.parse(readFileSync(".lighthouseci/reports/manifest.json", "utf8"));
const rep = runs.find((r) => r.isRepresentativeRun) ?? runs[0];
const line = Object.entries(rep.summary)
  .map(([k, v]) => `${k}: ${Math.round(v * 100)}`)
  .join(" | ");
console.log(`Lighthouse (desktop, median of ${runs.length} runs) ${line}`);
