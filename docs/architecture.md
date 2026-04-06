# System Architecture

## High-Level Overview

```
                         ┌─────────────────────────────┐
                         │         Client Browser        │
                         └──────────────┬───────────────┘
                                        │ HTTPS
                         ┌──────────────▼───────────────┐
                         │        Nginx (port 80)        │
                         │      Reverse Proxy / LB       │
                         └────────┬──────────┬───────────┘
                                  │          │
              /api/* (rewrite)    │          │   /*
                         ┌────────▼───┐  ┌───▼──────────┐
                         │  FastAPI   │  │   Next.js 14  │
                         │  (port     │  │   (port 3000) │
                         │   8000)    │  │               │
                         └─────┬──────┘  └──────┬────────┘
                               │                │
                    Supabase   │                │ Supabase JS
                    Python     │                │ (anon key)
                    client     │                │
                         ┌─────▼────────────────▼────────┐
                         │          Supabase              │
                         │  ┌──────────────────────────┐  │
                         │  │   PostgreSQL (RLS)        │  │
                         │  │   - profiles              │  │
                         │  │   - restaurants           │  │
                         │  │   - tables                │  │
                         │  │   - bookings              │  │
                         │  │   - reviews               │  │
                         │  └──────────────────────────┘  │
                         │  ┌──────────────────────────┐  │
                         │  │   Auth (JWT)              │  │
                         │  └──────────────────────────┘  │
                         └────────────────────────────────┘
```

## CI/CD Pipeline (GitHub Actions)

```
git push ──► lint ──► test ──► build & push (GHCR) ──► deploy (Railway CLI)
              │         │              │
           ruff      pytest        docker
           eslint     jest       buildx push
```

## Component Descriptions

### Nginx
- Entry point for all traffic on port 80
- Routes `/api/*` to FastAPI (strips `/api` prefix)
- Routes everything else to Next.js
- `restart: unless-stopped` and health check ensure automatic recovery

### FastAPI Backend
- RESTful API built with Python 3.11
- Routers: `/auth`, `/restaurants`, `/tables`, `/bookings`, `/reviews`
- JWT middleware validates Supabase tokens on every protected route
- Uses Supabase service role key for database operations
- Pydantic v2 models for strict request/response validation
- Rate limiting via `slowapi`: 5 req/min on login, 3 req/min on register

### Next.js Frontend
- App Router with server and client components
- Route groups: `(customer)`, `(owner)`, `(admin)` for layout separation
- Direct Supabase JS calls for auth (login/register)
- `lib/api.ts` wraps all backend calls with Bearer token injection

### Supabase
- PostgreSQL database with Row Level Security (RLS)
- Auth service issues JWT tokens verified by both frontend and backend
- Service role key used by backend to bypass RLS where needed
- Managed backups provided by Supabase (daily snapshots on free tier)

## Database Schema Overview

```
auth.users (Supabase managed)
    │
    └──► profiles (id FK → auth.users)
              role: customer | owner | admin

profiles ──► restaurants (owner_id FK)
                  │
                  └──► tables (restaurant_id FK)

profiles ──► bookings (customer_id FK)
restaurants ──► bookings (restaurant_id FK)
tables ──► bookings (table_id FK)

bookings ──► reviews (booking_id FK, unique — one review per booking)
profiles ──► reviews (customer_id FK)
restaurants ──► reviews (restaurant_id FK)
```

## Scalability Architecture

### Current State (Vertical Scaling)
The current deployment runs one instance of each service on Railway's shared infrastructure. Vertical scaling can be achieved by upgrading the Railway plan to increase CPU/RAM allocation per service.

### Horizontal Scaling Plan

```
                    ┌──────────────────────────┐
                    │    Load Balancer          │
                    │  (Railway / Nginx)        │
                    └────┬──────────┬───────────┘
                         │          │
              ┌──────────▼──┐  ┌────▼────────┐
              │  Backend 1  │  │  Backend 2  │  ← scale out
              │  (FastAPI)  │  │  (FastAPI)  │
              └──────┬──────┘  └──────┬──────┘
                     │                │
              ┌──────▼────────────────▼──────┐
              │         Supabase             │
              │   (shared managed DB)        │
              └──────────────────────────────┘
```

