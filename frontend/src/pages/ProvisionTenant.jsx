import { useState, useEffect } from "react";
import axios from "axios";
import { Navigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, Copy, Check, RefreshCw, Loader2, Store, Terminal, Upload, Download } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { Crest } from "@/components/Crest";
import { useAuth, authHeader, formatApiErrorDetail } from "@/context/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIERS = ["Starter", "Pro", "Studio"];

const STATUS_META = {
  draft: { label: "Draft", color: "var(--pb-gray)" },
  provisioning: { label: "Provisioning", color: "var(--pb-gold)" },
  live: { label: "Live", color: "#4E8C5A" },
  failed: { label: "Failed", color: "#B4544E" },
};

// Post-launch checklist — mirrors docs/70-packaging-a-new-customer.md §4
const CHECKLIST = [
  ["setup_ran", "wp tsa setup ran"],
  ["branding", "Branding (logo/colors)"],
  ["domain", "Domain + SSL"],
  ["email_smtp", "Email / SMTP"],
  ["form_routing", "Form email routing"],
  ["woocommerce", "WooCommerce"],
  ["verified", "Pages verified"],
  ["cache_purged", "Cache purged"],
];

const STEPS = [
  { title: "Identity", hint: "Who this tenant is. Slug is auto-generated from the name — edit if you want.", fields: [
    { k: "name", label: "Business Name", type: "text", ph: "e.g. Tee Shirt Ali" },
    { k: "slug", label: "Slug", type: "slug", ph: "auto from name" },
    { k: "tier", label: "Tier (entitlements)", type: "select", opts: TIERS },
  ]},
  { title: "Brand", hint: "How the cloned site looks. Logo upload happens in WP → Platform → Branding — drop the file link here.", fields: [
    { k: "logo_data", label: "Logo", type: "logo" },
    { k: "primary_color", label: "Primary Color", type: "color", ph: "#123456" },
    { k: "secondary_color", label: "Secondary Color", type: "color", ph: "#cccccc" },
    { k: "tagline", label: "Tagline", type: "text", ph: "Custom apparel for …" },
    { k: "white_label_credit", label: "White-label Credit", type: "select", opts: ["Show credit", "Hide (white-label)"] },
  ]},
  { title: "Business Profile", hint: "Feeds the Contact page, footer, and policy pages (State sets governing law in Terms).", fields: [
    { k: "legal_name", label: "Legal Name", type: "text", ph: "New Co LLC" },
    { k: "email", label: "Owner Email", type: "text", ph: "owner@newco.com" },
    { k: "phone", label: "Phone", type: "text", ph: "(555) 123-4567" },
    { k: "city", label: "City", type: "text", ph: "Austin" },
    { k: "state", label: "State", type: "text", ph: "Texas" },
    { k: "service_area", label: "Service Area", type: "text", ph: "Serving Central Texas & nationwide" },
    { k: "hours", label: "Hours", type: "text", ph: "Mon–Fri 9–5" },
  ]},
  { title: "Web & Socials", hint: "The domain sets the WordPress address and appears in policies. Only the socials you set show in the footer.", fields: [
    { k: "website", label: "Domain", type: "text", ph: "newco.com" },
    { k: "instagram", label: "Instagram URL", type: "text", ph: "https://instagram.com/newco" },
    { k: "facebook", label: "Facebook URL", type: "text", ph: "https://facebook.com/newco" },
    { k: "tiktok", label: "TikTok URL", type: "text", ph: "https://tiktok.com/@newco" },
    { k: "notes", label: "Internal Notes", type: "textarea", ph: "Anything else for this build…" },
  ]},
];

