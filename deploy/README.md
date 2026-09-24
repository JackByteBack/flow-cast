# Deploying the FlowCast backend (Docker on a VPS)

The site has two halves:

| Piece | Runs where | URL |
|---|---|---|
| React frontend | Vercel (static) | https://flow-cast-ashen.vercel.app |
| FastAPI + Postgres | **This Docker stack on your VPS** | `https://YOUR-BACKEND-DOMAIN` |

`frontend/vercel.json` rewrites `/api/*` and `/uploads/*` to the backend domain, so
the browser only ever talks to `flow-cast-ashen.vercel.app` and login works exactly
like it does locally behind nginx.

## 1. Create the server

- Any Ubuntu 22.04/24.04 VM (DigitalOcean / Hetzner / Vultr), 1 GB RAM is plenty.
- Open inbound ports **80** and **443** in the provider's firewall.
- Optional but recommended: buy a domain (or a subdomain) for the API.

## 2. Point DNS at it

Create an **A record**: `api.yourdomain.com` → the VPS public IP.

No domain? Use `YOUR.IP.ADDR.nip.io` — it resolves to your IP automatically and
Caddy can still get a real Let's Encrypt certificate for it.

## 3. Install Docker on the server

```bash
curl -fsSL https://get.docker.com | sh
```

## 4. Get the code on the server

```bash
git clone https://github.com/JackByteBack/flow-cast.git
cd "flowcast code/deploy"      # folder name depends on the clone
```

## 5. Configure it

```bash
cp .env.example .env
nano .env
```

Must-edit values:

- `BACKEND_DOMAIN` — the DNS name from step 2.
- `POSTGRES_PASSWORD` — a long random string.
- `JWT_SECRET` — generate with `openssl rand -hex 32`.

`.env` is git-ignored; never commit it.

## 6. Start it

```bash
chmod +x deploy.sh
./deploy.sh
```

This builds the backend image, starts Postgres + Caddy, **runs the Alembic
migrations automatically**, and waits for `/health`.

Check it:

```bash
curl https://api.yourdomain.com/health
# {"status":"ok","version":"0.1.0"}
```

API docs are at `https://api.yourdomain.com/docs`.

## 7. Point Vercel at it (the step that fixes the live site)

Edit `frontend/vercel.json` and replace **both** occurrences of
`https://api.YOUR-DOMAIN.example` with your real backend URL, then push:

```bash
cd ..
git add frontend/vercel.json
git commit -m "Point Vercel /api and /uploads rewrites at the VPS backend"
git push
```

If your repo is connected to Vercel, it redeploys automatically. Otherwise run
`vercel --prod` from `frontend/`.

## 8. Verify

```bash
# must return JSON (an auth error), not HTML:
curl -X POST https://flow-cast-ashen.vercel.app/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"you@example.com","password":"..."}'
```

Then log in on the site.

## Updating later

```bash
cd deploy && git pull && ./deploy.sh
```

Data (users, routes, uploaded photos) lives in Docker volumes and survives
rebuilds. Back up with:

```bash
docker compose exec -T db pg_dump -U flowcast flowcast > backup.sql
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `POST /api/... login → 405 / HTML` on the live site | `frontend/vercel.json` still has `YOUR-DOMAIN.example`, or Vercel hasn't redeployed |
| `curl: (60) SSL certificate problem` right after first start | Wait 30s — Caddy is fetching the Let's Encrypt cert; it retries automatically |
| Login page says "server returned a non-JSON response" | Backend down: `docker compose ps` and `docker compose logs backend` |
| Photo uploads fail only on the live site (>4 MB) | Vercel's proxy may cap the body size. In Vercel → Settings → Environment Variables add `VITE_API_BASE=https://api.yourdomain.com/api/v1` and redeploy; the browser then talks to the backend directly (CORS already allows the Vercel origin) |
| `502 Bad Gateway` from Caddy | Backend crashed — `docker compose logs backend` |
