import { useState } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, RotateCcw, Loader2, Sparkles } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { PageHero } from "@/components/Sections";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEPS = [
  { title: "Organization Profile", fields: [
    { k: "orgName", label: "Organization Name", type: "text", ph: "e.g. Westfield High Boosters" },
    { k: "orgType", label: "Organization Type", type: "select", opts: ["School / K-12", "Sports / Booster Club", "Creator", "Business"] },
    { k: "memberBase", label: "Member Base Size", type: "select", opts: ["< 100", "100–500", "500–2,000", "2,000+"] },
  ]},
  { title: "Store Purpose & Goals", fields: [
    { k: "goals", label: "Primary Goals", type: "multi", opts: ["Fundraising", "Spirit Wear", "Uniforms", "Events", "Swag", "Fan Monetization"] },
    { k: "windowType", label: "Order Window Type", type: "select", opts: ["Always open", "Scheduled windows", "One-time drop"] },
    { k: "volume", label: "Estimated Annual Volume", type: "select", opts: ["< 250 units", "250–1,000", "1,000–5,000", "5,000+"] },
  ]},
  { title: "Products & Customization", fields: [
    { k: "products", label: "Product Categories", type: "multi", opts: ["Tees", "Hoodies", "Hats", "Bags", "Drinkware", "Accessories"] },
    { k: "printMethod", label: "Print Method", type: "select", opts: ["DTF", "Screen Print", "Embroidery", "Mixed / Not sure"] },
    { k: "personalization", label: "Personalization", type: "select", opts: ["None", "Names & numbers", "Full custom per order"] },
  ]},
  { title: "Store Architecture", fields: [
    { k: "access", label: "Access Model", type: "select", opts: ["Public", "Access code", "Login required", "Invite only"] },
    { k: "payment", label: "Payment Types", type: "multi", opts: ["Card", "Apple/Google Pay", "PO / Invoice", "Split fundraising"] },
    { k: "fulfillment", label: "Fulfillment", type: "select", opts: ["Ship to buyer", "Bulk to org", "Local pickup"] },
  ]},
  { title: "Branding & Design", fields: [
    { k: "logoStatus", label: "Logo Status", type: "select", opts: ["Have final files", "Need vectorizing", "Need design help"] },
    { k: "brandGuide", label: "Brand Guide Level", type: "select", opts: ["Full guide", "Colors & logo only", "Nothing yet"] },
    { k: "designSupport", label: "Design Support Needed", type: "select", opts: ["Full service", "Mockups only", "Self-serve"] },
  ]},
  { title: "Technology & Integrations", fields: [
    { k: "platform", label: "Existing Site Platform", type: "select", opts: ["None", "WordPress", "Shopify", "Squarespace", "Other"] },
    { k: "deploy", label: "Deployment Preference", type: "select", opts: ["Subdomain store", "Embedded on my site", "Standalone"] },
    { k: "integrations", label: "Integrations Needed", type: "multi", opts: ["Email marketing", "Accounting", "CRM", "Analytics"] },
  ]},
  { title: "Automation & Operations", fields: [
    { k: "automation", label: "Automations to Enable", type: "multi", opts: ["Auto-fulfill", "Auto window close", "Auto emails", "Auto invoice", "Analytics", "Admin portal"] },
  ]},
  { title: "Budget & Timeline", fields: [
    { k: "timeline", label: "Launch Timeline", type: "select", opts: ["ASAP (< 2 weeks)", "This month", "This quarter", "Exploring"] },
    { k: "budget", label: "Investment Range", type: "select", opts: ["< $2K", "$2K–$5K", "$5K–$15K", "$15K+"] },
    { k: "management", label: "Management Preference", type: "select", opts: ["Fully managed", "Co-managed", "Self-managed"] },
    { k: "notes", label: "Extra Notes", type: "textarea", ph: "Anything else we should know…" },
  ]},
];

