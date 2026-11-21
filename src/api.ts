// Client side of the client-server app: talks to the Express API.
import { parsePoliciesXml } from "./xml.ts";
import { validateClaim } from "./validation.ts";
import { ApiError, type Claim, type ClaimInput, type ClaimsApi } from "./types.ts";

async function check(res: Response): Promise<Response> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let errors;
    try {
      const body = (await res.json()) as { message?: string; errors?: ApiError["errors"] };
      if (body.message) message = body.message;
      errors = body.errors;
    } catch {
      /* not JSON */
    }
    throw new ApiError(message, { status: res.status, errors });
  }
  return res;
}

const serverApi: ClaimsApi = {
  async policies() {
    const res = await check(await fetch("/api/policies", { headers: { Accept: "application/xml" } }));
    return parsePoliciesXml(await res.text());
  },
  async claims() {
    const res = await check(await fetch("/api/claims"));
    return (await res.json()) as Claim[];
  },
  async submit(claim) {
    const res = await check(
      await fetch("/api/claims", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(claim) }),
    );
    return (await res.json()) as Claim;
  },
};

// Demo mode (the GitHub Pages build has no server): the same data files are bundled into the page,
// claims are validated with the same rules and kept in this browser (localStorage).
const DEMO_KEY = "harbour-demo-claims";

function demoApi(): ClaimsApi {
  const policies = () => parsePoliciesXml(__DEMO_POLICIES_XML__);
  const saved = (): Claim[] => {
    try {
      return JSON.parse(localStorage.getItem(DEMO_KEY) ?? "[]") as Claim[];
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
    async submit(input: ClaimInput) {
      const errors = validateClaim(input, policies());
      if (Object.keys(errors).length) throw new ApiError("Please fix the highlighted fields.", { status: 400, errors });
      const all = saved();
      const claim: Claim = {
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

export const isDemo: boolean = typeof __DEMO__ !== "undefined" && Boolean(__DEMO__);
export const api: ClaimsApi = isDemo ? demoApi() : serverApi;