const slugify = (s) => (s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Read an uploaded image, downscale to <=480px (keeps PNG transparency), return a data URL.
const readLogo = (file, cb) => {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 480;
      let { width, height } = img;
      if (width > max || height > max) {
        const scale = Math.min(max / width, max / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const c = document.createElement("canvas");
      c.width = width; c.height = height;
      c.getContext("2d").drawImage(img, 0, 0, width, height);
      try { cb(c.toDataURL("image/png")); } catch { cb(reader.result); }
    };
    img.onerror = () => cb(reader.result);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

const Field = ({ f, value, onChange }) => {
  if (f.type === "select") return (
    <select className="pb-input" value={value || ""} onChange={(e) => onChange(e.target.value)} data-testid={`prov-${f.k}`}>
      {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  if (f.type === "textarea") return <textarea className="pb-input" rows={3} value={value || ""} placeholder={f.ph} onChange={(e) => onChange(e.target.value)} data-testid={`prov-${f.k}`} />;
  if (f.type === "color") return (
    <div className="flex items-center gap-3">
      <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || "") ? value : "#c8a24a"} onChange={(e) => onChange(e.target.value)}
        style={{ width: 46, height: 40, background: "transparent", border: "1px solid var(--pb-border)", cursor: "pointer", padding: 2 }} data-testid={`prov-${f.k}-swatch`} />
      <input className="pb-input" value={value || ""} placeholder={f.ph} onChange={(e) => onChange(e.target.value)} style={{ flex: 1 }} data-testid={`prov-${f.k}`} />
    </div>
  );
  if (f.type === "logo") return (
    <div className="flex items-center gap-4 flex-wrap">
      <label className="pb-btn pb-btn-ghost" style={{ cursor: "pointer" }}>
        <Upload size={13} /> {value ? "Replace logo" : "Upload logo"}
        <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" style={{ display: "none" }}
          onChange={(e) => { const file = e.target.files?.[0]; if (file) readLogo(file, onChange); e.target.value = ""; }} data-testid={`prov-${f.k}`} />
      </label>
      {value && <img src={value} alt="logo preview" style={{ height: 52, width: 52, objectFit: "contain", border: "1px solid var(--pb-border)", background: "var(--pb-onyx)", padding: 5 }} />}
      {value && <button type="button" onClick={() => onChange("")} className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pb-gray)" }} data-testid={`prov-${f.k}-remove`}>Remove</button>}
    </div>
  );
  return <input className="pb-input" value={value || ""} placeholder={f.ph} onChange={(e) => onChange(e.target.value)} data-testid={`prov-${f.k}`} />;
};

const CommandBlock = ({ command, id }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(command); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <div style={{ marginTop: 16 }}>
      <div className="flex items-center justify-between mb-2">
        <span className="pb-mono" style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--pb-gray)" }}><Terminal size={11} style={{ display: "inline", marginRight: 6 }} />wp tsa setup</span>
        <button onClick={copy} className="pb-mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: copied ? "#4E8C5A" : "var(--pb-gold)", display: "flex", alignItems: "center", gap: 6 }} data-testid={`prov-copy-${id}`}>
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <pre className="pb-mono" style={{ fontSize: 12.5, lineHeight: 1.6, background: "var(--pb-onyx)", border: "1px solid var(--pb-border)", padding: "16px 18px", overflowX: "auto", whiteSpace: "pre", color: "var(--pb-gray-soft)" }}>{command}</pre>
      <p className="pb-body" style={{ fontSize: 12.5, color: "var(--pb-gray)", marginTop: 8 }}>Run on the tenant's WordPress host (after the site is stood up from the blueprint), then work the checklist.</p>
    </div>
  );
};

const TenantCard = ({ t, onPatch }) => {
  const meta = STATUS_META[t.status] || STATUS_META.draft;
  const done = CHECKLIST.filter(([k]) => t.checklist?.[k]).length;
  const toggle = (k) => onPatch(t.id, { checklist: { ...t.checklist, [k]: !t.checklist?.[k] } });
  return (
    <div className="pb-card" style={{ padding: "26px 28px" }} data-testid={`tenant-${t.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {t.logo_data && <img src={t.logo_data} alt="" style={{ height: 34, width: 34, objectFit: "contain", border: "1px solid var(--pb-border)", background: "var(--pb-onyx)", padding: 3 }} />}
          <span className="pb-serif" style={{ fontSize: 22 }}>{t.name}</span>
          <span className="pb-mono" style={{ fontSize: 11, color: "var(--pb-gray)" }}>/{t.slug}</span>
          <span className="pb-mono" style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", padding: "4px 9px", border: "1px solid var(--pb-border)", color: "var(--pb-gray-soft)" }}>{t.tier}</span>
        </div>
        <select value={t.status} onChange={(e) => onPatch(t.id, { status: e.target.value })} className="pb-mono"
          style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", padding: "6px 10px", background: "transparent", border: `1px solid ${meta.color}`, color: meta.color, cursor: "pointer" }}
          data-testid={`tenant-status-${t.id}`}>
          {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k} style={{ color: "#000" }}>{m.label}</option>)}
        </select>
      </div>

      <CommandBlock command={t.command} id={t.id} />

      {t.logo_data && (
        <a href={t.logo_data} download={`${t.slug}-logo.png`} className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pb-gold)", display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14 }} data-testid={`tenant-logo-dl-${t.id}`}>
          <Download size={12} /> Download logo
        </a>
      )}

      <div style={{ marginTop: 18, borderTop: "1px solid var(--pb-border-soft)", paddingTop: 16 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="pb-mono" style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--pb-gray)" }}>Post-launch checklist</span>
          <span className="pb-mono" style={{ fontSize: 10, color: done === CHECKLIST.length ? "#4E8C5A" : "var(--pb-gray)" }}>{done}/{CHECKLIST.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CHECKLIST.map(([k, label]) => {
            const on = !!t.checklist?.[k];
            return (
              <button key={k} type="button" onClick={() => toggle(k)} className="pb-mono transition-colors duration-300"
                style={{ fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 11px", display: "flex", alignItems: "center", gap: 6,
                  border: `1px solid ${on ? "#4E8C5A" : "var(--pb-border)"}`, background: on ? "rgba(78,140,90,0.12)" : "transparent", color: on ? "#4E8C5A" : "var(--pb-gray-soft)" }}
                data-testid={`tenant-${t.id}-check-${k}`}>
                {on ? <Check size={11} /> : <span style={{ width: 11, height: 11, border: "1px solid var(--pb-border)", display: "inline-block" }} />} {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function ProvisionTenant() {
  const { user } = useAuth();
  const [view, setView] = useState("board"); // "board" | "new"
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // wizard state
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ tier: "Starter", white_label_credit: "Show credit" });
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/tenants`, { headers: authHeader() });
      setTenants(data.tenants || []);
    } catch { setTenants([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user && user !== false) load(); }, [user]);

  if (user === null) return <div style={{ minHeight: "100vh" }} />;
  if (user === false) return <Navigate to="/admin/login" replace />;

  const setVal = (k, v) => {
    setAnswers((p) => {
      const next = { ...p, [k]: v };
      if (k === "name" && !slugEdited) next.slug = slugify(v);
      return next;
    });
    if (k === "slug") setSlugEdited(true);
  };

  const patch = async (id, body) => {
    // optimistic
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...body } : t)));
    try {
      const { data } = await axios.patch(`${API}/admin/tenants/${id}`, body, { headers: authHeader() });
      setTenants((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch { load(); }
  };

  const resetWizard = () => { setStep(0); setAnswers({ tier: "Starter", white_label_credit: "Show credit" }); setSlugEdited(false); setError(""); };

  const submit = async () => {
    setSaving(true); setError("");
    try {
      await axios.post(`${API}/admin/tenants`, answers, { headers: authHeader() });
      resetWizard();
      setView("board");
      await load();
    } catch (e) {
      setError(formatApiErrorDetail(e?.response?.data?.detail));
    } finally { setSaving(false); }
  };

  const s = STEPS[step];
  const pct = Math.round(((step + 1) / STEPS.length) * 100);
  const slugPreview = slugify(answers.slug || answers.name || "");

  return (
    <section className="pb-sec-black" style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 90 }}>
      <div className="pb-container">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4"><Crest size={34} /><span className="pb-mono" style={{ fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase" }}>Parabellum · Provisioning</span></div>
            <Eyebrow>Tenant Cockpit</Eyebrow>
            <h1 className="pb-h2 mt-5" style={{ fontSize: 48 }}>{view === "new" ? "New store." : "Stores."}</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/admin" className="pb-btn pb-btn-ghost"><ArrowLeft size={13} /> Admin</Link>
            {view === "board"
              ? <><button onClick={load} className="pb-btn pb-btn-ghost" data-testid="prov-refresh"><RefreshCw size={13} /> Refresh</button>
                  <button onClick={() => { resetWizard(); setView("new"); }} className="pb-btn pb-btn-gold" data-testid="prov-new"><Plus size={13} /> New Store</button></>
              : <button onClick={() => setView("board")} className="pb-btn pb-btn-ghost" data-testid="prov-cancel">Cancel</button>}
          </div>
        </div>

        {view === "board" ? (
          loading ? (
            <div className="flex items-center gap-3 mt-16 pb-body"><Loader2 size={18} className="animate-spin" color="var(--pb-gold)" /> Loading stores…</div>
          ) : tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: "80px 0" }} data-testid="prov-empty">
              <Store size={40} color="var(--pb-gray)" strokeWidth={1.2} />
              <p className="pb-body mt-5" style={{ fontSize: 17 }}>No stores yet. Provision your first tenant.</p>
              <button onClick={() => { resetWizard(); setView("new"); }} className="pb-btn pb-btn-gold mt-6" data-testid="prov-new-empty"><Plus size={13} /> New Store</button>
            </div>
          ) : (
            <div className="grid gap-6 mt-10" data-testid="prov-list">
              {tenants.map((t, i) => <Reveal key={t.id} delay={Math.min(i * 0.04, 0.3)}><TenantCard t={t} onPatch={patch} /></Reveal>)}
            </div>
          )
        ) : (
          <div style={{ maxWidth: 760, marginTop: 40 }}>
            <div className="flex items-center justify-between mb-4">
              <span className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.24em" }}>{`STEP ${step + 1} / ${STEPS.length}`}</span>
              <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.24em", color: "var(--pb-gray)" }}>{pct}%</span>
            </div>
            <div style={{ height: 2, background: "var(--pb-border-soft)" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "var(--pb-gold)", transition: "width .4s ease" }} />
            </div>

            <div key={step} style={{ marginTop: 40 }}>
              <Reveal>
                <Eyebrow>{`Step ${step + 1}`}</Eyebrow>
                <h2 className="pb-h3 mt-5" style={{ fontSize: 32 }}>{s.title}</h2>
                <p className="pb-body mt-3" style={{ fontSize: 14, color: "var(--pb-gray)" }}>{s.hint}</p>
                <div className="flex flex-col gap-7 mt-9">
                  {s.fields.map((f) => (
                    <div key={f.k}>
                      <label className="pb-label">{f.label}</label>
                      <Field f={f} value={answers[f.k]} onChange={(v) => setVal(f.k, v)} />
                      {f.type === "slug" && slugPreview && <p className="pb-mono" style={{ fontSize: 10, color: "var(--pb-gray)", marginTop: 6 }}>→ /{slugPreview}</p>}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {error && <p className="pb-body mt-8" style={{ fontSize: 14, color: "#B4544E" }} data-testid="prov-error">{error}</p>}

            <div className="flex justify-between mt-12">
              <button className="pb-btn pb-btn-ghost" disabled={step === 0} onClick={() => setStep((x) => x - 1)} style={{ opacity: step === 0 ? 0.4 : 1 }} data-testid="prov-back"><ArrowLeft size={13} /> Back</button>
              {step < STEPS.length - 1 ? (
                <button className="pb-btn pb-btn-gold" onClick={() => setStep((x) => x + 1)} disabled={step === 0 && !answers.name} style={{ opacity: step === 0 && !answers.name ? 0.5 : 1 }} data-testid="prov-next">Next <ArrowRight size={13} /></button>
              ) : (
                <button className="pb-btn pb-btn-gold" onClick={submit} disabled={saving || !answers.name} style={{ opacity: saving || !answers.name ? 0.7 : 1 }} data-testid="prov-submit">
                  {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <>Create Store <ArrowRight size={13} /></>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