const Field = ({ f, value, onChange }) => {
  if (f.type === "select") return (
    <select className="pb-input" value={value || ""} onChange={(e) => onChange(e.target.value)} data-testid={`wizard-${f.k}`}>
      <option value="">Select…</option>
      {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  if (f.type === "textarea") return <textarea className="pb-input" rows={4} value={value || ""} placeholder={f.ph} onChange={(e) => onChange(e.target.value)} data-testid={`wizard-${f.k}`} />;
  if (f.type === "multi") {
    const arr = value || [];
    return (
      <div className="flex flex-wrap gap-3">
        {f.opts.map((o) => {
          const on = arr.includes(o);
          return (
            <button type="button" key={o} onClick={() => onChange(on ? arr.filter((x) => x !== o) : [...arr, o])}
              className="pb-mono transition-colors duration-300"
              style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", padding: "10px 16px",
                border: `1px solid ${on ? "var(--pb-gold)" : "var(--pb-border)"}`, background: on ? "var(--pb-gold-muted)" : "transparent",
                color: on ? "var(--pb-gold)" : "var(--pb-gray-soft)" }}
              data-testid={`wizard-${f.k}-${o.replace(/[^a-z]/gi, "").toLowerCase()}`}>
              {o}
            </button>
          );
        })}
      </div>
    );
  }
  return <input className="pb-input" value={value || ""} placeholder={f.ph} onChange={(e) => onChange(e.target.value)} data-testid={`wizard-${f.k}`} />;
};

const buildDoc = (a) => {
  const j = (v) => (Array.isArray(v) ? v.join(", ") : v) || "—";
  return [
    { h: "Executive Summary", b: `${j(a.orgName)} is a ${j(a.orgType)} with a ${j(a.memberBase)} member base seeking a merchandise platform focused on ${j(a.goals)}. This strategy outlines a ${j(a.windowType)} store architecture engineered for ~${j(a.volume)} annually, fully operator-owned.` },
    { h: "Platform Architecture", b: `Recommended build: WordPress + WooCommerce on the Flatsome framework${a.platform && a.platform !== "None" ? `, integrated with your existing ${j(a.platform)} presence via ${j(a.deploy)}` : ` deployed as a ${j(a.deploy)}`}. Access model: ${j(a.access)}.` },
    { h: "Store Configuration", b: `Order windows: ${j(a.windowType)}. Payment methods: ${j(a.payment)}. Fulfillment: ${j(a.fulfillment)}. Access control tuned to a ${j(a.access)} model.` },
    { h: "Product Catalog", b: `Categories: ${j(a.products)}. Print method: ${j(a.printMethod)}. Personalization: ${j(a.personalization)}.` },
    { h: "Design & Brand Brief", b: `Logo status: ${j(a.logoStatus)}. Brand guidance: ${j(a.brandGuide)}. Design support: ${j(a.designSupport)}.` },
    { h: "Integrations Map", b: `Requested integrations: ${j(a.integrations)}. These wire into the store via REST APIs and n8n workflows.` },
    { h: "Automation Workflows", b: `Enabled automations: ${j(a.automation)}. Each runs server-side to remove manual operations.` },
    { h: "Recommended Plugins", b: "WooCommerce, Flatsome, YITH Countdown Timer, WooCommerce Password Protected Categories, CartFlows, Mailchimp for WP, WP Rocket, Yoast SEO." },
    { h: "Timeline & Milestones", b: `Target: ${j(a.timeline)}. Phase 1 — architecture & design. Phase 2 — store & automation build. Phase 3 — launch & first window.` },
    { h: "Investment Estimate", b: `Indicative range: ${j(a.budget)} for initial build. Management model: ${j(a.management)}.` },
    { h: "Next Steps", b: "1) Confirm scope. 2) Deliver assets & brand files. 3) Approve architecture. 4) Build & QA. 5) Schedule first drop window." },
    ...(a.notes ? [{ h: "Operator Notes", b: a.notes }] : []),
  ];
};

