import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { api, isDemo } from "./api.js";
import ClaimsTable from "./components/ClaimsTable.jsx";

// The form is only downloaded when it is opened (Webpack code splitting keeps the first load small).
const ClaimForm = lazy(() => import(/* webpackChunkName: "claim-form" */ "./components/ClaimForm.jsx"));

export default function App() {
  const [tab, setTab] = useState("claims");
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.policies(), api.claims()]);
      setPolicies(p);
      setClaims(c);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (values) => {
    const claim = await api.submit(values);
    setClaims((cur) => [claim, ...cur]);
    setNotice(`Claim ${claim.id} was submitted. We usually review claims within 5 business days.`);
    setTab("claims");
  };

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="app-header py-3 mb-4">
        <div className="container">
          <h1 className="h3 mb-0">Harbour Insurance claims</h1>
          {isDemo && <p className="small mb-0 mt-1">Demo with fictional data. New claims are saved only in this browser.</p>}
        </div>
      </header>
      <main id="main" className="container pb-5">
        <ul className="nav nav-tabs mb-4">
          {[["claims", "My claims"], ["new", "New claim"]].map(([key, label]) => (
            <li className="nav-item" key={key}>
              <button className={`nav-link${tab === key ? " active" : ""}`} aria-current={tab === key ? "page" : undefined} onClick={() => setTab(key)}>
                {label}
              </button>
            </li>
          ))}
        </ul>
        {notice && <div className="alert alert-success" role="status">{notice}</div>}
        {error && (
          <div className="alert alert-danger" role="alert">
            We couldn’t load your claims: {error}{" "}
            <button className="btn btn-sm btn-outline-danger ms-2" onClick={load}>Try again</button>
          </div>
        )}
        {loading ? (
          <p role="status">Loading your claims…</p>
        ) : tab === "claims" ? (
          <ClaimsTable claims={claims} />
        ) : (
          <Suspense fallback={<p role="status">Loading form…</p>}>
            <ClaimForm policies={policies} onSubmit={submit} />
          </Suspense>
        )}
      </main>
    </>
  );
}
