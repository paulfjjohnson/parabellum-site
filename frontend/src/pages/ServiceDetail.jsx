import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { PageHero, StatRow, Chips, CTASection } from "@/components/Sections";
import { SERVICES } from "@/data/site";

export default function ServiceDetail() {
  const { slug } = useParams();
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return <Navigate to="/services" replace />;

  return (
    <>
      <PageHero eyebrow={`Service ${s.num} · ${s.name}`} title={s.headline} sub={s.tagline}>
        <div className="flex flex-wrap gap-4">
          <Link to="/request-a-launch" className="pb-btn pb-btn-gold">Start this build <ArrowRight size={13} /></Link>
          {s.liveUrl && <a href={s.liveUrl} target="_blank" rel="noopener noreferrer" className="pb-btn pb-btn-ghost" data-testid="service-live-link">See it live <ArrowUpRight size={13} /></a>}
          <Link to="/services" className="pb-btn pb-btn-ghost">All services</Link>
        </div>
      </PageHero>

      <section className="pb-sec-charcoal" style={{ paddingTop: 70, paddingBottom: 70, borderTop: "1px solid var(--pb-border)", borderBottom: "1px solid var(--pb-border)" }}>
        <div className="pb-container"><StatRow stats={s.stats} /></div>
      </section>

      <section className="pb-sec-black" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="pb-container">
          <Eyebrow>Deliverables</Eyebrow>
          <h2 className="pb-h2 mt-6" style={{ maxWidth: 600 }}>What you get.</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-px mt-12" style={{ background: "var(--pb-border-soft)" }}>
            {s.deliverables.map((d, i) => (
              <Reveal key={d} delay={(i % 4) * 0.06}>
                <div className="pb-sec-charcoal h-full flex items-start gap-3" style={{ padding: "26px 24px" }}>
                  <Check size={16} color="var(--pb-gold)" className="mt-1 shrink-0" />
                  <span className="pb-body" style={{ fontSize: 16 }}>{d}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-sec-charcoal" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="pb-container">
          <Eyebrow>The Process</Eyebrow>
          <h2 className="pb-h2 mt-6" style={{ maxWidth: 600 }}>Four steps, fully documented.</h2>
          <div className="grid md:grid-cols-4 gap-px mt-12" style={{ background: "var(--pb-border)" }}>
            {s.process.map((p, i) => (
              <Reveal key={p} delay={i * 0.08}>
                <div className="pb-sec-black h-full" style={{ padding: "36px 28px" }}>
                  <div className="pb-serif pb-gold-text" style={{ fontSize: 40, fontWeight: 300 }}>0{i + 1}</div>
                  <p className="pb-body mt-4" style={{ fontSize: 16 }}>{p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-sec-black" style={{ paddingTop: 90, paddingBottom: 90 }}>
        <div className="pb-container">
          <div style={{ border: "1px solid var(--pb-border)", padding: "48px 44px", background: "var(--pb-onyx)" }}>
            <Eyebrow>Case File</Eyebrow>
            <h3 className="pb-h3 mt-5">{s.caseTitle}</h3>
            <p className="pb-body mt-3" style={{ fontSize: 20, color: "var(--pb-gold)" }}>{s.caseBody}</p>
          </div>
        </div>
      </section>

      <section className="pb-sec-charcoal" style={{ paddingTop: 90, paddingBottom: 90 }}>
        <div className="pb-container">
          <Eyebrow>Tech Stack</Eyebrow>
          <div className="mt-8"><Chips items={s.stack} /></div>
        </div>
      </section>

      <section className="pb-sec-black" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="pb-container">
          <Eyebrow>Who It's For</Eyebrow>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {s.audience.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.08}>
                <div className="pb-card h-full" style={{ padding: "32px 28px" }}>
                  <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase" }}>{t}</div>
                  <p className="pb-body mt-4" style={{ fontSize: 17 }}>{d}</p>
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
