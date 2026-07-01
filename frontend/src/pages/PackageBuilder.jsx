import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, ArrowRight, Plus, MessageCircleQuestion, Loader2, PartyPopper, Star } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { PageHero } from "@/components/Sections";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const money = (n) => `$${Number(n).toLocaleString("en-US")}`;

export default function PackageBuilder() {
  const [catalog, setCatalog] = useState(null);
  const [mode, setMode] = useState("flat"); // flat | revshare
  const [tier, setTier] = useState("operator");
  const [addons, setAddons] = useState([]);
  const [panel, setPanel] = useState(null); // null | 'quote' | 'buy'
  const [form, setForm] = useState({ name: "", email: "", org: "", question: "" });
  const [submitting, setSubmitting] = useState(false);
  const [quoted, setQuoted] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => { axios.get(`${API}/packages`).then(({ data }) => setCatalog(data)).catch(() => {}); }, []);

  if (!catalog) return <div style={{ minHeight: "100vh" }} className="pb-sec-black" />;

  const tiers = catalog.tiers;
  const addonMap = catalog.addons;
  const toggleAddon = (k) => setAddons((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const t = tiers[tier];
  const base = t[mode];
  const quoteAddonSelected = addons.some((k) => addonMap[k]?.quote);
  const setupTotal = base.setup + addons.reduce((s, k) => s + (addonMap[k]?.quote ? 0 : addonMap[k]?.setup || 0), 0);
  const monthlyTotal = base.monthly + addons.reduce((s, k) => s + (addonMap[k]?.quote ? 0 : addonMap[k]?.monthly || 0), 0);
  const revshare = mode === "revshare" ? t.revshare : null;
  const buyable = !t.custom && !quoteAddonSelected;

  const setField = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submitQuote = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/packages/quote`, { ...form, tier, addons, mode });
      setQuoted(true);
    } catch { toast.error("Something went wrong. Please try again."); }
    finally { setSubmitting(false); }
  };

  if (paid) return <PaidScreen tier={t.name} setup={setupTotal} monthly={monthlyTotal} onReset={() => { setPaid(false); setPanel(null); }} />;

  return (
    <>
      <PageHero
        eyebrow="Build Your Package · Tee Shirt Ali–Style Site"
        title="Configure your merch-tech site."
        sub="Pick a tier, choose flat or revenue-share billing, add functionality, and see your investment update live. Ready? Check out with PayPal. Questions first? Request a quote."
      />

      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <div className="pb-container">
          {/* Billing mode toggle */}
          <div className="flex items-center gap-3 mb-10">
            <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--pb-gray)" }}>Billing:</span>
            {[["flat", "Flat Monthly"], ["revshare", "Revenue Share"]].map(([k, l]) => (
              <button key={k} onClick={() => setMode(k)} data-testid={`mode-${k}`} className="pb-mono"
                style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", padding: "9px 16px",
                  border: `1px solid ${mode === k ? "var(--pb-gold)" : "var(--pb-border)"}`,
                  background: mode === k ? "var(--pb-gold-muted)" : "transparent",
                  color: mode === k ? "var(--pb-gold)" : "var(--pb-gray-soft)" }}>{l}</button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-12 items-start">
            {/* LEFT */}
            <div>
              <Eyebrow>Step 1 · Choose a tier</Eyebrow>
              <div className="grid md:grid-cols-3 gap-5 mt-8">
                {Object.entries(tiers).map(([key, tv]) => {
                  const active = tier === key;
                  const b = tv[mode];
                  const rs = mode === "revshare" ? tv.revshare : null;
                  return (
                    <button key={key} onClick={() => setTier(key)} data-testid={`tier-${key}`}
                      className="text-left transition-all duration-300 relative"
                      style={{ padding: "28px 24px", background: active ? "var(--pb-onyx)" : "var(--pb-charcoal)",
                        border: `1.5px solid ${active ? "var(--pb-gold)" : "var(--pb-border)"}` }}>
                      {tv.popular && (
                        <span className="pb-mono flex items-center gap-1" style={{ position: "absolute", top: -10, right: 14, fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", background: "var(--pb-gold)", color: "var(--pb-black)", padding: "3px 8px" }}>
                          <Star size={9} /> Most Popular
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase" }}>{tv.name}</span>
                        {active && <Check size={16} color="var(--pb-gold)" />}
                      </div>
                      <div className="pb-serif mt-4" style={{ fontSize: 30, fontWeight: 300, lineHeight: 1 }}>{tv.from ? "from " : ""}{money(b.setup)}</div>
                      <div className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--pb-gray)" }}>SETUP</div>
                      <div className="pb-serif pb-gold-text mt-2" style={{ fontSize: 18 }}>{tv.from ? "from " : ""}{money(b.monthly)}<span style={{ fontSize: 13, color: "var(--pb-gray)" }}> /mo</span></div>
                      {rs && <div className="pb-mono pb-gold-text mt-1" style={{ fontSize: 10, letterSpacing: "0.1em" }}>+ {rs.pct}% of drop revenue</div>}
                      <p className="pb-body mt-4" style={{ fontSize: 13.5 }}>{tv.best_for}</p>
                      <div className="pb-mono mt-2" style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--pb-gray)" }}>{tv.contract}</div>
                      <ul className="mt-4 flex flex-col gap-2">
                        {tv.includes.slice(0, 6).map((i) => (
                          <li key={i} className="flex items-start gap-2 pb-body" style={{ fontSize: 13 }}>
                            <Check size={12} color="var(--pb-gold)" className="mt-1 shrink-0" /> {i}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <div className="mt-14">
                <Eyebrow>Step 2 · Add-ons (any tier)</Eyebrow>
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  {Object.entries(addonMap).map(([key, av]) => {
                    const on = addons.includes(key);
                    return (
                      <button key={key} onClick={() => toggleAddon(key)} data-testid={`addon-${key}`}
                        className="flex items-center justify-between text-left transition-all duration-300"
                        style={{ padding: "18px 20px", background: on ? "var(--pb-gold-muted)" : "var(--pb-onyx)",
                          border: `1px solid ${on ? "var(--pb-gold)" : "var(--pb-border-soft)"}` }}>
                        <div>
                          <div className="pb-serif" style={{ fontSize: 18 }}>{av.label}</div>
                          <div className="pb-mono mt-1" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--pb-gray)" }}>
                            {av.quote ? "Quote-only" : `${av.setup ? `+${money(av.setup)} setup · ` : ""}${av.monthly ? `+${money(av.monthly)}/mo` : "one-time"}`}{av.note ? ` · ${av.note}` : ""}
                          </div>
                        </div>
                        <span style={{ color: on ? "var(--pb-gold)" : "var(--pb-gray)" }}>{on ? <Check size={18} /> : <Plus size={18} />}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT summary */}
            <div style={{ position: "sticky", top: 100 }}>
              <div style={{ border: "1px solid var(--pb-gold)", background: "var(--pb-onyx)", padding: 32 }} data-testid="package-summary">
                <Eyebrow>Your Package</Eyebrow>
                <div className="pb-serif mt-5" style={{ fontSize: 26 }}>{t.name}<span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--pb-gray)", marginLeft: 10 }}>{mode === "revshare" ? "REV-SHARE" : "FLAT"}</span></div>
                {addons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {addons.map((k) => <span key={k} className="pb-mono" style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 8px", border: "1px solid var(--pb-border)", color: "var(--pb-gray-soft)" }}>{addonMap[k].label}</span>)}
                  </div>
                )}
                <div className="pb-hairline my-6" style={{ background: "var(--pb-border-soft)" }} />
                <div className="flex justify-between items-baseline">
                  <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--pb-gray)" }}>SETUP</span>
                  <span className="pb-serif pb-gold-text" style={{ fontSize: 34, fontWeight: 300 }} data-testid="summary-setup">{t.from ? "from " : ""}{money(setupTotal)}</span>
                </div>
                <div className="flex justify-between items-baseline mt-3">
                  <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--pb-gray)" }}>MONTHLY</span>
                  <span className="pb-serif pb-gold-text" style={{ fontSize: 24, fontWeight: 300 }} data-testid="summary-monthly">{t.from ? "from " : ""}{money(monthlyTotal)}<span style={{ fontSize: 13, color: "var(--pb-gray)" }}> /mo</span></span>
                </div>
                {revshare && (
                  <div className="flex justify-between items-baseline mt-2">
                    <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--pb-gray)" }}>REVENUE SHARE</span>
                    <span className="pb-serif pb-gold-text" style={{ fontSize: 18 }}>{revshare.pct}% <span style={{ fontSize: 12, color: "var(--pb-gray)" }}>· min {money(revshare.min)}/mo</span></span>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-8">
                  {buyable && (
                    <button className="pb-btn pb-btn-gold justify-center" onClick={() => setPanel("buy")} data-testid="open-buy">
                      Buy Now — Pay Setup Fee <ArrowRight size={13} />
                    </button>
                  )}
                  <button className="pb-btn pb-btn-ghost justify-center" onClick={() => { setPanel("quote"); setQuoted(false); }} data-testid="open-quote">
                    {buyable ? "Request Quote / Ask a Question" : "Request a Quote"} <MessageCircleQuestion size={14} />
                  </button>
                </div>
                <p className="pb-mono mt-5" style={{ fontSize: 9.5, letterSpacing: "0.08em", color: "var(--pb-gray)", lineHeight: 1.6 }}>
                  {t.custom
                    ? "Command is scoped per engagement — request a quote for exact pricing."
                    : quoteAddonSelected
                      ? "Your selection includes a quote-only add-on — request a quote to finalize."
                      : "Setup fee paid today. Monthly billing begins at launch. Estimates confirmed on your agreement."}
                </p>
              </div>

              {panel === "quote" && (
                <div style={{ border: "1px solid var(--pb-border)", background: "var(--pb-charcoal)", padding: 28, marginTop: 20 }} data-testid="quote-panel">
                  {quoted ? (
                    <div className="text-center" style={{ padding: "20px 0" }}>
                      <Check size={30} color="var(--pb-gold)" />
                      <p className="pb-body mt-4" style={{ fontSize: 17 }}>Quote request sent. We'll follow up shortly with answers and next steps.</p>
                    </div>
                  ) : (
                    <form onSubmit={submitQuote} className="flex flex-col gap-4">
                      <div><label className="pb-label">Name</label><input className="pb-input" required value={form.name} onChange={setField("name")} data-testid="quote-name" /></div>
                      <div><label className="pb-label">Email</label><input className="pb-input" type="email" required value={form.email} onChange={setField("email")} data-testid="quote-email" /></div>
                      <div><label className="pb-label">Organization</label><input className="pb-input" value={form.org} onChange={setField("org")} data-testid="quote-org" /></div>
                      <div><label className="pb-label">Your Question</label><textarea className="pb-input" rows={3} value={form.question} onChange={setField("question")} placeholder="What would you like to know?" data-testid="quote-question" /></div>
                      <button type="submit" className="pb-btn pb-btn-gold justify-center" disabled={submitting} data-testid="quote-submit">
                        {submitting ? <><Loader2 size={13} className="animate-spin" /> Sending…</> : <>Send Request</>}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {panel === "buy" && buyable && (
                <div style={{ border: "1px solid var(--pb-border)", background: "var(--pb-charcoal)", padding: 28, marginTop: 20 }} data-testid="buy-panel">
                  <label className="pb-label">Email for receipt</label>
                  <input className="pb-input" type="email" value={form.email} onChange={setField("email")} placeholder="you@email.com" data-testid="buy-email" />
                  <div className="pb-body mt-4" style={{ fontSize: 15 }}>Paying today: <span className="pb-gold-text">{money(setupTotal)}</span> setup fee.</div>
                  <div className="mt-5">
                    {catalog.paypal_enabled ? (
                      <PayPalScriptProvider options={{ clientId: catalog.paypal_client_id, currency: "USD" }}>
                        <PayPalButtons
                          style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                          createOrder={async () => {
                            const { data } = await axios.post(`${API}/packages/paypal/order`, { tier, addons, mode, email: form.email || null });
                            return data.order_id;
                          }}
                          onApprove={async (data) => {
                            const { data: res } = await axios.post(`${API}/packages/paypal/capture/${data.orderID}`);
                            if (res.status === "COMPLETED") setPaid(true);
                            else toast.error("Payment not completed. Please try again.");
                          }}
                          onError={() => toast.error("PayPal error. Please try again.")}
                        />
                      </PayPalScriptProvider>
                    ) : (
                      <div className="pb-body" style={{ fontSize: 14, border: "1px solid var(--pb-border-soft)", padding: 16 }} data-testid="paypal-disabled">
                        Online PayPal checkout isn't switched on yet. Use <button className="pb-gold-text" style={{ textDecoration: "underline" }} onClick={() => { setPanel("quote"); setQuoted(false); }}>Request a Quote</button> and we'll send a secure PayPal invoice.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const PaidScreen = ({ tier, setup, monthly, onReset }) => (
  <section className="pb-sec-black" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 120, paddingBottom: 80 }}>
    <div className="pb-container text-center" data-testid="paid-screen">
      <Reveal>
        <PartyPopper size={44} color="var(--pb-gold)" style={{ margin: "0 auto" }} />
        <Eyebrow className="justify-center mt-6">Payment Received</Eyebrow>
        <h1 className="pb-h2 mt-6" style={{ maxWidth: 720, marginInline: "auto" }}>Your {tier} build is a go.</h1>
        <p className="pb-body mt-6" style={{ maxWidth: 540, marginInline: "auto" }}>
          Setup fee of {money(setup)} paid. Monthly billing ({money(monthly)}/mo) begins at launch. An operator will reach out within one business day to kick off your build.
        </p>
        <button className="pb-btn pb-btn-ghost mt-10" onClick={onReset} data-testid="paid-reset">Configure another package</button>
      </Reveal>
    </div>
  </section>
);
