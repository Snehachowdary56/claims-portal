// Express API for the claims portal: policies as XML, claims as JSON.
import express, { type Express } from "express";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { validateClaim } from "../src/validation.ts";
import { parsePoliciesXml } from "../src/xml.ts";
import type { Claim, ClaimInput } from "../src/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const POLICIES_XML = readFileSync(join(here, "data", "policies.xml"), "utf8");
const POLICIES = parsePoliciesXml(POLICIES_XML, new JSDOM().window.DOMParser);

export function createApp({ today = () => new Date() }: { today?: () => Date } = {}): Express {
  const claims = JSON.parse(readFileSync(join(here, "data", "claims.json"), "utf8")) as Claim[];
  const app = express();
  app.use(express.json({ limit: "20kb" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/policies", (_req, res) => res.type("application/xml").send(POLICIES_XML));
  app.get("/api/claims", (_req, res) => res.json([...claims].sort((a, b) => b.incidentDate.localeCompare(a.incidentDate))));

  app.post("/api/claims", (req, res) => {
    const input = (req.body ?? {}) as Partial<Record<keyof ClaimInput, unknown>>;
    const errors = validateClaim(input, POLICIES, today());
    if (Object.keys(errors).length) return res.status(400).json({ message: "Please fix the highlighted fields.", errors });
    const claim: Claim = {
      id: `CL-2026-${String(claims.length + 1).padStart(4, "0")}`,
      policyNumber: String(input.policyNumber),
      type: String(input.type),
      incidentDate: String(input.incidentDate),
      amount: Number(input.amount),
      description: String(input.description ?? "").trim(),
      status: "Submitted",
    };
    claims.push(claim);
    return res.status(201).json(claim);
  });

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = createApp();
  app.use(express.static(join(here, "..", "dist")));
  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, () => console.log(`Claims portal on http://localhost:${port}`));
}
