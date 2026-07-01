import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Reveal, Eyebrow } from "@/components/Reveal";
import { PageHero, StatRow, CTASection } from "@/components/Sections";
import { IMAGES } from "@/data/site";

export const PillarLayout = ({ data }) => (
  <>
    <PageHero eyebrow={data.eyebrow} title={data.title} sub={data.sub}>
      <div className="flex flex-wrap gap-4">
        <Link to="/request-a-launch" className="pb-btn pb-btn-gold">{data.cta} <ArrowRight size={13} /></Link>
        <Link to="/services" className="pb-btn pb-btn-ghost">See services</Link>
      </div>
    </PageHero>

    <section className="pb-sec-charcoal" style={{ paddingTop: 70, paddingBottom: 70, borderTop: "1px solid var(--pb-border)", borderBottom: "1px solid var(--pb-border)" }}>
      <div className="pb-container"><StatRow stats={data.stats} /></div>
    </section>

    <section className="pb-sec-black" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <div className="pb-container grid md:grid-cols-2 gap-16 items-center">
        <Reveal>
          <Eyebrow>{data.featureEyebrow}</Eyebrow>
          <h2 className="pb-h2 mt-6">{data.featureTitle}</h2>
          <ul className="mt-8 flex flex-col gap-4">
            {data.features.map((f) => (
              <li key={f} className="flex items-start gap-3 pb-body" style={{ fontSize: 17 }}>
                <Check size={17} color="var(--pb-gold)" className="mt-1 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.12}>
          <div style={{ aspectRatio: "4/5", overflow: "hidden", border: "1px solid var(--pb-border)" }}>
            <img src={data.image} alt={data.title} loading="lazy" className="w-full h-full object-cover" style={{ filter: "grayscale(1) contrast(1.05)" }} />
          </div>
        </Reveal>
      </div>
    </section>

    <section className="pb-sec-charcoal" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <div className="pb-container">
        <Eyebrow>{data.gridEyebrow}</Eyebrow>
        <h2 className="pb-h2 mt-6" style={{ maxWidth: 640 }}>{data.gridTitle}</h2>
        <div className="grid md:grid-cols-3 gap-px mt-12" style={{ background: "var(--pb-border)" }}>
          {data.cards.map((c, i) => (
            <Reveal key={c.t} delay={(i % 3) * 0.08}>
              <div className="pb-sec-black h-full" style={{ padding: "36px 30px" }}>
                <div className="pb-mono pb-gold-text" style={{ fontSize: 10, letterSpacing: "0.2em" }}>{`0${i + 1}`}</div>
                <h3 className="pb-h3 mt-4" style={{ fontSize: 24 }}>{c.t}</h3>
                <p className="pb-body mt-3" style={{ fontSize: 16 }}>{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    <CTASection />
  </>
);

export const TeeParty = () => (
  <PillarLayout data={{
    eyebrow: "Pillar 01 · Launch Infrastructure",
    title: "Tee Party Solution.",
    sub: "Automated merchandise launch infrastructure. Scheduled drops, countdown launches, community-driven sales, and Facebook-to-store conversion — engineered as a closed-loop revenue engine.",
    cta: "Run a Tee Party",
    stats: [["7-Day", "drop cycle"], ["$0", "admin overhead"], ["100%", "operator-owned"]],
    featureEyebrow: "How It Works",
    featureTitle: "A launch system, not a listing.",
    features: ["Scheduled limited drops with real countdowns", "Community-driven pre-sale windows", "Facebook & social-to-store conversion funnels", "Group-buy fulfillment at window close", "Automated reorder & restock sequences", "Fundraising splits with live reporting"],
    image: IMAGES.streetTwo,
    gridEyebrow: "Drop Mechanics",
    gridTitle: "Every drop, engineered.",
    cards: [
      { t: "Scheduled Drops", d: "Set the window, prime the audience, and let the countdown do the selling." },
      { t: "Community Sales", d: "Turn followers and parents into a coordinated buying moment." },
      { t: "Closed-Loop Reorders", d: "Windows close, orders aggregate, reorders keep revenue compounding." },
    ],
  }} />
);

export const DigitalProducts = () => (
  <PillarLayout data={{
    eyebrow: "Pillar 02 · Operator Assets",
    title: "Digital Products.",
    sub: "Operator asset libraries built to move. Mockup libraries, prompt packs, launch kits, and campaign asset packs — the raw material behind a fast, repeatable drop cadence.",
    cta: "Get the asset packs",
    stats: [["500+", "mockup templates"], ["10×", "faster concepting"], ["24/7", "instant delivery"]],
    featureEyebrow: "The Library",
    featureTitle: "Assets that ship the drop faster.",
    features: ["High-resolution mockup libraries", "AI prompt packs for product & copy", "Complete launch kits & templates", "Campaign asset packs (social, email, ads)", "Editable source files, operator-owned", "Instant digital delivery"],
    image: IMAGES.printTwo,
    gridEyebrow: "Catalog",
    gridTitle: "Built for repeatable output.",
    cards: [
      { t: "Mockup Libraries", d: "Editorial, on-brand mockups ready to drop into any store or ad." },
      { t: "Prompt Packs", d: "Battle-tested prompts for mockups, product copy, and campaigns." },
      { t: "Launch Kits", d: "Everything to run a drop end-to-end, packaged and ready." },
    ],
  }} />
);

export const AIAutomation = () => (
  <PillarLayout data={{
    eyebrow: "Pillar 03 · Workflow Orchestration",
    title: "AI + Automation.",
    sub: "End-to-end workflow orchestration. Auto social content, AI product descriptions, lead routing, and campaign orchestration — practical AI that ships to production, not demos.",
    cta: "Automate my ops",
    stats: [["68%", "ops time saved"], ["<30s", "mockup generation"], ["0", "manual entry"]],
    featureEyebrow: "In Production",
    featureTitle: "Workflows that run while you sleep.",
    features: ["AI-generated product descriptions at catalog speed", "Auto social content & campaign scheduling", "Lead routing and inbox triage", "AI mockup pipeline (logo to 12 mockups in <60s)", "Order-to-fulfillment automation", "Support agents with 94% query deflection"],
    image: IMAGES.printThree,
    gridEyebrow: "The Stack",
    gridTitle: "Orchestrated end-to-end.",
    cards: [
      { t: "Content Engine", d: "Social posts, product copy, and campaigns generated and scheduled." },
      { t: "Ops Automation", d: "n8n, Zapier, and Make workflows that remove manual steps entirely." },
      { t: "AI Agents", d: "Service and mockup agents running in production with guardrails." },
    ],
  }} />
);
