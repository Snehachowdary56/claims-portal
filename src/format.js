export const money = (n) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);

export const STATUS_STYLE = {
  Submitted: "secondary",
  "In review": "info",
  "More info needed": "warning",
  Paid: "success",
  Declined: "danger",
};
