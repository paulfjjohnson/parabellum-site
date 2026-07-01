import { Reveal, Eyebrow } from "@/components/Reveal";
import { PageHero, CTASection } from "@/components/Sections";
import { IMAGES } from "@/data/site";

const VALUES = [
  { t: "Operators, not hobbyists", d: "We build for people who run real programs — schools, boosters, creators, and businesses with an audience to serve." },
  { t: "Infrastructure over inventory", d: "We don't sell blank tees. We engineer the system that turns attention into recurring revenue events." },
  { t: "Operator-owned, always", d: "Every storefront, tool, and automation we ship is yours. No lock-in, no hostage data." },
  { t: "Clarity before code", d: "We architect and document first. The build is the easy part when the strategy is right." },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="The Studio · Est. 2025"
        title="Si vis pacem, para bellum."
        sub="If you want peace, prepare for war. Parabellum is a merch-tech ecosystem — we engineer the merchandise, the launch system, and the AI workflows behind it. Built for operators. Engineered for scale."
      />

      <section className="pb-sec-charcoal" style={{ paddingTop: 90, paddingBottom: 90 }}>
        <div className="pb-container grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <Eyebrow>The Positioning</Eyebrow>
            <h2 className="pb-h2 mt-6">Not a print shop.</h2>
            <p className="pb-body mt-6">
              The Parabellum Company — dba of Parabellum Technologies — creates and delivers solutions for the custom apparel industry. We also evaluate businesses' technology stacks to design technical solutions for efficiency and future growth.
            </p>
            <p className="pb-body mt-5">
              Where most vendors stop at printing, we start at the system: the storefront, the drop mechanics, the automations, and the AI workflows that let a small team run like a large one.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ aspectRatio: "4/5", overflow: "hidden", border: "1px solid var(--pb-border)" }}>
              <img src={IMAGES.printOne} alt="Production studio" loading="lazy" className="w-full h-full object-cover" style={{ filter: "grayscale(1) contrast(1.05)" }} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-sec-black" style={{ paddingTop: 100, paddingBottom: 100 }}>
        <div className="pb-container">
          <Eyebrow>Operating Principles</Eyebrow>
          <h2 className="pb-h2 mt-6" style={{ maxWidth: 600 }}>How we think.</h2>
          <div className="grid md:grid-cols-2 gap-px mt-12" style={{ background: "var(--pb-border)" }}>
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={(i % 2) * 0.08}>
                <div className="pb-sec-charcoal h-full" style={{ padding: "40px 36px" }}>
                  <h3 className="pb-h3" style={{ fontSize: 26 }}>{v.t}</h3>
                  <p className="pb-body mt-4" style={{ fontSize: 16 }}>{v.d}</p>
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
