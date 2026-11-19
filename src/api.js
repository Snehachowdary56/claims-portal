// Client side of the client-server app: talks to the Express API.
import { parsePoliciesXml } from "./xml.js";
import { validateClaim } from "./validation.js";

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

const serverApi = {
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

// Demo mode (the GitHub Pages build has no server): the same data files are bundled into the page,
// claims are validated with the same rules and kept in this browser (localStorage).
const DEMO_KEY = "harbour-demo-claims";

function demoApi() {
  /* global __DEMO_POLICIES_XML__, __DEMO_CLAIMS__ */
  const policies = () => parsePoliciesXml(__DEMO_POLICIES_XML__);
  const saved = () => {
    try {
      return JSON.parse(localStorage.getItem(DEMO_KEY) ?? "[]");
    } catch {
      return [];
    }
  };
  return {
    async policies() {
      return policies();
    },
    async claims() {
      return [...saved(), ...__DEMO_CLAIMS__].sort((a, b) => b.incidentDate.localeCompare(a.incidentDate));
    },
    async submit(input) {
      const errors = validateClaim(input, policies());
      if (Object.keys(errors).length) {
        const err = new Error("Please fix the highlighted fields.");
        err.errors = errors;
        throw err;
      }
      const all = saved();
      const claim = {
        id: `CL-2026-${String(__DEMO_CLAIMS__.length + all.length + 1).padStart(4, "0")}`,
        policyNumber: input.policyNumber,
        type: input.type,
        incidentDate: input.incidentDate,
        amount: Number(input.amount),
        description: String(input.description ?? "").trim(),
        status: "Submitted",
      };
      try {
        localStorage.setItem(DEMO_KEY, JSON.stringify([claim, ...all]));
      } catch {
        /* storage unavailable: the claim still shows until the page is reloaded */
      }
      return claim;
    },
  };
}

/* global __DEMO__ */
export const isDemo = typeof __DEMO__ !== "undefined" && __DEMO__;
export const api = isDemo ? demoApi() : serverApi;
