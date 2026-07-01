# The Parabellum Company — Website

## Original Problem Statement
Rebuild the theparabellumco.com merch-tech marketing site (originally spec'd for WordPress/WooCommerce/Flatsome) as a modern React app, preserving the exact black/gold design system, Cormorant Garamond + Space Mono typography, and all content. Company: Parabellum Technologies (dba The Parabellum Company) — solutions for the custom apparel industry + tech-stack evaluations.

## User Choices
- Rebuild in React with same look & content
- Scope: Everything (all pages + both interactive tools)
- Team Store Wizard: UI only (NO AI wired — generates a templated strategy doc client-side)
- Contact / Request-a-Launch forms: UI only (NO backend saving — toast confirmation)
- Imagery: sourced (Unsplash editorial B&W apparel/print)

## Architecture
- Frontend: React 19 + react-router-dom 7 + framer-motion + Tailwind + shadcn, `@/` alias to src
- Design system in `src/index.css` (CSS variables per spec), data in `src/data/site.js`
- Backend: default FastAPI/Mongo template (unused for now — no persistence requested)

## Implemented (June 2026)
- Global: Navbar (transparent→solid on scroll, mobile menu), Footer (4-col), Ticker marquee, Crest SVG, Reveal animations, CTA section, sonner toaster
- Home: 8 sections (Hero, Ticker, Revenue Engine, Audience Tabs, Launch Sequence, CTA, Field Notes, Email Capture)
- Services index + 6 dynamic service detail pages (`/services/:slug`)
- 3 pillar pages: Tee Party, Digital Products, AI + Automation
- Tools hub + 3 interactive tools:
  - Team Store Wizard (8-step, generates 12-section strategy doc client-side)
  - Gang Sheet Builder (4-step auto-packing animated demo w/ shelf-pack + utilization meter + licensing tiers)
  - Product Configurator (live SVG t-shirt, color/text/placement/method/size/qty, live pricing)
- About, Contact (form UI), Request a Launch (form UI), Partners, Drops (Field Notes), Legal (terms/privacy/acceptable-use)

## Backlog / Next
- P1: Wire Team Store Wizard to Claude (Emergent LLM key) for real AI strategy docs
- P1: Persist Contact / Request-a-Launch submissions to MongoDB + admin view
- P2: Real gang-sheet file upload w/ DPI detection + PDF export (jsPDF)
- P2: WooCommerce-style shop for Digital Products & Drops
