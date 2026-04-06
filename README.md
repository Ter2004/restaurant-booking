# Restaurant Booking Platform

A full-stack restaurant reservation system built for the DevOps/Deployment university course.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | Next.js 14 (App Router) + Tailwind  |
| Backend        | FastAPI (Python 3.11)               |
| Database / Auth| Supabase (PostgreSQL + JWT)         |
| Containerization | Docker + Docker Compose           |
| Reverse Proxy  | Nginx                               |
| CI/CD          | GitHub Actions                      |
| Deployment     | Railway                             |

## Features

- **Auth** — Register / Login / Logout (Customer, Owner, Admin roles)
- **Restaurants** — Full CRUD for restaurant profiles (Owner)
- **Tables** — Manage tables per restaurant with zone/capacity (Owner)
- **Bookings** — Create, edit, cancel reservations with conflict detection (Customer)
- **Reviews** — Leave ratings after completed bookings (Customer)

## Local Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)
- A [Supabase](https://supabase.com) project

### 1. Clone and configure environment

```bash
git clone https://github.com/<your-org>/restaurant-booking.git
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

| Variable                      | Description                     |
|-------------------------------|---------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`    | Your Supabase project URL       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key      |
| `NEXT_PUBLIC_API_URL`         | FastAPI backend URL             |

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

## Team Members

| Name | Role |
|------|------|
| TBD  | Full Stack Developer |
| TBD  | DevOps Engineer |
| TBD  | Backend Developer |
| TBD  | Frontend Developer |

## License

MIT
