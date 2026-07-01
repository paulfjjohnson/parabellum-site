import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { PageHero, CTASection } from "@/components/Sections";
import { SERVICES } from "@/data/site";

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Capabilities · Six Disciplines"
        title="Engineering, not guesswork."
        sub="Six service tracks that take an operator from a blank domain to a self-running revenue engine. Each is delivered production-grade and operator-owned."
      />
      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 100 }}>
        <div className="pb-container">
          <div className="grid md:grid-cols-2 gap-px" style={{ background: "var(--pb-border)" }}>
            {SERVICES.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 2) * 0.08}>
                <Link to={`/services/${s.slug}`} className="pb-card block h-full" style={{ padding: "44px 40px" }} data-testid={`service-card-${s.slug}`}>
                  <div className="flex items-start justify-between">
                    <span className="pb-serif" style={{ fontSize: 56, fontWeight: 300, color: "var(--pb-gold-muted)", lineHeight: 1 }}>{s.num}</span>
                    <ArrowUpRight size={22} color="var(--pb-gold)" />
                  </div>
                  <h3 className="pb-h3 mt-6">{s.name}</h3>
                  <p className="pb-body mt-3" style={{ fontSize: 16 }}>{s.tagline}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
