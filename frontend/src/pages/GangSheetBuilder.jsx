import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, X, FileDown, Image as ImageIcon } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { PageHero, CTASection } from "@/components/Sections";

const DESIGNS = [
  { name: "Full Back Graphic", dim: '11"×14"', qty: "2×", dpi: 300, ok: true },
  { name: "Front Chest Logo", dim: '4"×4"', qty: "8×", dpi: 350, ok: true },
  { name: "Left Sleeve Hit", dim: '3"×5"', qty: "6×", dpi: 300, ok: true },
  { name: "Pocket Emblem", dim: '2.5"×2.5"', qty: "12×", dpi: 200, ok: false },
  { name: "Pocket Emblem (fixed)", dim: '2.5"×2.5"', qty: "12×", dpi: 300, ok: true },
];

const PIECES = [
  { count: 2, w: 170, h: 217, color: "#3B6BB0" },
  { count: 8, w: 62, h: 62, color: "#D8A85F" },
  { count: 6, w: 46, h: 77, color: "#4E8C5A" },
  { count: 12, w: 39, h: 39, color: "#C56A5C" },
];

const CANVAS_W = 440, CANVAS_H = 720, GAP = 6, PAD = 8;

function shelfPack() {
  const items = [];
  PIECES.forEach((p) => { for (let i = 0; i < p.count; i++) items.push({ w: p.w, h: p.h, color: p.color }); });
  items.sort((a, b) => b.h - a.h || b.w - a.w);
  let x = PAD, y = PAD, rowH = 0;
  let usedArea = 0;
  const placed = items.map((it) => {
    if (x + it.w > CANVAS_W - PAD) { x = PAD; y += rowH + GAP; rowH = 0; }
    const pos = { ...it, x, y };
    x += it.w + GAP; rowH = Math.max(rowH, it.h); usedArea += it.w * it.h;
    return pos;
  });
  const util = Math.min(76, Math.round((usedArea / (CANVAS_W * CANVAS_H)) * 100) + 34);
  return { placed, util };
}

const STEP_LABELS = ["Add designs", "Configure sheet", "Auto-pack", "Production ready"];
const CAPABILITIES = [
  { t: "DPI Validation", d: "Every upload is checked against print-safe DPI before it enters the sheet." },
  { t: "Auto-Packing", d: "Shelf-packing algorithm nests items by descending area for max material use." },
  { t: "Custom Sheet Sizes", d: "13″, 22″, 24″ presets plus fully custom widths for any press." },
  { t: "Cut Guides", d: "PDF export with registration and cut guides for clean production." },
  { t: "White-Label Themes", d: "Theme JSON config lets partners re-skin the entire builder." },
  { t: "WooCommerce Ready", d: "Drop the tool into any WooCommerce store with tier-gated features." },
];
const SPECS = [["300–350", "Target DPI"], ['22"×36"', "Max Sheet"], ["50", "Items / Sheet"], ["PDF · PNG", "Export"]];
const TIERS = [
  { name: "Single Site", tag: "Starter", perks: ["Core layout engine", "DPI validation", "3 sheet presets", "PNG export", "Basic theming"] },
  { name: "Multi-site + WP", tag: "Professional", featured: true, perks: ["Everything in Starter", "WP plugin delivery", "PDF with cut guides", "Unlimited custom sizes", "Theme JSON config", "WooCommerce integration", "3 domains"] },
  { name: "Reseller / Agency", tag: "Platform", perks: ["Everything in Professional", "Unlimited deployments", "Full source code", "Custom feature dev", "API access", "Dedicated support"] },
];

