// Claim validation, shared by the browser form and the server (one set of rules, so they never disagree).

export const MAX_DESCRIPTION = 500;

export function validateClaim(claim, policies, today = new Date()) {
  const errors = {};
  const policy = policies.find((p) => p.number === claim.policyNumber);
  if (!policy) errors.policyNumber = "Choose one of your policies.";

  if (!claim.type) errors.type = "Choose what the claim is for.";
  else if (policy && !policy.claimTypes.includes(claim.type)) errors.type = `${claim.type} is not covered by this policy.`;

  const date = claim.incidentDate ? new Date(`${claim.incidentDate}T00:00:00`) : null;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const oldest = new Date(todayStart);
  oldest.setFullYear(oldest.getFullYear() - 1);
  if (!date || Number.isNaN(date.getTime())) errors.incidentDate = "Enter the date of the expense.";
  else if (date > todayStart) errors.incidentDate = "The date cannot be in the future.";
  else if (date < oldest) errors.incidentDate = "Claims must be sent within 12 months of the expense.";

  const amount = Number(claim.amount);
  if (claim.amount === "" || claim.amount === undefined || Number.isNaN(amount) || amount <= 0) {
    errors.amount = "Enter an amount greater than $0.";
  } else if (!/^\d+(\.\d{1,2})?$/.test(String(claim.amount))) {
    errors.amount = "Use dollars and cents, for example 84.50.";
  } else if (policy && amount > policy.coverageLimit) {
    errors.amount = `The most this policy covers is $${policy.coverageLimit.toLocaleString("en-CA")}.`;
  }

  if (claim.description && claim.description.length > MAX_DESCRIPTION) {
    errors.description = `Keep the description under ${MAX_DESCRIPTION} characters.`;
  }
  return errors;
}
