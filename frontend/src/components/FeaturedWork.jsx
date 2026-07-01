import { ArrowUpRight } from "lucide-react";
import * as Icons from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { FEATURED_WORK, POWERED_CAPABILITIES } from "@/data/site";

export const FeaturedWork = () => {
  const f = FEATURED_WORK;
  return (
    <section className="pb-sec-black" style={{ paddingTop: 100, paddingBottom: 100 }} data-testid="featured-work">
      <div className="pb-container grid md:grid-cols-2 gap-14 items-center">
        <Reveal>
          <a href={f.url} target="_blank" rel="noopener noreferrer" className="block group" data-testid="featured-work-image">
            <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", border: "1px solid var(--pb-border)" }}>
              <img src={f.img} alt={f.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: "grayscale(1) contrast(1.05)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(5,5,5,0.85))" }} />
              <div className="absolute" style={{ left: 24, bottom: 22 }}>
                <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" }}>{f.url.replace("https://", "")}</div>
                <div className="pb-serif" style={{ fontSize: 30, lineHeight: 1 }}>{f.name}</div>
              </div>
            </div>
          </a>
        </Reveal>

        <Reveal delay={0.12}>
          <Eyebrow>{f.eyebrow}</Eyebrow>
          <h2 className="pb-h2 mt-6">{f.tagline}</h2>
          <p className="pb-body mt-6">{f.desc}</p>
          <div className="flex flex-wrap gap-10 mt-8">
            {f.stats.map(([n, l]) => (
              <div key={l}>
                <div className="pb-serif pb-gold-text" style={{ fontSize: 32, fontWeight: 300, lineHeight: 1 }}>{n}</div>
                <div className="pb-mono mt-2" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--pb-gray)" }}>{l}</div>
              </div>
            ))}
          </div>
          <a href={f.url} target="_blank" rel="noopener noreferrer" className="pb-btn pb-btn-gold mt-10" data-testid="featured-work-cta">
            See it live <ArrowUpRight size={13} />
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export const PoweredCapabilities = () => (
  <section className="pb-sec-charcoal" style={{ paddingTop: 100, paddingBottom: 100 }} data-testid="powered-capabilities">
    <div className="pb-container">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal><Eyebrow>What The Ecosystem Powers</Eyebrow></Reveal>
          <Reveal delay={0.08}><h2 className="pb-h2 mt-6" style={{ maxWidth: 640 }}>Every merch experience, one system.</h2></Reveal>
        </div>
        <Reveal delay={0.14}>
          <a href="https://teeshirtali.com" target="_blank" rel="noopener noreferrer" className="pb-btn pb-btn-ghost" data-testid="capabilities-live-link">
            See it live on Tee Shirt Ali <ArrowUpRight size={13} />
          </a>
        </Reveal>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px mt-14" style={{ background: "var(--pb-border)" }}>
        {POWERED_CAPABILITIES.map((c, i) => {
          const Icon = Icons[c.icon] || Icons.Circle;
          return (
            <Reveal key={c.label} delay={(i % 3) * 0.06}>
              <div className="pb-sec-black h-full" style={{ padding: "30px 28px" }}>
                <Icon size={24} color="var(--pb-gold)" strokeWidth={1.4} />
                <h3 className="pb-h3 mt-5" style={{ fontSize: 23 }}>{c.label}</h3>
                <p className="pb-body mt-3" style={{ fontSize: 15 }}>{c.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
