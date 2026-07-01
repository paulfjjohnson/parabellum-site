import { useState, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { LogOut, Mail, Inbox, RefreshCw, Loader2 } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { Crest } from "@/components/Crest";
import { useAuth, authHeader } from "@/context/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); }
  catch { return iso; }
};

const TYPE_META = {
  launch: { label: "Launch Request" },
  contact: { label: "Contact" },
  package_quote: { label: "Package Quote" },
  package_order: { label: "Package Order — PAID" },
};

const SubmissionCard = ({ s }) => {
  const d = s.data || {};
  const isLaunch = s.type === "launch";
  const isPackage = s.type === "package_quote" || s.type === "package_order";
  const isOrder = s.type === "package_order";
  const meta = TYPE_META[s.type] || { label: "Submission" };
  return (
    <div className="pb-card" style={{ padding: "26px 28px" }} data-testid={`submission-${s.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="pb-mono" style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 10px", border: `1px solid ${isOrder ? "#4E8C5A" : "var(--pb-gold)"}`, color: isOrder ? "#4E8C5A" : "var(--pb-gold)" }}>
            {meta.label}
          </span>
          <span className="pb-serif" style={{ fontSize: 22 }}>{d.name || d.email || "—"}</span>
        </div>
        <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--pb-gray)" }}>{fmtDate(s.created_at)}</span>
      </div>
      {d.email && (
        <a href={`mailto:${d.email}`} className="flex items-center gap-2 mt-3 pb-body" style={{ fontSize: 15, color: "var(--pb-gold)" }}>
          <Mail size={13} /> {d.email}
        </a>
      )}
      {d.org && <div className="pb-body mt-1" style={{ fontSize: 15 }}>Org: {d.org}{d.orgType ? ` · ${d.orgType}` : ""}</div>}

      {isLaunch && d.goals?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {d.goals.map((g) => <span key={g} className="pb-mono" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 9px", border: "1px solid var(--pb-border)", color: "var(--pb-gray-soft)" }}>{g}</span>)}
        </div>
      )}
      {isLaunch && d.timeline && <div className="pb-body mt-2" style={{ fontSize: 15 }}>Timeline: {d.timeline}</div>}

      {isPackage && (
        <div className="mt-3" style={{ borderTop: "1px solid var(--pb-border-soft)", paddingTop: 14 }}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="pb-body" style={{ fontSize: 16 }}>Tier: <span className="pb-gold-text">{d.tier || "—"}</span></div>
            <div className="pb-body" style={{ fontSize: 16 }}>Setup: <span className="pb-gold-text">${Number(d.setup_total ?? d.setup_paid ?? 0).toLocaleString("en-US")}</span></div>
            <div className="pb-body" style={{ fontSize: 16 }}>Monthly: <span className="pb-gold-text">${Number(d.monthly_total ?? 0).toLocaleString("en-US")}</span></div>
          </div>
          {d.addons?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {d.addons.map((a) => <span key={a} className="pb-mono" style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 9px", border: "1px solid var(--pb-border)", color: "var(--pb-gray-soft)" }}>{a}</span>)}
            </div>
          )}
        </div>
      )}

      {(d.message || d.notes || d.question) && <p className="pb-body mt-3" style={{ fontSize: 16, borderLeft: "2px solid var(--pb-border)", paddingLeft: 14 }}>{d.message || d.notes || d.question}</p>}
    </div>
  );
};

export default function Admin() {
  const { user, logout } = useAuth();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/submissions`, { headers: authHeader() });
      setSubs(data.submissions || []);
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user && user !== false) load(); }, [user]);

  if (user === null) return <div style={{ minHeight: "100vh" }} />;
  if (user === false) return <Navigate to="/admin/login" replace />;

  const filtered = filter === "all" ? subs : filter === "packages" ? subs.filter((s) => s.type === "package_quote" || s.type === "package_order") : subs.filter((s) => s.type === filter);
  const counts = {
    all: subs.length,
    launch: subs.filter((s) => s.type === "launch").length,
    contact: subs.filter((s) => s.type === "contact").length,
    packages: subs.filter((s) => s.type === "package_quote" || s.type === "package_order").length,
  };

  return (
    <section className="pb-sec-black" style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 90 }}>
      <div className="pb-container">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4"><Crest size={34} /><span className="pb-mono" style={{ fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase" }}>Parabellum · Admin</span></div>
            <Eyebrow>Lead Inbox</Eyebrow>
            <h1 className="pb-h2 mt-5" style={{ fontSize: 48 }}>Incoming.</h1>
            <p className="pb-body mt-3" style={{ fontSize: 15 }}>Signed in as {user.email}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={load} className="pb-btn pb-btn-ghost" data-testid="admin-refresh"><RefreshCw size={13} /> Refresh</button>
            <button onClick={logout} className="pb-btn pb-btn-ghost" data-testid="admin-logout"><LogOut size={13} /> Log Out</button>
          </div>
        </div>

        <div className="flex gap-3 mt-10" style={{ borderBottom: "1px solid var(--pb-border-soft)", paddingBottom: 0 }}>
          {[["all", "All"], ["packages", "Packages"], ["launch", "Launch Requests"], ["contact", "Contact"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className="pb-mono" data-testid={`filter-${k}`}
              style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", padding: "12px 4px", marginRight: 24,
                color: filter === k ? "var(--pb-gold)" : "var(--pb-gray)", borderBottom: filter === k ? "2px solid var(--pb-gold)" : "2px solid transparent" }}>
              {l} ({counts[k]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-3 mt-16 pb-body"><Loader2 size={18} className="animate-spin" color="var(--pb-gold)" /> Loading submissions…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "80px 0" }} data-testid="admin-empty">
            <Inbox size={40} color="var(--pb-gray)" strokeWidth={1.2} />
            <p className="pb-body mt-5" style={{ fontSize: 17 }}>No submissions yet. New leads will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6 mt-10" data-testid="admin-submissions-list">
            {filtered.map((s, i) => <Reveal key={s.id} delay={Math.min(i * 0.04, 0.3)}><SubmissionCard s={s} /></Reveal>)}
          </div>
        )}
      </div>
    </section>
  );
}
