# System Architecture

## High-Level Overview

```
                         ┌─────────────────────────────┐
                         │         Client Browser        │
                         └──────────────┬───────────────┘
                                        │ HTTP (port 80)
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
git push ──► lint ──► test ──► build & push (GHCR) ──► deploy (Railway webhook)
              │         │
           ruff      pytest
           eslint     jest
```

## Component Descriptions

### Nginx
- Entry point for all traffic on port 80
- Routes `/api/*` to FastAPI (strips `/api` prefix)
- Routes everything else to Next.js
- Handles WebSocket upgrades for Next.js HMR in development

### FastAPI Backend
- RESTful API built with Python 3.11
- Routers: `/auth`, `/restaurants`, `/tables`, `/bookings`, `/reviews`
- JWT middleware validates Supabase tokens on every protected route
- Uses Supabase service role key for database operations
- Pydantic v2 models for strict request/response validation

### Next.js Frontend
- App Router with server and client components
- Route groups: `(customer)`, `(owner)`, `(admin)` for layout separation
- Direct Supabase JS calls for auth (login/register)
- `lib/api.ts` wraps all backend calls with Bearer token injection

### Supabase
- PostgreSQL database with Row Level Security (RLS)
- Auth service issues JWT tokens verified by both frontend and backend
- Service role key used by backend to bypass RLS where needed

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