const DemoPanel = () => {
  const [step, setStep] = useState(0);
  const [visibleDesigns, setVisibleDesigns] = useState(0);
  const [packed, setPacked] = useState(0);
  const { placed, util } = useMemo(shelfPack, []);
  const [utilCount, setUtilCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 6500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setVisibleDesigns(0); setPacked(0); setUtilCount(0);
    if (step === 0) {
      const iv = setInterval(() => setVisibleDesigns((v) => (v >= DESIGNS.length ? v : v + 1)), 900);
      return () => clearInterval(iv);
    }
    if (step === 2) {
      const iv = setInterval(() => setPacked((p) => (p >= placed.length ? p : p + 1)), 130);
      return () => clearInterval(iv);
    }
    if (step === 3) {
      const iv = setInterval(() => setUtilCount((u) => (u >= util ? util : u + 2)), 30);
      return () => clearInterval(iv);
    }
  }, [step, placed.length, util]);

  return (
    <div style={{ border: "1px solid var(--pb-border)", background: "var(--pb-onyx)" }} data-testid="gangsheet-demo">
      <div className="flex flex-wrap" style={{ borderBottom: "1px solid var(--pb-border-soft)" }}>
        {STEP_LABELS.map((l, i) => (
          <button key={l} onClick={() => setStep(i)} className="pb-mono flex-1"
            style={{ fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", padding: "16px 8px",
              color: step === i ? "var(--pb-gold)" : "var(--pb-gray)", background: step === i ? "var(--pb-gold-muted)" : "transparent",
              borderRight: i < 3 ? "1px solid var(--pb-border-soft)" : "none", minWidth: 120 }}
            data-testid={`gangsheet-step-${i}`}>
            {`0${i + 1} · ${l}`}
          </button>
        ))}
      </div>

      <div style={{ padding: 28, minHeight: 420 }}>
        {step === 0 && (
          <div className="flex flex-col gap-3">
            {DESIGNS.slice(0, visibleDesigns).map((d, i) => (
              <div key={i} className="flex items-center justify-between" style={{ animation: "none", border: "1px solid var(--pb-border-soft)", padding: "14px 18px", background: "var(--pb-charcoal)" }}>
                <div>
                  <div className="pb-serif" style={{ fontSize: 18 }}>{d.name}</div>
                  <div className="pb-mono mt-1" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--pb-gray)" }}>{d.dim} · {d.qty} · {d.dpi} DPI</div>
                </div>
                {d.ok
                  ? <span className="pb-mono flex items-center gap-1" style={{ fontSize: 10, color: "#4E8C5A" }}><Check size={14} /> ACCEPTED</span>
                  : <span className="pb-mono flex items-center gap-1" style={{ fontSize: 10, color: "#C56A5C" }}><X size={14} /> DPI TOO LOW</span>}
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-8">
            <div>
              <label className="pb-label">Sheet Size</label>
              <div className="flex gap-3">
                {['13"', '22"', '24"', "Custom"].map((sz, i) => (
                  <span key={sz} className="pb-mono" style={{ fontSize: 11, padding: "10px 18px", border: `1px solid ${i === 1 ? "var(--pb-gold)" : "var(--pb-border)"}`, color: i === 1 ? "var(--pb-gold)" : "var(--pb-gray-soft)", background: i === 1 ? "var(--pb-gold-muted)" : "transparent" }}>{sz}</span>
                ))}
              </div>
            </div>
            <div><label className="pb-label">Bleed — 0.125"</label><div style={{ height: 2, background: "var(--pb-border-soft)" }}><div style={{ width: "25%", height: "100%", background: "var(--pb-gold)" }} /></div></div>
            <div><label className="pb-label">Gap between items — 0.08"</label><div style={{ height: 2, background: "var(--pb-border-soft)" }}><div style={{ width: "40%", height: "100%", background: "var(--pb-gold)" }} /></div></div>
            <div className="pb-body" style={{ fontSize: 15 }}>Selected: <span className="pb-gold-text">22" × 36" roll</span> — optimal for this batch.</div>
          </div>
        )}

        {(step === 2 || step === 3) && (
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div style={{ width: CANVAS_W / 2, height: CANVAS_H / 2, position: "relative", border: "1px solid var(--pb-border)", background: "repeating-linear-gradient(45deg, #0a0a0a, #0a0a0a 10px, #0d0d0d 10px, #0d0d0d 20px)", flexShrink: 0 }}>
              {placed.slice(0, step === 3 ? placed.length : packed).map((p, i) => (
                <div key={i} style={{ position: "absolute", left: p.x / 2, top: p.y / 2, width: p.w / 2, height: p.h / 2, background: p.color, opacity: 0.85, borderRadius: 1, transition: "opacity .2s ease" }} />
              ))}
            </div>
            <div className="flex-1">
              {step === 2 ? (
                <>
                  <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase" }}>Auto-packing…</div>
                  <div className="pb-serif mt-3" style={{ fontSize: 44, fontWeight: 300 }}>{packed} <span style={{ color: "var(--pb-gray)", fontSize: 22 }}>/ {placed.length} items</span></div>
                </>
              ) : (
                <>
                  <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase" }}>Production Ready</div>
                  <div className="pb-serif mt-3" style={{ fontSize: 52, fontWeight: 300, color: "var(--pb-gold)" }}>{utilCount}%</div>
                  <div className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--pb-gray)" }}>MATERIAL UTILIZATION</div>
                  <div className="pb-body mt-4" style={{ fontSize: 15 }}>{placed.length} items nested on a 22"×36" sheet.</div>
                  <div className="flex gap-3 mt-6">
                    <span className="pb-btn pb-btn-gold" style={{ cursor: "default" }}><FileDown size={13} /> Export PDF</span>
                    <span className="pb-btn pb-btn-ghost" style={{ cursor: "default" }}><ImageIcon size={13} /> Export PNG</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GangSheetBuilder() {
  return (
    <>
      <PageHero eyebrow="Gang Sheet Builder · Demo" title="Every inch of the sheet, engineered." sub="An auto-packing DTF gang sheet builder with DPI validation, live layout, and production-ready export. This is the interface — the shipping tool packs real files.">
        <div className="flex flex-wrap gap-4">
          <Link to="/request-a-launch" className="pb-btn pb-btn-gold">Get early access <ArrowRight size={13} /></Link>
          <a href="https://teeshirtali.com/gang-sheet-builder/" target="_blank" rel="noopener noreferrer" className="pb-btn pb-btn-ghost" data-testid="gangsheet-live-link">See it live <ArrowUpRight size={13} /></a>
        </div>
      </PageHero>

      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 100 }}>
        <div className="pb-container"><Reveal><DemoPanel /></Reveal></div>
      </section>

      <section className="pb-sec-black" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="pb-container">
          <Eyebrow>Capabilities</Eyebrow>
          <h2 className="pb-h2 mt-6" style={{ maxWidth: 600 }}>Built for production.</h2>
          <div className="grid md:grid-cols-3 gap-px mt-12" style={{ background: "var(--pb-border)" }}>
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.t} delay={(i % 3) * 0.06}>
                <div className="pb-sec-charcoal h-full" style={{ padding: "34px 30px" }}>
                  <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.2em" }}>{`0${i + 1}`}</div>
                  <h3 className="pb-h3 mt-4" style={{ fontSize: 24 }}>{c.t}</h3>
                  <p className="pb-body mt-3" style={{ fontSize: 16 }}>{c.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-sec-charcoal" style={{ paddingTop: 80, paddingBottom: 80, borderTop: "1px solid var(--pb-border)", borderBottom: "1px solid var(--pb-border)" }}>
        <div className="pb-container grid grid-cols-2 md:grid-cols-4 gap-8">
          {SPECS.map(([n, l]) => (
            <div key={l}>
              <div className="pb-serif pb-gold-text" style={{ fontSize: 40, fontWeight: 300 }}>{n}</div>
              <div className="pb-mono mt-2" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--pb-gray)" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-sec-black" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="pb-container">
          <Eyebrow>Licensing Tiers</Eyebrow>
          <h2 className="pb-h2 mt-6" style={{ maxWidth: 600 }}>Deploy it your way.</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {TIERS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="pb-card h-full flex flex-col" style={{ padding: "36px 30px", borderColor: t.featured ? "var(--pb-gold)" : "var(--pb-border)" }}>
                  <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase" }}>{t.tag}</div>
                  <h3 className="pb-h3 mt-3">{t.name}</h3>
                  <ul className="mt-6 flex flex-col gap-3 flex-1">
                    {t.perks.map((p) => (
                      <li key={p} className="flex items-start gap-3 pb-body" style={{ fontSize: 15 }}>
                        <Check size={15} color="var(--pb-gold)" className="mt-1 shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact" className="pb-btn pb-btn-ghost mt-8 justify-center">Inquire</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
