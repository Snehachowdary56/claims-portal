import { useMemo, useState } from "react";
import { money, STATUS_STYLE } from "../format.js";

export default function ClaimsTable({ claims }) {
  const [status, setStatus] = useState("All");
  const statuses = useMemo(() => ["All", ...new Set(claims.map((c) => c.status))], [claims]);
  const shown = status === "All" ? claims : claims.filter((c) => c.status === status);
  const total = shown.reduce((sum, c) => sum + c.amount, 0);
  const needsAction = claims.filter((c) => c.status === "More info needed").length;

  return (
    <section aria-labelledby="claims-heading">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <h2 id="claims-heading" className="h4 mb-0">My claims</h2>
        <div>
          <label htmlFor="status-filter" className="form-label small mb-1">Show</label>
          <select id="status-filter" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {needsAction > 0 && (
        <div className="alert alert-warning" role="status">
          {needsAction} claim{needsAction > 1 ? "s need" : " needs"} more information from you.
        </div>
      )}
      <div className="table-responsive">
        <table className="table align-middle">
          <caption className="visually-hidden">Your claims, newest first</caption>
          <thead>
            <tr>
              <th scope="col">Claim</th>
              <th scope="col">Policy</th>
              <th scope="col">For</th>
              <th scope="col">Date</th>
              <th scope="col" className="text-end">Amount</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.policyNumber}</td>
                <td>{c.type}</td>
                <td>{c.incidentDate}</td>
                <td className="text-end">{money(c.amount)}</td>
                <td><span className={`badge text-bg-${STATUS_STYLE[c.status] ?? "secondary"}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={4}>{shown.length} claim{shown.length === 1 ? "" : "s"}</th>
              <td className="text-end fw-semibold">{money(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
