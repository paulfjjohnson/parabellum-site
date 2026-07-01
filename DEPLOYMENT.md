# Deploying The Parabellum Company Site to Your Own Host

Stack: **React (frontend) + FastAPI/Python (backend) + MongoDB**.
Your host supports all three, so this ports directly.

---

## 1. Get the code

Push to GitHub from Emergent ("Save to GitHub"), then on your host/machine:

```bash
git clone <your-repo-url>
cd <repo>
```

Repo layout:
```
/backend    FastAPI app (server.py, requirements.txt)
/frontend   React app (yarn, craco)
```

---

## 2. MongoDB

Create a database (MongoDB Atlas free tier or your host's Mongo) and copy the
connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net`.

---

## 3. Backend (FastAPI / Python 3.11+)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` (see `backend/.env.example`):

```
MONGO_URL="<your mongo connection string>"
DB_NAME="parabellum"
CORS_ORIGINS="https://yourdomain.com"
# --- AI: use YOUR OWN Anthropic key when off Emergent ---
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-sonnet-4-6-20260218"
```

Run it (production):

```bash
uvicorn server:app --host 0.0.0.0 --port 8001
# or with gunicorn:
# gunicorn server:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001
```

Keep it alive with your host's process manager (systemd, pm2, supervisor, Docker).

> **All backend routes are prefixed with `/api`.** Point your reverse proxy so
> `https://yourdomain.com/api/*` → the FastAPI service on port 8001.

### AI key behavior (important)
- The code auto-detects the key:
  - If **`ANTHROPIC_API_KEY`** is set → calls Anthropic directly (portable, what you want on your host).
  - Else if `EMERGENT_LLM_KEY` is set → uses Emergent's proxy (only works while on Emergent).
- Get an Anthropic key at https://console.anthropic.com. The `emergentintegrations`
  library is optional — the backend runs fine without it once `ANTHROPIC_API_KEY` is set.

---

## 4. Frontend (React)

Set the backend URL **before building** (it's compiled in). Create `frontend/.env`:

```
REACT_APP_BACKEND_URL=https://yourdomain.com
```

Build:

```bash
cd frontend
yarn install
yarn build      # outputs static files to frontend/build/
```

Serve `frontend/build/` as static files (your Node/static host, Nginx, or a CDN).
For client-side routing, add a catch-all rewrite to `index.html`.

---

## 5. Reverse proxy example (Nginx)

```nginx
server {
  server_name yourdomain.com;

  location /api/ {
    proxy_pass http://127.0.0.1:8001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location / {
    root /var/www/parabellum/frontend/build;
    try_files $uri /index.html;   # SPA routing
  }
}
```

---

## 6. Verify

```bash
curl https://yourdomain.com/api/            # {"message":"Hello World"}
curl -X POST https://yourdomain.com/api/wizard/strategy \
  -H "Content-Type: application/json" \
  -d '{"answers":{"orgName":"Test","goals":["Fundraising"]}}'
# → {"sections":[ ... 11 items ... ]}
```

If the wizard returns 502, check that `ANTHROPIC_API_KEY` is set and the backend
process was restarted after editing `.env`.
