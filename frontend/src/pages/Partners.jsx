import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { PageHero, CTASection } from "@/components/Sections";

const TIERS = [
  { name: "Referral Partner", tag: "Send us operators", perks: ["Referral commission on closed projects", "Co-branded launch pages", "Priority intake for your referrals"] },
  { name: "White-Label Agency", tag: "Deploy our tools", perks: ["Licensed gang sheet & configurator tools", "Theme JSON white-label config", "Multi-domain deployments", "Dedicated partner support"] },
  { name: "Platform Reseller", tag: "Full ecosystem", perks: ["Unlimited client deployments", "Full source access", "Custom feature development", "API access & revenue share"] },
];

export default function Partners() {
  return (
    <>
      <PageHero
        eyebrow="Partner Program"
        title="Build on the ecosystem."
        sub="Agencies, print partners, and operators who want to deploy Parabellum tooling under their own banner. Three ways to partner — from referrals to full white-label reselling."
      >
        <Link to="/contact" className="pb-btn pb-btn-gold">Become a partner <ArrowRight size={13} /></Link>
      </PageHero>

      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 100 }}>
        <div className="pb-container grid md:grid-cols-3 gap-8">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="pb-card h-full flex flex-col" style={{ padding: "40px 34px" }}>
                <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase" }}>{t.tag}</div>
                <h3 className="pb-h3 mt-4">{t.name}</h3>
                <ul className="mt-7 flex flex-col gap-4 flex-1">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-3 pb-body" style={{ fontSize: 16 }}>
                      <Check size={16} color="var(--pb-gold)" className="mt-1 shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="pb-btn pb-btn-ghost mt-8 justify-center">Apply</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <CTASection />
    </>
  );
}
