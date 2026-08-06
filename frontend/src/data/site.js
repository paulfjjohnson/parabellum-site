export const IMAGES = {
  heroEditorial: "https://images.unsplash.com/photo-1610452325665-d5e09698d9ef?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
  streetOne: "https://images.unsplash.com/flagged/photo-1578505234481-b8fe933991fe?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  streetTwo: "https://images.unsplash.com/photo-1622866654030-fb0958200023?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  streetThree: "https://images.unsplash.com/photo-1642522282985-737efbff185b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  printOne: "https://images.unsplash.com/photo-1663433567177-9f94be0bff4c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  printTwo: "https://images.unsplash.com/photo-1629891060732-199a33f240bb?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  printThree: "https://images.unsplash.com/photo-1663433541063-ddab084d1126?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
};

export const TICKER_ITEMS = [
  "Tactical Sophistication", "Engineered Drops", "Operators", "Not Hobbyists",
  "Si Vis Pacem", "Para Bellum", "Built for Scale", "Closed-Loop Revenue Engine",
];

export const PILLARS = [
  {
    counter: "01 / 03", icon: "Rocket", eyebrow: "Launch Infrastructure",
    title: "Tee Party Solution",
    desc: "Automated merchandise launch infrastructure. Scheduled drops, countdown launches, community-driven sales, and Facebook-to-store conversion.",
    list: ["Scheduled limited drops", "Countdown launch pages", "Community-driven sales", "Facebook-to-store conversion"],
    link: "/tee-party",
  },
  {
    counter: "02 / 03", icon: "Layers", eyebrow: "Operator Assets",
    title: "Digital Products",
    desc: "Operator asset libraries. Mockup libraries, prompt packs, launch kits, and campaign asset packs — built to move.",
    list: ["Mockup libraries", "Prompt packs", "Launch kits", "Campaign asset packs"],
    link: "/digital-products",
  },
  {
    counter: "03 / 03", icon: "Cpu", eyebrow: "Workflow Orchestration",
    title: "AI + Automation",
    desc: "End-to-end workflow orchestration. Auto social content, AI product descriptions, lead routing, and campaign orchestration.",
    list: ["Auto social content", "AI product descriptions", "Lead routing", "Campaign orchestration"],
    link: "/ai-automation",
  },
];

export const AUDIENCES = [
  { key: "schools", label: "Schools", headline: "Spirit wear that funds the program.",
    desc: "Recurring spirit-wear drops, booster club portals, and fundraising splits — with zero admin overhead for staff and volunteers.",
    caps: ["Booster club portals", "Recurring seasonal drops", "Fundraising splits & reporting", "Youth sizing catalogs"] },
  { key: "boosters", label: "Boosters & Sports", headline: "Game-day drops on a season schedule.",
    desc: "Season-scheduled order windows, championship capsules, and game-day drops engineered for the moment demand peaks.",
    caps: ["Season-scheduled windows", "Championship capsules", "Game-day flash drops", "Group-buy fulfillment"] },
  { key: "creators", label: "Creators", headline: "Turn an audience into a revenue event.",
    desc: "Limited edition capsule drops, countdown pages, and fan monetization systems that convert attention into orders.",
    caps: ["Limited capsule drops", "Countdown launch pages", "Fan monetization", "Closed-loop reorders"] },
  { key: "businesses", label: "Businesses", headline: "Corporate swag, done like infrastructure.",
    desc: "Corporate swag portals, event capsules, and branded team uniforms with automated ordering and fulfillment.",
    caps: ["Corporate swag portals", "Event capsules", "Branded team uniforms", "Automated ordering"] },
];

export const LAUNCH_SEQUENCE = [
  { num: "01", title: "Brief & Architect", desc: "We map your audience, goals, and drop mechanics, then architect the store, windows, and automations around them." },
  { num: "02", title: "Generate & Approve", desc: "AI-assisted mockups, product copy, and launch assets generated in minutes — then refined and approved by you." },
  { num: "03", title: "Launch & Convert", desc: "Countdown pages go live, community gets activated, and the closed-loop engine converts attention into orders." },
  { num: "04", title: "Fulfill & Reorder", desc: "Windows close, orders aggregate to your print partner, and reorder flows keep the revenue compounding." },
];

export const DROPS = [
  { tags: "Booster · Football", title: "Friday Lights Spirit Drop", meta: "412 units · 6 days", img: IMAGES.streetOne },
  { tags: "Creator · Capsule", title: "Midnight Run Capsule", meta: "289 units · 72 hours", img: IMAGES.streetTwo },
  { tags: "School · Spirit", title: "District Champions Tee", meta: "630 units · 9 days", img: IMAGES.streetThree },
];

