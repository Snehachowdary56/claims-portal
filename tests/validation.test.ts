import { validateClaim } from "../src/validation.ts";

const policies = [{ number: "HB-1", coverageLimit: 1500, claimTypes: ["Cleaning", "Filling"] }];
const today = new Date(2026, 10, 18);
const ok = { policyNumber: "HB-1", type: "Cleaning", incidentDate: "2026-11-01", amount: "180.50", description: "" };

test("a complete claim has no errors", () => {
  expect(validateClaim(ok, policies, today)).toEqual({});
});

test.each([
  [{ policyNumber: "" }, "policyNumber"],
  [{ type: "Braces" }, "type"],
  [{ incidentDate: "2026-12-01" }, "incidentDate"],
  [{ incidentDate: "2025-10-01" }, "incidentDate"],
  [{ amount: "0" }, "amount"],
  [{ amount: "12.345" }, "amount"],
  [{ amount: "abc" }, "amount"],
  [{ amount: "2000" }, "amount"],
  [{ description: "x".repeat(501) }, "description"],
])("rejects %o", (change, field) => {
  expect(Object.keys(validateClaim({ ...ok, ...change }, policies, today))).toEqual([field]);
});

test("today's date is accepted, 12 months ago is the limit", () => {
  expect(validateClaim({ ...ok, incidentDate: "2026-11-18" }, policies, today)).toEqual({});
  expect(validateClaim({ ...ok, incidentDate: "2025-11-18" }, policies, today)).toEqual({});
  expect(validateClaim({ ...ok, incidentDate: "2025-11-17" }, policies, today).incidentDate).toBeDefined();
});
