import { Link } from "react-router-dom";
import { ArrowUpRight, Wand2, Grid2x2, Shirt } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { PageHero, CTASection } from "@/components/Sections";

const TOOLS = [
  { to: "/tools/team-store-wizard", icon: Wand2, name: "Team Store Strategy Wizard", desc: "An 8-step questionnaire that maps your program and generates a complete platform strategy document." },
  { to: "/tools/gang-sheet-builder", icon: Grid2x2, name: "Gang Sheet Builder Demo", desc: "Auto-packing DTF gang sheet builder with DPI validation, live layout, and production-ready export." },
  { to: "/tools/configurator", icon: Shirt, name: "Product Configurator Demo", desc: "Real-time apparel configurator — colors, placement, text, and live pricing on a visual canvas." },
];

export default function Tools() {
  return (
    <>
      <PageHero
        eyebrow="The Toolbench"
        title="Interactive tooling, live."
        sub="The tools behind the ecosystem — strategy, production, and configuration systems you can try right now. Each is white-label ready for licensed deployments."
      >
        <a href="https://teeshirtali.com" target="_blank" rel="noopener noreferrer" className="pb-btn pb-btn-ghost" data-testid="tools-live-link">
          See these tools live on Tee Shirt Ali <ArrowUpRight size={14} />
        </a>
      </PageHero>
      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 100 }}>
        <div className="pb-container grid md:grid-cols-3 gap-8">
          {TOOLS.map((t, i) => (
            <Reveal key={t.to} delay={i * 0.1}>
              <Link to={t.to} className="pb-card block h-full" style={{ padding: "40px 34px" }} data-testid={`tool-card-${i}`}>
                <div className="flex items-center justify-between">
                  <t.icon size={28} color="var(--pb-gold)" strokeWidth={1.3} />
                  <ArrowUpRight size={20} color="var(--pb-gold)" />
                </div>
                <h3 className="pb-h3 mt-8">{t.name}</h3>
                <p className="pb-body mt-4" style={{ fontSize: 16 }}>{t.desc}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <CTASection />
    </>
  );
}
