/** @jest-environment node */
import request from "supertest";
import { createApp } from "../server/server.js";

const today = () => new Date(2026, 10, 18);

test("serves policies as XML and claims as JSON", async () => {
  const app = createApp({ today });
  const xml = await request(app).get("/api/policies");
  expect(xml.status).toBe(200);
  expect(xml.type).toBe("application/xml");
  expect(xml.text).toContain('<policy number="HB-1001"');
  const claims = await request(app).get("/api/claims");
  expect(claims.body).toHaveLength(5);
  expect(claims.body[0].incidentDate >= claims.body[4].incidentDate).toBe(true);  // newest first
});

test("accepts a valid claim", async () => {
  const app = createApp({ today });
  const res = await request(app).post("/api/claims")
    .send({ policyNumber: "HB-1002", type: "Filling", incidentDate: "2026-11-10", amount: "240", description: " tooth " });
  expect(res.status).toBe(201);
  expect(res.body).toMatchObject({ id: "CL-2026-0006", amount: 240, status: "Submitted", description: "tooth" });
  expect((await request(app).get("/api/claims")).body).toHaveLength(6);
});

test("rejects an invalid claim with field errors, even if the browser check is skipped", async () => {
  const res = await request(createApp({ today })).post("/api/claims")
    .send({ policyNumber: "HB-1002", type: "Vision", incidentDate: "2030-01-01", amount: "5000" });
  expect(res.status).toBe(400);
  expect(Object.keys(res.body.errors).sort()).toEqual(["amount", "incidentDate", "type"]);
});

test("rejects oversized requests", async () => {
  const res = await request(createApp({ today })).post("/api/claims")
    .set("Content-Type", "application/json").send(JSON.stringify({ description: "x".repeat(30_000) }));
  expect(res.status).toBe(413);
});
