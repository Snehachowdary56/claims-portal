// Client side of the client-server app: talks to the Express API.
import { parsePoliciesXml } from "./xml.js";

async function check(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.message) message = body.message;
    } catch {
      /* not JSON */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res;
}

export const api = {
  async policies() {
    const res = await check(await fetch("/api/policies", { headers: { Accept: "application/xml" } }));
    return parsePoliciesXml(await res.text());
  },
  async claims() {
    const res = await check(await fetch("/api/claims"));
    return res.json();
  },
  async submit(claim) {
    const res = await check(
      await fetch("/api/claims", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(claim) }),
    );
    return res.json();
  },
};
