import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { Crest } from "@/components/Crest";

export const PageHero = ({ eyebrow, title, sub, children }) => (
  <section className="pb-sec-black relative overflow-hidden" style={{ paddingTop: 168, paddingBottom: 90 }}>
    <div className="absolute" style={{ right: "-4%", top: "10%", opacity: 0.04, pointerEvents: "none" }}>
      <Crest size={520} />
    </div>
    <div className="pb-container relative">
      <Reveal><Eyebrow>{eyebrow}</Eyebrow></Reveal>
      <Reveal delay={0.08}>
        <h1 className="pb-h1 mt-6" style={{ maxWidth: 900 }} data-testid="page-hero-title">{title}</h1>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className="pb-body mt-8" style={{ maxWidth: 620 }}>{sub}</p>
        </Reveal>
      )}
      {children && <Reveal delay={0.24}><div className="mt-10">{children}</div></Reveal>}
    </div>
  </section>
);

export const SectionHeader = ({ eyebrow, title, sub, center }) => (
  <div style={{ maxWidth: center ? 720 : 820, marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0, textAlign: center ? "center" : "left" }}>
    <Reveal><Eyebrow className={center ? "justify-center" : ""}>{eyebrow}</Eyebrow></Reveal>
    <Reveal delay={0.08}><h2 className="pb-h2 mt-6">{title}</h2></Reveal>
    {sub && <Reveal delay={0.14}><p className="pb-body mt-6" style={{ marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0, maxWidth: 620 }}>{sub}</p></Reveal>}
  </div>
);

export const StatRow = ({ stats }) => (
  <div className="grid grid-cols-3 gap-6" style={{ maxWidth: 640 }}>
    {stats.map(([num, label], i) => (
      <Reveal key={i} delay={i * 0.08}>
        <div>
          <div className="pb-serif pb-gold-text" style={{ fontSize: "clamp(38px,5vw,52px)", fontWeight: 300, lineHeight: 1 }}>{num}</div>
          <div className="pb-mono mt-3" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--pb-gray)" }}>{label}</div>
        </div>
      </Reveal>
    ))}
  </div>
);

export const CTASection = () => (
  <section className="pb-sec-charcoal relative overflow-hidden" style={{ paddingTop: 100, paddingBottom: 100 }}>
    <div className="absolute left-1/2 bottom-0" style={{ transform: "translateX(-50%)", width: 700, height: 400, background: "radial-gradient(ellipse at center bottom, rgba(216,168,95,0.16), transparent 70%)", pointerEvents: "none" }} />
    <div className="pb-container relative text-center">
      <Reveal><Eyebrow className="justify-center">Si Vis Pacem · Para Bellum</Eyebrow></Reveal>
      <Reveal delay={0.08}><h2 className="pb-h2 mt-6" style={{ maxWidth: 760, marginInline: "auto" }}>The next drop won't launch itself.</h2></Reveal>
      <Reveal delay={0.14}>
        <p className="pb-body mt-6" style={{ maxWidth: 560, marginInline: "auto" }}>
          We work with operators who treat merch like infrastructure. Bring the audience — we'll bring the engine.
        </p>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="flex flex-wrap gap-4 justify-center mt-10">
          <Link to="/request-a-launch" className="pb-btn pb-btn-gold" data-testid="cta-request-launch">Request a Launch <ArrowRight size={13} /></Link>
          <Link to="/about" className="pb-btn pb-btn-ghost">The Parabellum Philosophy</Link>
        </div>
      </Reveal>
    </div>
  </section>
);

export const Chips = ({ items }) => (
  <div className="flex flex-wrap gap-3">
    {items.map((s) => (
      <span key={s} className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--pb-gray-soft)", border: "1px solid var(--pb-border)", padding: "8px 14px" }}>{s}</span>
    ))}
  </div>
);
