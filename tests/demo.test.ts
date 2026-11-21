// Demo mode (GitHub Pages build): data is bundled, claims are validated and kept in localStorage.
import { readFileSync } from "node:fs";

const xml = readFileSync(new URL("../server/data/policies.xml", import.meta.url), "utf8");
const seed = JSON.parse(readFileSync(new URL("../server/data/claims.json", import.meta.url), "utf8"));

type ApiModule = typeof import("../src/api.ts");
const g = globalThis as typeof globalThis & { __DEMO__?: boolean; __DEMO_POLICIES_XML__?: string; __DEMO_CLAIMS__?: unknown };

function loadDemoApi(): ApiModule {
  g.__DEMO__ = true;
  g.__DEMO_POLICIES_XML__ = xml;
  g.__DEMO_CLAIMS__ = seed;
  let mod: ApiModule | undefined;
  jest.isolateModules(() => {
    mod = require("../src/api.ts");
  });
  return mod!;
}

beforeEach(() => localStorage.clear());
afterAll(() => {
  delete g.__DEMO__;
});

test("works without a server", async () => {
  globalThis.fetch = jest.fn();
  const { api, isDemo } = loadDemoApi();
  expect(isDemo).toBe(true);
  expect(await api.policies()).toHaveLength(3);
  expect(await api.claims()).toHaveLength(5);
  expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("validates with the same rules and keeps new claims after a reload", async () => {
  const { api } = loadDemoApi();
  await expect(api.submit({ policyNumber: "HB-1002", type: "Vision", incidentDate: "2026-01-01", amount: "10" }))
    .rejects.toMatchObject({ errors: { type: expect.any(String) } });
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const claim = await api.submit({ policyNumber: "HB-1002", type: "Filling", incidentDate: today, amount: "240" });
  expect(claim).toMatchObject({ id: "CL-2026-0006", status: "Submitted" });
  const again = loadDemoApi().api;  // simulates reloading the page
  expect((await again.claims())[0].id).toBe("CL-2026-0006");
});