export const SERVICES = [
  {
    slug: "web-storefront", num: "01", name: "Web & Storefront Build",
    headline: "Your storefront is your first sales rep.",
    tagline: "Production-grade commerce, built to convert.",
    stats: [["7×", "faster launch"], ["92", "Lighthouse score"], ["<2s", "load target"]],
    deliverables: ["WooCommerce store setup", "Custom Flatsome theme", "Mobile-first responsive build", "Stripe checkout", "SEO & schema", "Performance tuning", "Analytics wiring", "Launch QA"],
    process: ["Discovery & architecture", "Design system build", "Store development", "Launch & handoff"],
    stack: ["WordPress", "WooCommerce", "Flatsome", "Stripe", "Yoast", "WP Rocket", "GA4"],
    caseTitle: "Westfield HS Booster Store",
    caseBody: "$38K first window, 9 days from concept to launch.",
    audience: [["Schools", "Booster & spirit stores"], ["Creators", "Capsule storefronts"], ["Businesses", "Branded swag portals"]],
  },
  {
    slug: "business-automation", num: "02", name: "Business Automation",
    headline: "The spreadsheet era is over.",
    tagline: "Workflows that run while you sleep.",
    stats: [["68%", "ops time saved"], ["<5min", "order-to-fulfillment"], ["0", "manual entry errors"]],
    deliverables: ["Workflow mapping", "n8n / Zapier builds", "Order routing", "Auto-invoicing", "Slack alerts", "QuickBooks sync", "Error monitoring", "Documentation"],
    process: ["Audit current ops", "Map target workflows", "Build & test automations", "Monitor & optimize"],
    stack: ["n8n", "Zapier", "Make", "WooCommerce REST API", "QuickBooks", "Slack"],
    caseTitle: "Apparel Operator Ops",
    caseBody: "40% faster order turn time, 0 manual steps remaining.",
    audience: [["Operators", "High-volume drop shops"], ["Businesses", "Multi-channel sellers"], ["Agencies", "Client fulfillment"]],
  },
  {
    slug: "ai-integration", num: "03", name: "AI Integration",
    headline: "Practical AI that ships, not demos.",
    tagline: "Mockup engines, copy generators, service agents — in production.",
    stats: [["<30s", "mockup generation"], ["94%", "query deflection"], ["10×", "catalog copy speed"]],
    deliverables: ["AI mockup pipeline", "Product copy generation", "Support agent", "Prompt engineering", "Model routing", "Guardrails & QA", "API proxying", "Cost controls"],
    process: ["Identify AI leverage", "Prototype & validate", "Ship to production", "Measure & tune"],
    stack: ["OpenAI GPT-4o", "Claude API", "ComfyUI", "Stable Diffusion", "n8n AI nodes"],
    caseTitle: "Mockup Engine",
    caseBody: "Logo to 12 mockups in under 60 seconds, 2hrs saved per design.",
    audience: [["Operators", "Design-heavy catalogs"], ["Creators", "Rapid concept iteration"], ["Businesses", "Support automation"]],
  },
  {
    slug: "ecommerce-optimization", num: "04", name: "E-Commerce Optimization",
    headline: "More from the traffic you already have.",
    tagline: "Conversion, retention, and revenue intelligence.",
    stats: [["31%", "checkout conversion lift"], ["22%", "AOV increase"], ["3×", "repeat purchase"]],
    deliverables: ["Funnel audit", "Checkout optimization", "Upsell flows", "Email retention", "A/B testing", "Analytics dashboards", "Heatmap analysis", "Reporting"],
    process: ["Baseline & audit", "Prioritize experiments", "Ship & test", "Report & iterate"],
    stack: ["WooCommerce", "CartFlows", "Klaviyo", "GA4", "Hotjar", "Looker Studio"],
    caseTitle: "Conversion Overhaul",
    caseBody: "31% conversion lift, cart abandonment 58% → 27%.",
    audience: [["Operators", "Established stores"], ["Businesses", "Scaling revenue"], ["Creators", "Repeat monetization"]],
  },
  {
    slug: "custom-apparel-tech", num: "05", name: "Custom Apparel Tech",
    headline: "Built for apparel operators, not general stores.",
    tagline: "The infrastructure behind every great drop.",
    liveUrl: "https://teeshirtali.com",
    stats: [["$0", "admin overhead (automated)"], ["7-day", "drop cycle"], ["100%", "operator-owned"]],
    deliverables: ["Group-buy windows", "Countdown timers", "Gang sheet tooling", "Product configurator", "Access gating", "Bulk fulfillment", "Fundraise splits", "Reorder flows"],
    process: ["Architect the drop", "Build the tooling", "Automate fulfillment", "Scale the program"],
    stack: ["WordPress", "WooCommerce", "Flatsome", "YITH Countdown", "n8n", "ComfyUI", "Custom React configurator"],
    caseTitle: "District-Wide K-12 Booster Store",
    caseBody: "$38K first window, admin cut from 12hrs → 30min.",
    audience: [["Schools", "District-wide programs"], ["Boosters", "Season drop calendars"], ["Operators", "Multi-org stores"]],
  },
  {
    slug: "strategic-consulting", num: "06", name: "Strategic Consulting",
    headline: "Clarity before code.",
    tagline: "Architecture, stack selection, and a roadmap that removes constraints.",
    stats: [["1 week", "audit-to-roadmap"], ["100%", "documented output"], ["3×", "cost reduction vs. status quo"]],
    deliverables: ["Tech stack audit", "Architecture review", "Vendor evaluation", "Cost analysis", "Roadmap", "Risk assessment", "Documentation", "Implementation plan"],
    process: ["Discovery interviews", "Stack & cost audit", "Architecture & roadmap", "Documented handoff"],
    stack: ["WordPress/WooCommerce", "Shopify (eval)", "n8n/Zapier", "GA4", "Looker Studio", "Figma"],
    caseTitle: "Restaurant Group Modernization",
    caseBody: "$3.2K/month savings, 90 days audit to production.",
    audience: [["Businesses", "Legacy stack cleanup"], ["Operators", "Scaling decisions"], ["Agencies", "Technical due diligence"]],
  },
];

