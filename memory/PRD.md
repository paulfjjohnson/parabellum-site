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

## Implemented (June–July 2026)
- Global: Navbar, Footer, Ticker, Crest, Reveal animations, CTA section, sonner toaster
- Home (8 sections), Services index + 6 detail pages, 3 pillar pages, Tools hub + 3 tools, About, Contact, Request-a-Launch, Partners, Drops, Legal
- **AI Team Store Wizard (LIVE)**: POST /api/wizard/strategy generates an ~11-section custom strategy doc via Claude (`claude-sonnet-4-6`). Verified 7/7 backend + full frontend flow (loading state, AI-generated badge, personalized content). Client-side fallback if AI fails.
- **Portable AI**: backend auto-detects `ANTHROPIC_API_KEY` (direct Anthropic, off-Emergent) vs `EMERGENT_LLM_KEY` (on-Emergent). `emergentintegrations` import is optional.
- **Deployment docs**: `/app/DEPLOYMENT.md`, `backend/.env.example`, `frontend/.env.example` for porting to user's own React+FastAPI+MongoDB host.

## Featured Work + Capability Mirror (July 2026) — DONE
- **Tee Shirt Ali case study** (`FeaturedWork`) on Home: live-in-production callout with image, stats, description, and outbound "See it live →" link to teeshirtali.com.
- **Powered Capabilities** grid on Home mirroring Tee Shirt Ali's full feature set (School Stores, Team Stores, Design Library, Configurator, Blank Apparel, Gang Sheet Builder, DTF Printing, Fundraiser Merch, Graphic Design, Promotional Products, Event Merchandise, Customer Portal) + "See it live on Tee Shirt Ali" link.
- **"See it live" outbound links** added to: Tools hub, Configurator (→ /configurator/), Gang Sheet Builder (→ /gang-sheet-builder/), and the Custom Apparel Tech service page.

## Backlog / Next
- P2: Real gang-sheet file upload w/ DPI detection + PDF export (jsPDF)
- P2: WooCommerce-style shop for Digital Products & Drops
- P2: Email notification to admin on new lead (Resend/SendGrid)

## Auth & Leads (July 2026) — DONE
- JWT (Bearer) admin auth, single seeded admin (paul@theparabellumco.com). Login /admin/login → dashboard /admin.
- Contact + Request-a-Launch persist to Mongo `submissions`; protected GET /api/admin/submissions lists them.
- Brute-force lockout (5/15min) keyed on X-Forwarded-For client IP. Verified 12/12 backend + full frontend flow.
