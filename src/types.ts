// Shared types for the browser app, the Express API and the tests.

export type ClaimStatus = "Submitted" | "In review" | "More info needed" | "Paid" | "Declined";

export interface Policy {
  number: string;
  type: string;
  holder: string;
  coverageLimit: number;
  currency: string;
  claimTypes: string[];
}

/** A saved claim, as the API returns it. */
export interface Claim {
  id: string;
  policyNumber: string;
  type: string;
  incidentDate: string; // YYYY-MM-DD
  amount: number;
  description: string;
  status: ClaimStatus;
}

/** What the form sends: amount is still the text the user typed. */
export interface ClaimInput {
  policyNumber: string;
  type: string;
  incidentDate: string;
  amount: string;
  description?: string;
}

export type ClaimField = keyof ClaimInput;
export type FieldErrors = Partial<Record<ClaimField, string>>;

/** Only the policy fields validation needs, so tests and the server can pass less. */
export type PolicyRules = Pick<Policy, "number" | "coverageLimit" | "claimTypes">;

export interface ClaimsApi {
  policies(): Promise<Policy[]>;
  claims(): Promise<Claim[]>;
  submit(input: ClaimInput): Promise<Claim>;
}

/** Error thrown by the API: HTTP status and, for validation failures, the field errors. */
export class ApiError extends Error {
  status?: number;
  errors?: FieldErrors;
  constructor(message: string, opts: { status?: number; errors?: FieldErrors } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.errors = opts.errors;
  }
}
