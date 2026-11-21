// Claim validation, shared by the browser form and the server (one set of rules, so they never disagree).
import type { ClaimInput, FieldErrors, PolicyRules } from "./types.ts";

export const MAX_DESCRIPTION = 500;

/** The server receives untyped JSON, so every field may be missing or the wrong type. */
type UntrustedInput = Partial<Record<keyof ClaimInput, unknown>>;

export function validateClaim(claim: UntrustedInput, policies: PolicyRules[], today: Date = new Date()): FieldErrors {
  const errors: FieldErrors = {};
  const policy = policies.find((p) => p.number === claim.policyNumber);
  if (!policy) errors.policyNumber = "Choose one of your policies.";

  const type = typeof claim.type === "string" ? claim.type : "";
  if (!type) errors.type = "Choose what the claim is for.";
  else if (policy && !policy.claimTypes.includes(type)) errors.type = `${type} is not covered by this policy.`;

  const date = typeof claim.incidentDate === "string" && claim.incidentDate ? new Date(`${claim.incidentDate}T00:00:00`) : null;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const oldest = new Date(todayStart);
  oldest.setFullYear(oldest.getFullYear() - 1);
  if (!date || Number.isNaN(date.getTime())) errors.incidentDate = "Enter the date of the expense.";
  else if (date > todayStart) errors.incidentDate = "The date cannot be in the future.";
  else if (date < oldest) errors.incidentDate = "Claims must be sent within 12 months of the expense.";

  const amount = Number(claim.amount);
  if (claim.amount === "" || claim.amount === undefined || claim.amount === null || Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than $0.";
  } else if (!/^\d+(\.\d{1,2})?$/.test(String(claim.amount))) {
    errors.amount = "Use dollars and cents, for example 84.50.";
  } else if (policy && amount > policy.coverageLimit) {
    errors.amount = `The most this policy covers is $${policy.coverageLimit.toLocaleString("en-CA")}.`;
  }

  if (typeof claim.description === "string" && claim.description.length > MAX_DESCRIPTION) {
    errors.description = `Keep the description under ${MAX_DESCRIPTION} characters.`;
  }
  return errors;
}
