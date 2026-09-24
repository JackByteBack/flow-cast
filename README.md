# FlowCast + BarrierLens

> **AI-powered predictive, sustainable, and accessible mobility platform.**
> Predict congestion 30–60 minutes ahead, compare routes across four priorities — *Fast · Green · Reliable · Accessible* — and crowdsource accessibility intelligence from photos.

FlowCast is a **decision-support platform**, not a navigation replacement. It combines predictive traffic intelligence, public-transport reliability, emissions estimates, and accessibility data into one system. **BarrierLens** is its accessibility observation layer: contributors upload photos of entrances, footpaths, and stations, computer vision detects ramps, stairs, elevators, handrails, obstacles, and narrow pathways, and the results feed into accessible route ranking.

---

## Table of Contents

- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start (Docker)](#quick-start-docker)
- [Local Development (without Docker)](#local-development-without-docker)
- [Database Migrations](#database-migrations)
- [Configuration Reference](#configuration-reference)
- [API Reference](#api-reference)
- [Frontend](#frontend)
- [ML Modules](#ml-modules)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Troubleshooting](#troubleshooting)
- [Project Documentation](#project-documentation)

---

## Key Features

| Feature | Status | Description |
| --- | --- | --- |
| **Passwordless Access** | ✅ | No login page — the app opens straight into the map; API writes attach to a shared auto-created **Guest** user (bcrypt placeholder credential, no migration) |
| **BarrierLens Photo Upload** | ✅ | Image validation (JPEG/PNG/WebP, ≤10 MB), stored in `uploads/`, linked to a PostGIS point |
| **Accessibility Detection** | ⚠️ stub | Detects `ramp`, `stairs`, `elevator`, `handrail`, `obstacle`, `narrow_pathway` with confidence scores — currently randomized, real YOLOv8 model pending |
| **Multi-Objective Routing** | ⚠️ stub | Returns 4 ranked options scored on time, delay, CO₂, and accessibility — currently randomized, OSRM integration pending |
| **Traffic Predictions** | ⚠️ stub | Endpoint returns stored predictions + confidence; XGBoost model training still pending |
| **City Dashboard** | ✅ | Metrics cards, congestion summary, accessibility-gap endpoints |
| **Docker Compose Stack** | ✅ | PostGIS + FastAPI + nginx-served frontend |

**Honest status note:** the platform skeleton is complete and every endpoint works end-to-end, but the three AI/routing engines (YOLO detection, XGBoost prediction, OSRM routing) currently return simulated data. See [`brain/tasks.md`](brain/tasks.md) for the full task tracker.

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                             │
│   Commuter Web App (/)                City Dashboard (/dashboard) │
│                   React 18 + Vite + Tailwind CSS + Leaflet        │
└──────────────────────────────┬────────────────────────────────────┘
                               │ REST (nginx proxies /api → backend)
                               ▼
┌───────────────────────────────────────────────────────────────────┐
│                      BACKEND — FastAPI                            │
│   /routes   /traffic   /barrierlens   /dashboard                  │
│   guest mode · response envelope · CORS · static /uploads         │
└──────────────┬───────────────────┬────────────────┬───────────────┘
               ▼                   ▼                ▼
      PostgreSQL 16 + PostGIS    OSRM router     AI/ML layer (/ml)
      (geometry, geospatial      (route engine,  YOLOv8 detection,
       queries, app tables)       pending data)   XGBoost prediction
```

**Data flow:** photo upload → validation → storage → detection stub → `accessibility_locations` / `accessibility_photos` / `accessibility_detections` tables → accessibility score → route ranking → dashboard aggregation.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 6, Tailwind CSS 3, React Router 7, Zustand, Leaflet / React-Leaflet, lucide-react |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2 (async), Pydantic v2, Alembic |
| Database | PostgreSQL 16 + PostGIS 3.4 (`postgis/postgis:16-3.4`) |
| Auth | none — passwordless shared Guest user; `python-jose` / `bcrypt` helpers remain in `core/security.py` |
| Routing | OSRM (`osrm/osrm-backend`) — service defined, needs pilot `.osrm` data |
| ML (planned) | YOLOv8 / Ultralytics (detection), XGBoost (traffic prediction), OpenCV |
| Infra | Docker Compose, nginx (frontend + reverse proxy) |

---

## Repository Structure

```
flowcast-code/
├── backend/
│   ├── alembic/                  # migrations (env.py + versions/)
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, static mounts
│   │   ├── api/
│   │   │   └── routes/           # traffic, barrierlens, route, dashboard
│   │   ├── core/                 # config, database, security, response
│   │   ├── models/               # SQLAlchemy models (PostGIS geometry)
│   │   └── schemas/              # Pydantic request/response models
│   ├── uploads/                  # stored images (git-ignored)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/                # CommuterApp, Dashboard
│   │   ├── components/           # Map, RoutePanel, BarrierLens
│   │   ├── services/api.js       # fetch wrapper
│   │   └── store/useStore.js     # Zustand store
│   ├── nginx.conf                # /api + /uploads proxy
│   └── Dockerfile
├── ml/                           # data/ models/ notebooks/ scripts/ (WIP)
├── brain/                        # PRD, architecture, design, rules, tasks, memory
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick Start (Docker)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2).

```bash
git clone https://github.com/JackByteBack/flow-cast.git
cd flow-cast

# 1. Create your environment file
cp .env.example .env

# 2. Start the stack (db + backend + frontend)
docker compose up --build db backend frontend

# 3. Apply database migrations (first run only)
docker compose exec backend alembic upgrade head
```

Then open:

| Service | URL |
| --- | --- |
| Commuter app | http://localhost:3000 |
| API + Swagger docs | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |
| Postgres | `localhost:5432` (user/pass/db: `flowcast` / `flowcast` / `flowcast`) |

> **Why not plain `docker compose up`?** The `osrm` service requires `ml/data/pilot.osrm` (OpenStreetMap extract for the pilot area), which is not committed — see [ML Modules](#ml-modules). Routing currently works without it because the route engine is stubbed.

Stop everything with `docker compose down` (add `-v` to also delete the database volume).

### Verify the install

```bash
curl http://localhost:8000/health
# {"status":"ok","version":"0.1.0"}
```

---

## Local Development (without Docker)

Useful for hot-reload on both ends. You still need a running PostGIS — the simplest option is starting only the database:

```bash
docker compose up db
```

**Backend:**

```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend** (separate terminal):

```bash
cd frontend
npm install
npm run dev        # Vite dev server on http://localhost:3000
```

Vite proxies `/api` and `/uploads` to `http://localhost:8000` (see `frontend/vite.config.js`), so the dev workflow is identical to the Docker setup.

---

## Database Migrations

Migrations use **Alembic** — never edit schema by hand (project rule §4).

```bash
docker compose exec backend alembic upgrade head          # apply
docker compose exec backend alembic current               # show current revision
docker compose exec backend alembic revision --autogenerate -m "describe change"
```

Notes:

- `alembic/env.py` prefers the `DATABASE_URL_SYNC` environment variable (inside Docker the DB host is `db`, not `localhost`).
- `env.py` excludes PostGIS-owned schemas (`tiger`, `tiger_data`, `topology`) and `spatial_ref_sys` from autogenerate, so extension tables are never dropped or re-created.
- Initial migration `b0ba5d02df63` creates: `users`, `traffic_segments`, `traffic_observations`, `traffic_predictions`, `accessibility_locations`, `accessibility_photos`, `accessibility_detections`, `route_requests`, `route_results`.

---

## Production Deployment (Docker on a VPS)

The live site on Vercel is only the static frontend — API calls need the backend
running on a public server. The repo ships a production stack in **`deploy/`**
(FastAPI + Postgres/PostGIS + Caddy with automatic HTTPS).

How it fits together:

```
browser ──► https://flow-cast-ashen.vercel.app        (Vercel, static React)
                 │  vercel.json rewrites:
                 ├── /api/*     ──► https://YOUR-BACKEND-DOMAIN/api/*
                 └── /uploads/* ──► https://YOUR-BACKEND-DOMAIN/uploads/*
                                        │
                                        └──► Caddy (443) ──► FastAPI ──► Postgres
```

Step-by-step runbook (VPS setup, DNS, migrations, Vercel wiring, updates,
troubleshooting): **[`deploy/README.md`](deploy/README.md)**.

Quick version:

```bash
# on the VPS
git clone https://github.com/JackByteBack/flow-cast.git
cd "flowcast code/deploy" && cp .env.example .env && nano .env   # domain + secrets
./deploy.sh                                                      # builds, migrates, waits for /health

# on your machine — point Vercel at the backend, then push
# edit frontend/vercel.json, replace https://api.YOUR-DOMAIN.example (both lines)
git add frontend/vercel.json && git commit -m "wire Vercel to VPS backend" && git push
```

---

## Configuration Reference

Copy `.env.example` → `.env`. All values are read by `backend/app/core/config.py` (Pydantic Settings).

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+asyncpg://flowcast:flowcast@localhost:5432/flowcast` | Async SQLAlchemy URL |
| `DATABASE_URL_SYNC` | `postgresql://flowcast:flowcast@localhost:5432/flowcast` | Alembic (sync) URL |
| `JWT_SECRET` | `change-me-…` | **Change this** in any deployed environment |
| `JWT_ALGORITHM` | `HS256` | Signing algorithm |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | Access-token lifetime |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh-token lifetime |
| `CORS_ORIGINS` | `["http://localhost:3000","http://localhost:5173"]` | JSON array of allowed origins |
| `UPLOAD_DIR` | `uploads` | Image storage directory |
| `MAX_UPLOAD_SIZE` | `10485760` | Max upload size in bytes (10 MB) |
| `ALLOWED_IMAGE_TYPES` | `["image/jpeg","image/png","image/webp"]` | MIME-type whitelist |
| `OSRM_BASE_URL` | `http://localhost:5000` | OSRM router base URL |
| `APP_NAME` / `APP_VERSION` / `DEBUG` | `FlowCast + BarrierLens` / `0.1.0` / `true` | App metadata; `DEBUG` toggles SQL echo |

`docker-compose.yml` additionally overrides `DATABASE_URL` / `DATABASE_URL_SYNC` to host `db` inside the compose network.

---

## API Reference

Base path: **`/api/v1`**. Interactive docs: **http://localhost:8000/docs**

### Response envelope

Every successful response uses the same shape:

```json
{
  "success": true,
  "data": { },
  "message": "optional message",
  "errors": []
}
```

### Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/traffic/predictions?lat=&lng=` | — | Predictions within the next hour around a point |
| `GET` | `/traffic/hotspots` | — | Congestion hotspot aggregates |
| `POST` | `/barrierlens/upload?lat=&lng=&address=` | — | Upload photo (`multipart/form-data`, field `file`), run detection, store results |
| `GET` | `/barrierlens/locations?lat=&lng=` | — | Scanned locations with accessibility scores |
| `GET` | `/barrierlens/locations/{location_id}` | — | Location detail incl. photos and detections |
| `POST` | `/routes/calculate` | — | Generate 4 ranked route options |
| `GET` | `/routes/history` | — | Recent route requests (shared Guest user) |
| `GET` | `/dashboard/congestion-summary` | — | Aggregated congestion view |
| `GET` | `/dashboard/accessibility-gaps` | — | Areas with sparse accessibility data |
| `GET` | `/dashboard/stats` | — | `active_users`, `locations_scanned`, `total_detections`, `predictions_made` |
| `GET` | `/health` | — | Liveness probe (outside `/api/v1`) |

### Examples

**Calculate routes**

```bash
curl -X POST http://localhost:3000/api/v1/routes/calculate \
  -H 'Content-Type: application/json' \
  -d '{"origin_lat":12.97,"origin_lng":77.59,"dest_lat":12.99,"dest_lng":77.62,"priority":"fast"}'
```

```json
{
  "success": true,
  "data": {
    "request_id": "658ed3da-…",
    "routes": [
      {
        "rank": "fast",
        "travel_time": 38.1,
        "delay": 3.6,
        "emissions": 0.48,
        "accessibility_score": 7.3,
        "distance_km": 4.0,
        "geometry": "{\"type\":\"LineString\",\"coordinates\":[[77.59,12.97],[77.62,12.99]]}"
      }
    ]
  }
}
```

`priority` is one of `fast`, `green`, `reliable`, `accessible` — each response always contains all four ranked options.

**Upload a photo to BarrierLens**

```bash
curl -X POST "http://localhost:3000/api/v1/barrierlens/upload?lat=12.97&lng=77.59&address=Main%20St" \
  -F "file=@photo.jpg"
```

```json
{
  "success": true,
  "data": {
    "photo_id": "e69cc5bd-…",
    "location_id": "6e14576f-…",
    "detections": [
      { "feature_type": "narrow_pathway", "confidence": 0.79, "bbox": [16, 199, 161, 90] },
      { "feature_type": "handrail",       "confidence": 0.78, "bbox": [184, 187, 150, 129] }
    ],
    "overall_score": 6.4
  }
}
```

Uploads are served back at `http://localhost:3000/uploads/<filename>` (proxied to the backend).

**Errors** use FastAPI's standard shape, e.g. `{"detail": "Location not found"}` with status `404`, or a Pydantic validation array with status `422`.

---

## Frontend

| Route | Page | Notes |
| --- | --- | --- |
| `/` | `CommuterApp` | Landing page — map + route panel + BarrierLens upload; no login required |
| `/dashboard` | `Dashboard` | City planner metrics, congestion summary, accessibility gaps (linked from the map header and back) |

There is no login page and no token: `src/services/api.js` calls the API directly, and the backend attributes writes to its shared Guest user. Design tokens (route colors: Fast `#2563EB`, Green `#10B981`, Reliable `#F59E0B`, Accessible `#8B5CF6`) are documented in [`brain/design.md`](brain/design.md).

Useful commands:

```bash
npm run dev       # dev server on :3000 (proxies /api → :8000)
npm run build     # production build → dist/
npm run preview   # preview the production build
```

---

## ML Modules

Everything under `ml/` is scaffolded but empty — this is the main remaining work item.

| Module | Planned | Current state |
| --- | --- | --- |
| **BarrierLens detection** | YOLOv8 fine-tuned on accessibility features | `run_detection_stub()` returns 1–3 random classes with random confidences/bboxes |
| **Traffic prediction** | XGBoost on time-of-day / day-of-week / historical features | Endpoint reads `traffic_predictions` table; model training pending; no seeded rows yet (`predictions_made: 0`) |
| **Routing** | OSRM candidate routes + multi-objective scoring | `generate_route_options()` returns 4 deterministic-shape / randomized-metric options; OSRM container defined but needs pilot data |

Directory layout: `ml/data/` (OSM extracts, datasets), `ml/models/` (versioned artifacts), `ml/notebooks/`, `ml/scripts/`.

To enable OSRM:

1. Download an OSM extract for the pilot area (e.g. from Geofabrik).
2. Process it with `osrm-extract` + `osrm-partition` + `osrm-customize` into `ml/data/pilot.osrm*`.
3. `docker compose up osrm`, then point `OSRM_BASE_URL` at `http://localhost:5000`.

---

## Testing

Planned targets from [`brain/rules.md`](brain/rules.md): ≥80% backend service coverage, integration tests per endpoint, React Testing Library component tests, ML metrics logged per model version. **No test suite exists yet** — when it lands, expect:

```bash
# backend
cd backend && pytest

# frontend
cd frontend && npm test
```

---

## Roadmap

Tracked in [`brain/tasks.md`](brain/tasks.md). Highlights:

- [ ] Train and evaluate the XGBoost traffic model; seed pilot-area data
- [ ] Swap detection stub for real YOLOv8 inference (background tasks, non-blocking)
- [ ] Generate pilot OSM data and wire OSRM into route scoring
- [ ] Candidate route generation, reliability scoring, CO₂ estimation, accessibility ranking
- [ ] Detection verification/flagging endpoints + UI (human-in-the-loop trust)
- [ ] Dashboard: congestion heatmap, accessibility gap map, trend charts, alerts, export
- [ ] Dark mode, WCAG 2.1 AA audit, loading skeletons
- [ ] Unit/integration/component tests, cloud deployment, HTTPS, monitoring

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `failed to connect to the docker API … docker.sock` | Docker Desktop isn't running: `open -a Docker`, wait ~30 s for the daemon, retry |
| `relation "…" already exists` / `cannot drop table … extension postgis_tiger_geocoder requires it` | Your `alembic` migration predates the extension-table guard — pull latest `backend/alembic/` |
| `ModuleNotFoundError: No module named 'psycopg2'` | `pip install psycopg2-binary`, or rebuild: `docker compose build backend && docker compose up -d backend` |
| `connection to server at "localhost" … refused` when running Alembic | Inside Docker use the compose-provided `DATABASE_URL_SYNC` (host `db`); on the host make sure `docker compose up db` is running and the port is free |
| Backend can't reach Postgres after editing `.env` | Recreate the container: `docker compose up -d backend` |
| `POST /api/v1/... 404` behind nginx | The frontend proxy only forwards `/api/` and `/uploads/`; call `/health` on port 8000 directly |
| Port already in use | Free `3000`, `8000`, or `5432`, or edit the port mappings in `docker-compose.yml` |
| Uploaded image rejected | Whitelist is JPEG/PNG/WebP, max 10 MB (`ALLOWED_IMAGE_TYPES`, `MAX_UPLOAD_SIZE`) |

---

## Project Documentation

The [`brain/`](brain/) folder is the single source of truth for product documentation (project rule §9):

| File | Contents |
| --- | --- |
| [`prd.md`](brain/prd.md) | Problem statement, proposed solution, users, success metrics |
| [`architecture.md`](brain/architecture.md) | System diagrams, technology stack, data model |
| [`design.md`](brain/design.md) | Design system: colors, typography, components, UX rules |
| [`rules.md`](brain/rules.md) | Code style, API, database, security, accessibility, testing rules |
| [`tasks.md`](brain/tasks.md) | Phase-by-phase task tracker and hackathon critical path |
| [`memory.md`](brain/memory.md) | Decision log, timeline, known issues, gotchas |

---

*FlowCast + BarrierLens — built for predictive, sustainable, and accessible mobility.*