**Steps to scale horizontally:**
1. **Backend**: Stateless design (JWT auth, no local session) — can run N replicas behind a load balancer immediately
2. **Frontend**: Next.js standalone output is stateless — deploy multiple instances with shared CDN (e.g., Vercel, Cloudflare)
3. **Database**: Supabase handles connection pooling via PgBouncer; upgrade to Pro plan for read replicas
4. **Nginx**: Replace with a managed load balancer (Railway, AWS ALB) when scaling beyond one host

**Bottleneck to address first:** The database connection pool. FastAPI uses synchronous Supabase client — under heavy load, switch to async `asyncpg` with a connection pool of 10–20 connections per backend instance.

### Vertical Scaling
| Component | Current | Scaled |
|-----------|---------|--------|
| Backend | 512MB RAM, 0.5 vCPU | 2GB RAM, 2 vCPU |
| Frontend | 512MB RAM | 1GB RAM |
| Database | Supabase Free (500MB) | Supabase Pro (8GB) |

## Resilience Measures

### Container Level (Docker Compose)
- All services use `restart: unless-stopped` — automatically restarts on crash
- Health checks on all three services (backend, frontend, nginx)
- Nginx only starts after backend and frontend pass health checks (`depends_on: condition: service_healthy`)

### Health Check Endpoint
```
GET /health → {"status": "ok", "version": "1.1.0"}
```
Used by Docker health checks and can be polled by external monitors (UptimeRobot, Better Stack).

### Database Backup
- Supabase Free tier: daily backups retained for 7 days
- Manual backup: export via `pg_dump` using Supabase connection string
- RLS policies prevent data leakage even if application layer is compromised

### Railway Auto-Restart
Railway automatically restarts crashed services and sends alerts. Combined with GitHub Actions auto-deploy on push to `main`, any fix is deployed within minutes.

## System Build Process

The project is assembled into deployable artifacts through the following pipeline:

### Backend Build
```
requirements.txt
      │
      ▼
pip install (Docker layer cache)
      │
      ▼
Python source (app/, main.py)
      │
      ▼
uvicorn main:app  ← runtime entrypoint
```
The backend Dockerfile is a single-stage build. Dependencies are installed first to leverage Docker layer caching — only reinstalled when `requirements.txt` changes.

### Frontend Build
```
package.json / package-lock.json
      │
      ▼  Stage 1: deps
npm ci (node_modules)
      │
      ▼  Stage 2: builder
NEXT_PUBLIC_* build args injected
npm run build → .next/standalone/
      │
      ▼  Stage 3: runner
Copy standalone output + static files
node server.js  ← runtime entrypoint
```
Three-stage multi-stage build minimizes the final image. The `output: standalone` Next.js config bundles only the required Node.js modules, reducing image size by ~70%.

### CI/CD Assembly
1. GitHub Actions triggers on `push` to `main` or `develop`
2. Lint stage validates code quality (ruff, eslint) — fails fast before expensive steps
3. Test stage runs pytest and jest with mocked dependencies
4. Build stage uses `docker/build-push-action` to build and push images to GitHub Container Registry (GHCR)
5. Deploy stage triggers Railway to pull the new image and restart services

## Technology Justification

| Choice | Reason |
|--------|--------|
| **FastAPI** | Async, auto-generated OpenAPI docs, Pydantic integration, Python ecosystem |
| **Next.js 14** | App Router SSR/SSG, excellent DX, `output: standalone` for Docker |
| **Supabase** | Managed Postgres + Auth + RLS, removes need for custom auth server |
| **Docker multi-stage** | Minimal production images (~80MB frontend, ~120MB backend) |
| **Nginx** | Battle-tested reverse proxy, simple config, low overhead |
| **GitHub Actions** | Native GitHub integration, free for public repos, large action ecosystem |
| **Railway** | Simple PaaS with Docker support, auto-deploy from GHCR, reasonable free tier |
| **slowapi** | Lightweight ASGI rate limiter, integrates directly with FastAPI decorators |
