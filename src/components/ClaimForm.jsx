import { useRef, useState } from "react";
import { validateClaim, MAX_DESCRIPTION } from "../validation.js";

const EMPTY = { policyNumber: "", type: "", incidentDate: "", amount: "", description: "" };
const LABELS = { policyNumber: "Policy", type: "What is the claim for?", incidentDate: "Date of the expense", amount: "Amount (CAD)", description: "Description (optional)" };

export default function ClaimForm({ policies, onSubmit, today = new Date() }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState(null);
  const summaryRef = useRef(null);
  const policy = policies.find((p) => p.number === values.policyNumber);

  const set = (field) => (e) => {
    const v = e.target.value;
    setValues((cur) => ({ ...cur, [field]: v, ...(field === "policyNumber" ? { type: "" } : {}) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validateClaim(values, policies, today);
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());  // screen readers hear the error summary
      return;
    }
    setSending(true);
    try {
      await onSubmit(values);
      setValues(EMPTY);
    } catch (err) {
      setServerError(err.message);
      if (err.errors) setErrors(err.errors);
    } finally {
      setSending(false);
    }
  };

  const field = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: set(name),
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const feedback = (name) => errors[name] && <div id={`${name}-error`} className="invalid-feedback d-block">{errors[name]}</div>;
  const cls = (base, name) => `${base}${errors[name] ? " is-invalid" : ""}`;
  const errorList = Object.entries(errors);

  return (
    <section aria-labelledby="form-heading">
      <h2 id="form-heading" className="h4">New claim</h2>
      {errorList.length > 0 && (
        <div className="alert alert-danger" role="alert" tabIndex={-1} ref={summaryRef}>
          <p className="fw-semibold mb-1">Please fix {errorList.length} field{errorList.length > 1 ? "s" : ""}:</p>
          <ul className="mb-0">
            {errorList.map(([name, msg]) => <li key={name}><a href={`#${name}`}>{LABELS[name]}</a>: {msg}</li>)}
          </ul>
        </div>
      )}
      {serverError && !errorList.length && <div className="alert alert-danger" role="alert">{serverError}</div>}
      <form noValidate onSubmit={submit} className="row g-3">
        <div className="col-md-6">
          <label htmlFor="policyNumber" className="form-label">{LABELS.policyNumber}</label>
          <select {...field("policyNumber")} className={cls("form-select", "policyNumber")}>
            <option value="">Choose a policy</option>
            {policies.map((p) => <option key={p.number} value={p.number}>{p.number} ({p.type})</option>)}
          </select>
          {feedback("policyNumber")}
        </div>
        <div className="col-md-6">
          <label htmlFor="type" className="form-label">{LABELS.type}</label>
          <select {...field("type")} className={cls("form-select", "type")} disabled={!policy}>
            <option value="">{policy ? "Choose a type" : "Choose a policy first"}</option>
            {policy?.claimTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
          {feedback("type")}
        </div>
        <div className="col-md-6">
          <label htmlFor="incidentDate" className="form-label">{LABELS.incidentDate}</label>
          <input type="date" {...field("incidentDate")} className={cls("form-control", "incidentDate")} />
          {feedback("incidentDate")}
        </div>
        <div className="col-md-6">
          <label htmlFor="amount" className="form-label">{LABELS.amount}</label>
          <input type="text" inputMode="decimal" {...field("amount")} className={cls("form-control", "amount")} />
          {policy && <div className="form-text">This policy covers up to ${policy.coverageLimit.toLocaleString("en-CA")}.</div>}
          {feedback("amount")}
        </div>
        <div className="col-12">
          <label htmlFor="description" className="form-label">{LABELS.description}</label>
          <textarea {...field("description")} rows={3} maxLength={MAX_DESCRIPTION + 50} className={cls("form-control", "description")} />
          <div className="form-text">{values.description.length}/{MAX_DESCRIPTION} characters</div>
          {feedback("description")}
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? "Sending…" : "Submit claim"}</button>
        </div>
      </form>
    </section>
  );
}
