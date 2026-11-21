import type { ClaimStatus } from "./types.ts";

export const money = (n: number): string => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);

/** Bootstrap badge colour for each claim status. */
export const STATUS_STYLE: Record<ClaimStatus, string> = {
  Submitted: "secondary",
  "In review": "info",
  "More info needed": "warning",
  Paid: "success",
  Declined: "danger",
};