export default function TeamStoreWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);
  const s = STEPS[step];
  const setVal = (k, v) => setAnswers((p) => ({ ...p, [k]: v }));
  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/wizard/strategy`, { answers });
      if (data?.sections?.length) {
        setDoc(data.sections);
        setAiPowered(true);
      } else {
        throw new Error("empty");
      }
    } catch {
      setDoc(buildDoc(answers));
      setAiPowered(false);
    } finally {
      setLoading(false);
    }
  };

  if (doc) {
    return (
      <>
        <PageHero eyebrow={aiPowered ? "AI · Platform Strategy Document" : "Platform Strategy Document"} title={`Strategy for ${answers.orgName || "your program"}.`} sub="Generated from your inputs. This is the blueprint we'd build against — copy it, share it, or send it to us to start." />
        <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 110 }}>
          <div className="pb-container" style={{ maxWidth: 820 }}>
            <div className="flex flex-wrap gap-4 mb-10 items-center">
              <button className="pb-btn pb-btn-ghost" onClick={() => { setDoc(null); setStep(0); setAnswers({}); setAiPowered(false); }} data-testid="wizard-restart"><RotateCcw size={13} /> Start Over</button>
              <a href="/request-a-launch" className="pb-btn pb-btn-gold">Build this with us <ArrowRight size={13} /></a>
              {aiPowered && <span className="pb-mono pb-gold-text flex items-center gap-2" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}><Sparkles size={13} /> AI-generated</span>}
            </div>
            <div style={{ border: "1px solid var(--pb-border)", background: "var(--pb-onyx)", padding: 40 }} data-testid="wizard-document">
              {doc.map((sec, i) => (
                <Reveal key={sec.h} delay={i * 0.04}>
                  <div style={{ marginBottom: 28 }}>
                    <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase" }}>{`${String(i + 1).padStart(2, "0")} · ${sec.h}`}</div>
                    <p className="pb-body mt-3" style={{ fontSize: 17 }}>{sec.b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow="Team Store Strategy Wizard" title="Eight steps to a platform blueprint." sub="Answer a few questions about your program. Our AI assembles a complete, custom platform strategy document you can act on immediately." />
      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <div className="pb-container" style={{ maxWidth: 760 }}>
          <div className="flex items-center justify-between mb-4">
            <span className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.24em" }}>{`STEP ${step + 1} / ${STEPS.length}`}</span>
            <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.24em", color: "var(--pb-gray)" }}>{pct}%</span>
          </div>
          <div style={{ height: 2, background: "var(--pb-border-soft)" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "var(--pb-gold)", transition: "width .4s ease" }} />
          </div>

          <div key={step} style={{ marginTop: 44 }}>
            <Reveal>
              <Eyebrow>{`Step ${step + 1}`}</Eyebrow>
              <h2 className="pb-h3 mt-5" style={{ fontSize: 34 }}>{s.title}</h2>
              <div className="flex flex-col gap-7 mt-10">
                {s.fields.map((f) => (
                  <div key={f.k}>
                    <label className="pb-label">{f.label}</label>
                    <Field f={f} value={answers[f.k]} onChange={(v) => setVal(f.k, v)} />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="flex justify-between mt-12">
            <button className="pb-btn pb-btn-ghost" disabled={step === 0} onClick={() => setStep((x) => x - 1)} style={{ opacity: step === 0 ? 0.4 : 1 }} data-testid="wizard-back"><ArrowLeft size={13} /> Back</button>
            {step < STEPS.length - 1 ? (
              <button className="pb-btn pb-btn-gold" onClick={() => setStep((x) => x + 1)} data-testid="wizard-next">Next <ArrowRight size={13} /></button>
            ) : (
              <button className="pb-btn pb-btn-gold" onClick={generate} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }} data-testid="wizard-generate">
                {loading ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : <>Generate Strategy <Sparkles size={13} /></>}
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
