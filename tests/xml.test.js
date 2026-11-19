import { readFileSync } from "node:fs";
import { parsePoliciesXml } from "../src/xml.js";

const xml = readFileSync(new URL("../server/data/policies.xml", import.meta.url), "utf8");

test("parses policies, limits and claim types from XML", () => {
  const policies = parsePoliciesXml(xml);
  expect(policies).toHaveLength(3);
  expect(policies[0]).toEqual({
    number: "HB-1001", type: "health", holder: "Alex Morgan", coverageLimit: 5000, currency: "CAD",
    claimTypes: ["Prescription", "Physiotherapy", "Vision"],
  });
});

test("rejects malformed XML", () => {
  expect(() => parsePoliciesXml("<policies><policy></policies>")).toThrow("not valid XML");
});