export const EXTERNAL_DEMO = "https://teeshirtali.com";

export const FEATURED_WORK = {
  name: "Tee Shirt Ali",
  url: "https://teeshirtali.com",
  eyebrow: "Featured Work · Live in Production",
  tagline: "One brand, every merch experience.",
  desc: "Tee Shirt Ali is a full Parabellum-powered merch ecosystem live in production — school stores, team stores, an exclusive product configurator, a gang sheet builder, a design library, blank apparel catalogs, DTF printing, fundraiser programs, and Tee Party drops, all behind a customer portal.",
  stats: [["10+", "Live tools & stores"], ["School-Store", "Architecture"], ["100%", "Operator-owned"]],
  img: "/featured-teeshirtali.png",
  logo: "/teeshirtali-logo.png",
};

// Mirrors the Tee Shirt Ali feature set — what the Parabellum ecosystem powers.
export const POWERED_CAPABILITIES = [
  { icon: "Store", label: "School Stores", desc: "Branded storefronts per school — spirit wear, team gear, and exclusive drops in one hub." },
  { icon: "Users", label: "Team Stores", desc: "Group-buy stores for teams and clubs with scheduled order windows." },
  { icon: "LibraryBig", label: "Design Library", desc: "A curated artwork library — choose a design, then build the garment." },
  { icon: "Shirt", label: "Product Configurator", desc: "Pick design, blank, color, size, and quantity with live pricing." },
  { icon: "Layers", label: "Blank Apparel", desc: "Premium blanks — Bella Canvas, Gildan, Next Level, Comfort Colors, headwear." },
  { icon: "Grid2x2", label: "Gang Sheet Builder", desc: "Auto-packing DTF gang sheets with DPI validation and instant pricing." },
  { icon: "Printer", label: "DTF Printing", desc: "Vivid, full-color DTF transfers built for durability and detail." },
  { icon: "HeartHandshake", label: "Fundraiser Merch", desc: "Fundraising apparel programs with built-in revenue splits." },
  { icon: "Sparkles", label: "Graphic Design", desc: "Custom artwork, logos, and campaign-ready design support." },
  { icon: "Gift", label: "Promotional Products", desc: "Branded promo merchandise for events, teams, and businesses." },
  { icon: "CalendarClock", label: "Event Merchandise", desc: "Limited-time collections and campaign launches for any event." },
  { icon: "UserRound", label: "Customer Portal", desc: "Account login for reorders, order history, and store access." },
];

export const NAV_LINKS = [
  { label: "Tee Party", to: "/tee-party" },
  { label: "Services", to: "/services" },
  { label: "Pricing", to: "/pricing" },
  { label: "Tools", to: "/tools" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export const LEGAL = {
  terms: { title: "Terms of Service", body: "These terms govern your use of The Parabellum Company website and services. By engaging our services you agree to the scope, deliverables, and payment terms defined in your project agreement. All custom tooling, storefronts, and automations delivered remain operator-owned upon final payment unless otherwise specified in a licensing agreement." },
  privacy: { title: "Privacy Policy", body: "We collect only the information necessary to deliver our services and respond to inquiries. Form submissions, contact details, and project briefs are used solely to communicate with you and scope your project. We do not sell your data. Analytics are used in aggregate to improve site performance." },
  "acceptable-use": { title: "Acceptable Use", body: "Our tools and platforms are provided for lawful commercial merchandise operations. You agree not to use Parabellum systems to infringe intellectual property, distribute prohibited content, or circumvent access controls. Licensed white-label deployments are subject to the tier limits defined in your licensing agreement." },
};
