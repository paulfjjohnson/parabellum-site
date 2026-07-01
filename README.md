# The Parabellum Company

Marketing + commerce site for **Parabellum Technologies (dba The Parabellum Company)** — a merch-tech studio that builds packaged, Tee Shirt Ali–style custom-apparel sites and evaluates business technology stacks.

Black/gold editorial design system · Cormorant Garamond + Space Mono.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React Router 7, Tailwind + shadcn/ui, Framer Motion |
| Backend | FastAPI (Python 3.11+), Motor (async MongoDB) |
| Database | MongoDB |
| AI | Claude (`claude-sonnet-4-6`) — via your own Anthropic key or the Emergent proxy |
| Payments | PayPal (setup-fee checkout on the Package Builder) |
| Email | SMTP (host mailbox) for lead notifications |

---

## Features

- **Marketing site** — Home, Services (6 detail pages), 3 pillar pages (Tee Party, Digital Products, AI + Automation), About, Partners, Drops, Contact, Legal.
- **Featured Work** — live Tee Shirt Ali case study + "see it live" links throughout.
- **Interactive tools**
  - **Team Store Strategy Wizard** — 8-step intake → AI-generated platform strategy document.
  - **Gang Sheet Builder** — animated auto-packing DTF demo.
  - **Product Configurator** — live SVG tee with real-time pricing.
  - **Package Builder** (`/pricing`) — pick a tier + add-ons, flat vs. revenue-share billing, live pricing, then **Buy Now (PayPal)** or **Request a Quote**.
- **Lead capture** — Contact, Request-a-Launch, and package quotes/orders persist to MongoDB, email you via SMTP, and appear in the admin dashboard.
- **Admin dashboard** (`/admin`) — JWT-protected lead inbox with filters (Packages / Launch / Contact).

---

## Quick start (local)

### Backend
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then fill in values
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
yarn install
# set REACT_APP_BACKEND_URL in frontend/.env (e.g. http://localhost:8001)
yarn start                    # dev
# or: yarn build              # production static files -> frontend/build/
```

> All backend routes are prefixed with **`/api`**. The frontend must call the backend via `REACT_APP_BACKEND_URL`.

---

## Environment variables

**Backend** (`backend/.env` — see `backend/.env.example`)

| Var | Purpose |
|---|---|
| `MONGO_URL`, `DB_NAME` | MongoDB connection |
| `CORS_ORIGINS` | Allowed origins |
| `JWT_SECRET` | Admin auth token signing (use a fresh random value in prod) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seeded admin login |
| `LEAD_NOTIFY_EMAIL`, `SMTP_*` | Lead notification emails |
| `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_BASE` | PayPal checkout (live: `https://api-m.paypal.com`) |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | AI wizard (direct Anthropic; portable off-platform) |
| `EMERGENT_LLM_KEY` | AI wizard fallback while on the Emergent platform |

**Frontend** (`frontend/.env`)

| Var | Purpose |
|---|---|
| `REACT_APP_BACKEND_URL` | Base URL of the backend |

---

## Editing pricing

All tier and add-on pricing lives in one place: the `TIERS` and `ADDONS` dicts in
`backend/server.py`. Edit there and restart — the frontend updates automatically via
`GET /api/packages`.

---

## Admin access

- Login at `/admin/login` → dashboard at `/admin`.
- Credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (admin is seeded on startup).

---

## Deployment

See **[`DEPLOYMENT.md`](./DEPLOYMENT.md)** for full instructions (self-hosting on
React + FastAPI + MongoDB, reverse-proxy example, SMTP §7, PayPal §8).

> **Security:** `.env` files are never committed. Recreate secrets on your host, use a
> fresh `JWT_SECRET` in production, and rotate any credentials that were shared during
> development (PayPal secret, admin password).

---

*Si vis pacem, para bellum — built for operators, engineered for scale.*
