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

## Backlog / Next
- P1: Persist Contact / Request-a-Launch submissions to MongoDB + admin view
- P2: Real gang-sheet file upload w/ DPI detection + PDF export (jsPDF)
- P2: WooCommerce-style shop for Digital Products & Drops
