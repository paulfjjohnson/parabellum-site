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
            <div style={{ border: "1px solid var(--pb-border)", background: "var(--pb-onyx)", overflow: "hidden" }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2" style={{ padding: "12px 16px", borderBottom: "1px solid var(--pb-border-soft)", background: "var(--pb-charcoal)" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#C56A5C" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#D8A85F" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#4E8C5A" }} />
                <span className="pb-mono ml-3" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--pb-gray)" }}>{f.url.replace("https://", "")}</span>
              </div>
              <div style={{ position: "relative", aspectRatio: "16/11", overflow: "hidden" }}>
                <img src={f.img} alt={`${f.name} homepage`} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:-translate-y-[30%]" />
              </div>
            </div>
          </a>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="flex items-center gap-4 mb-6">
            <img src={f.logo} alt="Tee Shirt Ali logo" style={{ width: 64, height: 64, objectFit: "contain" }} data-testid="featured-work-logo" />
            <Eyebrow>{f.eyebrow}</Eyebrow>
          </div>
          <h2 className="pb-h2">{f.tagline}</h2>
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
