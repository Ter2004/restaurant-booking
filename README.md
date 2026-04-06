# Restaurant Booking Platform

A full-stack restaurant reservation system built for the DevOps/Deployment university course.

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://divine-success-production-cad5.up.railway.app |
| Backend API | https://restaurant-booking-production-1084.up.railway.app |
| API Docs | https://restaurant-booking-production-1084.up.railway.app/docs |

## Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Frontend         | Next.js 14 (App Router) + Tailwind CSS |
| Backend          | FastAPI (Python 3.11)               |
| Database / Auth  | Supabase (PostgreSQL + JWT)         |
| Containerization | Docker + Docker Compose             |
| Reverse Proxy    | Nginx                               |
| CI/CD            | GitHub Actions                      |
| Deployment       | Railway                             |
| Rate Limiting    | slowapi                             |

## Features

- **Auth** — Register / Login / Logout (Customer, Owner, Admin roles)
- **Restaurants** — Full CRUD for restaurant profiles (Owner)
- **Tables** — Manage tables per restaurant with zone/capacity (Owner)
- **Bookings** — Create, view, cancel reservations with conflict detection (Customer)
- **Owner Bookings** — Incoming booking management with confirm/complete/cancel (Owner)
- **Reviews** — Leave ratings after completed bookings (Customer)

## Local Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)
- A [Supabase](https://supabase.com) project

### 1. Clone and configure environment

```bash
git clone https://github.com/Ter2004/restaurant-booking.git
cd restaurant-booking

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit both `.env` files with your Supabase credentials.

### 2. Run the Supabase migration

In your Supabase project dashboard → SQL Editor, run:

```
backend/supabase/migrations/001_init.sql
```

### 3. Start with Docker Compose

```bash
docker compose up --build
```

| Service   | URL                        |
|-----------|----------------------------|
| App       | http://localhost            |
| Frontend  | http://localhost:3000       |
| Backend   | http://localhost:8000       |
| API Docs  | http://localhost:8000/docs  |

### 4. Local development (without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### backend/.env

| Variable               | Description                          |
|------------------------|--------------------------------------|
| `SUPABASE_URL`         | Your Supabase project URL            |
| `SUPABASE_SERVICE_KEY` | Service role key (server-side only)  |
| `SUPABASE_JWT_SECRET`  | JWT secret from Supabase settings    |
| `ALLOWED_ORIGINS`      | CORS origins (comma-separated list)  |
| `APP_ENV`              | `development` or `production`        |

### frontend/.env

| Variable                        | Description                     |
|---------------------------------|---------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key        |
| `NEXT_PUBLIC_API_URL`           | FastAPI backend URL             |

## Running Tests

```bash
# Backend
cd backend && pytest tests/ -v

# Frontend
cd frontend && npm test
```

## Git Workflow

- `main` — production
- `develop` — staging
- `feature/*` — new features

Commit format: [Conventional Commits](https://www.conventionalcommits.org/)

## Third-Party Libraries & Credits

### Backend
| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115.x | REST API framework | MIT |
| [Uvicorn](https://www.uvicorn.org/) | 0.34.x | ASGI server | BSD |
| [supabase-py](https://github.com/supabase-community/supabase-py) | 2.x | Supabase client | MIT |
| [python-jose](https://github.com/mpdavis/python-jose) | 3.3.x | JWT encoding/decoding | MIT |
| [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) | 2.x | Settings management | MIT |
| [slowapi](https://github.com/laurentS/slowapi) | 0.1.9 | Rate limiting | MIT |
| [httpx](https://www.python-httpx.org/) | 0.28.x | HTTP client (JWKS fetch) | BSD |
| [pytest](https://pytest.org/) | 8.x | Test framework | MIT |

### Frontend
| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| [Next.js](https://nextjs.org/) | 14.2.35 | React framework | MIT |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | Utility-first CSS | MIT |
| [Supabase JS](https://github.com/supabase/supabase-js) | 2.x | Auth & DB client | MIT |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety | Apache 2.0 |

### Infrastructure
| Tool | Purpose |
|------|---------|
| [Docker](https://www.docker.com/) | Containerization |
| [Nginx](https://nginx.org/) | Reverse proxy |
| [Railway](https://railway.app/) | Cloud deployment |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |
| [Supabase](https://supabase.com/) | Database & Auth |

## Team Members

| Name | GitHub | Role |
|------|--------|------|
| Kittinantantajina | [@Ter2004](https://github.com/Ter2004) | Full Stack / DevOps |

## License

MIT
