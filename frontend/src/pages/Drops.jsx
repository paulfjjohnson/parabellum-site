import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { PageHero, CTASection } from "@/components/Sections";
import { DROPS, IMAGES } from "@/data/site";

const ALL_DROPS = [
  ...DROPS,
  { tags: "Business · Event", title: "Summit Crew Capsule", meta: "180 units · 5 days", img: IMAGES.printOne },
  { tags: "Booster · Basketball", title: "Court Kings Drop", meta: "356 units · 7 days", img: IMAGES.streetOne },
  { tags: "Creator · Limited", title: "Analog Dreams Tee", meta: "512 units · 48 hours", img: IMAGES.printThree },
];

export default function Drops() {
  return (
    <>
      <PageHero
        eyebrow="Field Notes · Recent Drops"
        title="Audiences turned into revenue events."
        sub="A running log of drops we've engineered — the units moved, the windows run, and the operators behind them."
      />
      <section className="pb-sec-charcoal" style={{ paddingTop: 20, paddingBottom: 100 }}>
        <div className="pb-container">
          <div className="grid md:grid-cols-3 gap-8">
            {ALL_DROPS.map((d, i) => (
              <Reveal key={d.title + i} delay={(i % 3) * 0.08}>
                <div className="group" data-testid={`drops-page-card-${i}`}>
                  <div style={{ aspectRatio: "3/4", overflow: "hidden", border: "1px solid var(--pb-border)" }}>
                    <img src={d.img} alt={d.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: "grayscale(1) contrast(1.05)" }} />
                  </div>
                  <div className="pb-mono pb-gold-text mt-5" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>{d.tags}</div>
                  <h3 className="pb-h3 mt-2" style={{ fontSize: 24 }}>{d.title}</h3>
                  <div className="pb-mono mt-2" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--pb-gray)" }}>{d.meta}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link to="/request-a-launch" className="pb-btn pb-btn-gold">Run your drop <ArrowRight size={13} /></Link>
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
