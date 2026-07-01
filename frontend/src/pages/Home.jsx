import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Rocket, Layers, Cpu, Check } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { Crest } from "@/components/Crest";
import { Ticker } from "@/components/Ticker";
import { CTASection } from "@/components/Sections";
import { FeaturedWork, PoweredCapabilities } from "@/components/FeaturedWork";
import { PILLARS, AUDIENCES, LAUNCH_SEQUENCE, DROPS } from "@/data/site";

const ICONS = { Rocket, Layers, Cpu };

const Hero = () => (
  <section className="pb-sec-black relative overflow-hidden" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 120, paddingBottom: 80 }}>
    <div className="absolute" style={{ right: "-6%", top: "50%", transform: "translateY(-50%)", opacity: 0.04, pointerEvents: "none" }}>
      <Crest size={640} />
    </div>
    <div className="pb-container relative">
      <Reveal><Eyebrow>Merch-Tech Ecosystem · Est. 2025</Eyebrow></Reveal>
      <Reveal delay={0.1}>
        <h1 className="pb-h1 mt-7" style={{ maxWidth: 960 }} data-testid="hero-title">
          The infrastructure behind <span className="pb-italic pb-gold-text">every</span> great drop.
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="pb-body mt-8" style={{ maxWidth: 600 }}>
          Parabellum is not a print shop. We engineer the merchandise, the launch system, and the AI workflows behind it — so creators, schools, and operators turn audiences into revenue events.
        </p>
      </Reveal>
      <Reveal delay={0.3}>
        <div className="flex flex-wrap gap-4 mt-10">
          <Link to="/request-a-launch" className="pb-btn pb-btn-gold" data-testid="hero-cta-primary">Request a Launch <ArrowRight size={13} /></Link>
          <Link to="/services" className="pb-btn pb-btn-ghost" data-testid="hero-cta-secondary">Tour the System</Link>
        </div>
      </Reveal>
      <Reveal delay={0.42}>
        <div className="flex flex-wrap gap-12 mt-16">
          {[["3", "Revenue Engines"], ["7-Day", "Drop Cycle"], ["100%", "Operator-Owned"]].map(([n, l]) => (
            <div key={l}>
              <div className="pb-serif pb-gold-text" style={{ fontSize: 46, fontWeight: 300, lineHeight: 1 }}>{n}</div>
              <div className="pb-mono mt-2" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--pb-gray)" }}>{l}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);

const RevenueEngine = () => (
  <section className="pb-sec-black" style={{ paddingTop: 100, paddingBottom: 100 }}>
    <div className="pb-container">
      <Reveal><Eyebrow>The Revenue Engine</Eyebrow></Reveal>
      <Reveal delay={0.08}><h2 className="pb-h2 mt-6" style={{ maxWidth: 640 }}>Three systems. One ecosystem.</h2></Reveal>
      <div className="grid md:grid-cols-3 gap-px mt-14" style={{ background: "var(--pb-border)" }}>
        {PILLARS.map((p, i) => {
          const Icon = ICONS[p.icon];
          return (
            <Reveal key={p.title} delay={i * 0.1}>
              <Link to={p.link} className="pb-card block h-full" style={{ padding: "40px 34px" }} data-testid={`engine-card-${i}`}>
                <div className="flex items-center justify-between">
                  <Icon size={26} color="var(--pb-gold)" strokeWidth={1.4} />
                  <span className="pb-mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--pb-gray)" }}>{p.counter}</span>
                </div>
                <div className="pb-mono pb-gold-text mt-8" style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase" }}>{p.eyebrow}</div>
                <h3 className="pb-h3 mt-3">{p.title}</h3>
                <p className="pb-body mt-4" style={{ fontSize: 16 }}>{p.desc}</p>
                <ul className="mt-6 flex flex-col gap-3">
                  {p.list.map((item) => (
                    <li key={item} className="flex items-center gap-3 pb-body" style={{ fontSize: 15 }}>
                      <Check size={14} color="var(--pb-gold)" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="pb-mono pb-gold-text mt-8 flex items-center gap-2" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  Explore <ArrowUpRight size={13} />
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

const AudienceTabs = () => {
  const [active, setActive] = useState(0);
  const a = AUDIENCES[active];
  return (
    <section className="pb-sec-charcoal" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <div className="pb-container">
        <Reveal><Eyebrow>For Operators · Not Hobbyists</Eyebrow></Reveal>
        <Reveal delay={0.08}><h2 className="pb-h2 mt-6" style={{ maxWidth: 720 }}>Built for the people who run real programs.</h2></Reveal>
        <div className="flex flex-wrap gap-3 mt-12" style={{ borderBottom: "1px solid var(--pb-border-soft)" }}>
          {AUDIENCES.map((aud, i) => (
            <button
              key={aud.key}
              onClick={() => setActive(i)}
              data-testid={`audience-tab-${aud.key}`}
              className="pb-mono transition-colors duration-300"
              style={{
                fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
                padding: "14px 4px", marginRight: 22,
                color: active === i ? "var(--pb-gold)" : "var(--pb-gray)",
                borderBottom: active === i ? "2px solid var(--pb-gold)" : "2px solid transparent",
              }}
            >
              {aud.label}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-12 mt-12" key={active}>
          <Reveal>
            <h3 className="pb-h3">{a.headline}</h3>
            <p className="pb-body mt-5">{a.desc}</p>
            <Link to="/request-a-launch" className="pb-btn pb-btn-ghost mt-8">Run this program <ArrowRight size={13} /></Link>
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ border: "1px solid var(--pb-border)", padding: 34, background: "var(--pb-onyx)" }}>
              <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase" }}>Capabilities</div>
              <ul className="mt-6 flex flex-col gap-4">
                {a.caps.map((c) => (
                  <li key={c} className="flex items-center gap-3 pb-body" style={{ fontSize: 16 }}>
                    <Check size={15} color="var(--pb-gold)" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const LaunchSequence = () => (
  <section className="pb-sec-black" style={{ paddingTop: 100, paddingBottom: 100 }}>
    <div className="pb-container">
      <Reveal><Eyebrow>The Launch Sequence</Eyebrow></Reveal>
      <Reveal delay={0.08}><h2 className="pb-h2 mt-6" style={{ maxWidth: 720 }}>From silence to sold out in four moves.</h2></Reveal>
      <div className="grid md:grid-cols-2 gap-px mt-14" style={{ background: "var(--pb-border)" }}>
        {LAUNCH_SEQUENCE.map((s, i) => (
          <Reveal key={s.num} delay={i * 0.08}>
            <div className="pb-sec-charcoal h-full" style={{ padding: "44px 38px" }}>
              <div className="pb-serif" style={{ fontSize: 64, fontWeight: 300, color: "var(--pb-gold-muted)", lineHeight: 1 }}>{s.num}</div>
              <h3 className="pb-h3 mt-4">{s.title}</h3>
              <p className="pb-body mt-4" style={{ fontSize: 16 }}>{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const FieldNotes = () => (
  <section className="pb-sec-charcoal" style={{ paddingTop: 100, paddingBottom: 100 }}>
    <div className="pb-container">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal><Eyebrow>Field Notes · Recent Drops</Eyebrow></Reveal>
          <Reveal delay={0.08}><h2 className="pb-h2 mt-6" style={{ maxWidth: 620 }}>Audiences turned into revenue events.</h2></Reveal>
        </div>
        <Reveal delay={0.14}><Link to="/drops" className="pb-btn pb-btn-ghost">Run your drop <ArrowRight size={13} /></Link></Reveal>
      </div>
      <div className="grid md:grid-cols-3 gap-8 mt-14">
        {DROPS.map((d, i) => (
          <Reveal key={d.title} delay={i * 0.1}>
            <Link to="/drops" className="block group" data-testid={`drop-card-${i}`}>
              <div style={{ aspectRatio: "3/4", overflow: "hidden", border: "1px solid var(--pb-border)" }}>
                <img src={d.img} alt={d.title} loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" style={{ filter: "grayscale(1) contrast(1.05)" }} />
              </div>
              <div className="pb-mono pb-gold-text mt-5" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>{d.tags}</div>
              <h3 className="pb-h3 mt-2" style={{ fontSize: 24 }}>{d.title}</h3>
              <div className="pb-mono mt-2" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--pb-gray)" }}>{d.meta}</div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const EmailCapture = () => {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="pb-sec-black" style={{ paddingTop: 72, paddingBottom: 72, borderTop: "1px solid var(--pb-border)" }}>
      <div className="pb-container flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase" }}>Field reports. No noise.</div>
          <h3 className="pb-h3 mt-3" style={{ fontSize: 32 }}>Join the briefing</h3>
        </div>
        <form
          className="flex gap-3 w-full md:w-auto"
          onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
          data-testid="email-capture-form"
        >
          {done ? (
            <span className="pb-mono pb-gold-text" style={{ fontSize: 12, letterSpacing: "0.16em" }}>✓ You're on the briefing list.</span>
          ) : (
            <>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@email.com" className="pb-input" style={{ minWidth: 260 }} data-testid="email-capture-input" />
              <button type="submit" className="pb-btn pb-btn-gold" data-testid="email-capture-submit">Join Briefing</button>
            </>
          )}
        </form>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <RevenueEngine />
      <AudienceTabs />
      <LaunchSequence />
      <FeaturedWork />
      <PoweredCapabilities />
      <CTASection />
      <FieldNotes />
      <EmailCapture />
    </>
  );
}
