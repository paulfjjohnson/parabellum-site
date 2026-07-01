import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { PageHero, CTASection } from "@/components/Sections";

const SHIRT_COLORS = [
  { name: "Onyx", hex: "#111111" }, { name: "Bone", hex: "#E7E1D6" }, { name: "Gold", hex: "#D8A85F" },
  { name: "Forest", hex: "#2E4636" }, { name: "Oxblood", hex: "#5C2A2A" }, { name: "Slate", hex: "#3A4149" },
];
const SIZES = ["S", "M", "L", "XL", "2XL"];
const PLACEMENTS = ["Front Center", "Left Chest", "Full Back"];
const METHODS = [["DTF", 4], ["Screen Print", 3], ["Embroidery", 6]];
const BASE = 18;

function priceOf(method, qty, placement) {
  const m = METHODS.find((x) => x[0] === method)[1];
  const place = placement === "Full Back" ? 3 : placement === "Front Center" ? 2 : 1;
  let unit = BASE + m + place;
  if (qty >= 100) unit -= 4; else if (qty >= 50) unit -= 2.5; else if (qty >= 24) unit -= 1;
  return unit;
}

const Shirt = ({ color, textColor, text, placement }) => {
  const dark = ["#E7E1D6", "#D8A85F"].includes(color);
  const printColor = textColor;
  return (
    <svg viewBox="0 0 320 340" width="100%" style={{ maxWidth: 380 }} data-testid="configurator-preview">
      <path d="M110 40 L70 60 L40 110 L70 135 L90 120 L90 300 L230 300 L230 120 L250 135 L280 110 L250 60 L210 40 L185 55 Q160 78 135 55 Z"
        fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
      <path d="M135 55 Q160 78 185 55" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
      {text && placement === "Left Chest" && (
        <text x="120" y="120" fontFamily="var(--pb-serif)" fontSize="14" fill={printColor} textAnchor="middle">{text.slice(0, 10)}</text>
      )}
      {text && placement === "Front Center" && (
        <text x="160" y="200" fontFamily="var(--pb-serif)" fontSize="24" fill={printColor} textAnchor="middle">{text.slice(0, 14)}</text>
      )}
      {text && placement === "Full Back" && (
        <text x="160" y="180" fontFamily="var(--pb-serif)" fontSize="30" fill={printColor} textAnchor="middle" opacity="0.9">{text.slice(0, 12)}</text>
      )}
    </svg>
  );
};

export default function Configurator() {
  const [color, setColor] = useState(SHIRT_COLORS[0].hex);
  const [textColor, setTextColor] = useState("#D8A85F");
  const [text, setText] = useState("PARABELLUM");
  const [size, setSize] = useState("L");
  const [placement, setPlacement] = useState("Front Center");
  const [method, setMethod] = useState("DTF");
  const [qty, setQty] = useState(24);

  const unit = priceOf(method, qty, placement);
  const total = unit * qty;

  return (
    <>
      <PageHero eyebrow="Product Configurator · Demo" title="Design it live. Price it instantly." sub="A real-time apparel configurator — color, placement, text, method, and quantity, priced on the fly. White-label ready for any storefront.">
        <div className="flex flex-wrap gap-4">
          <Link to="/request-a-launch" className="pb-btn pb-btn-gold">Add to my store <ArrowRight size={13} /></Link>
          <a href="https://teeshirtali.com/configurator/" target="_blank" rel="noopener noreferrer" className="pb-btn pb-btn-ghost" data-testid="configurator-live-link">See it live <ArrowUpRight size={13} /></a>
        </div>
      </PageHero>

      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <div className="pb-container grid md:grid-cols-2 gap-14">
          <Reveal>
            <div className="flex items-center justify-center" style={{ border: "1px solid var(--pb-border)", background: "var(--pb-onyx)", padding: 40, minHeight: 440 }}>
              <Shirt color={color} textColor={textColor} text={text} placement={placement} />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col gap-7">
              <div>
                <label className="pb-label">Garment Color</label>
                <div className="flex flex-wrap gap-3">
                  {SHIRT_COLORS.map((c) => (
                    <button key={c.hex} onClick={() => setColor(c.hex)} title={c.name} data-testid={`config-color-${c.name}`}
                      style={{ width: 34, height: 34, background: c.hex, border: `2px solid ${color === c.hex ? "var(--pb-gold)" : "var(--pb-border-soft)"}`, cursor: "pointer" }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="pb-label">Print / Text Color</label>
                <div className="flex flex-wrap gap-3">
                  {["#D8A85F", "#F0EDE8", "#111111", "#C56A5C", "#4E8C5A"].map((c) => (
                    <button key={c} onClick={() => setTextColor(c)} data-testid={`config-textcolor-${c}`}
                      style={{ width: 34, height: 34, background: c, border: `2px solid ${textColor === c ? "var(--pb-gold)" : "var(--pb-border-soft)"}`, cursor: "pointer" }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="pb-label">Custom Text</label>
                <input className="pb-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={14} placeholder="Your text" data-testid="config-text" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="pb-label">Placement</label>
                  <select className="pb-input" value={placement} onChange={(e) => setPlacement(e.target.value)} data-testid="config-placement">
                    {PLACEMENTS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="pb-label">Method</label>
                  <select className="pb-input" value={method} onChange={(e) => setMethod(e.target.value)} data-testid="config-method">
                    {METHODS.map(([m]) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="pb-label">Size</label>
                <div className="flex gap-2">
                  {SIZES.map((s) => (
                    <button key={s} onClick={() => setSize(s)} data-testid={`config-size-${s}`} className="pb-mono"
                      style={{ fontSize: 11, padding: "10px 16px", border: `1px solid ${size === s ? "var(--pb-gold)" : "var(--pb-border)"}`, color: size === s ? "var(--pb-gold)" : "var(--pb-gray-soft)", background: size === s ? "var(--pb-gold-muted)" : "transparent" }}>{s}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="pb-label">Quantity — {qty} units</label>
                <input type="range" min="1" max="200" value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--pb-gold)" }} data-testid="config-qty" />
              </div>

              <div style={{ border: "1px solid var(--pb-border)", padding: "22px 26px", background: "var(--pb-onyx)" }}>
                <div className="flex justify-between items-baseline">
                  <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--pb-gray)" }}>UNIT PRICE</span>
                  <span className="pb-serif pb-gold-text" style={{ fontSize: 24 }} data-testid="config-unit-price">${unit.toFixed(2)}</span>
                </div>
                <div className="pb-hairline my-4" style={{ background: "var(--pb-border-soft)" }} />
                <div className="flex justify-between items-baseline">
                  <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--pb-gray)" }}>ESTIMATED TOTAL</span>
                  <span className="pb-serif pb-gold-text" style={{ fontSize: 40, fontWeight: 300 }} data-testid="config-total-price">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
