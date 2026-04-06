# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-04-06

### Added
- Rate limiting on authentication endpoints via `slowapi` (CR-002)
  - `/auth/login`: max 5 requests/minute per IP
  - `/auth/register`: max 3 requests/minute per IP
- Scalability architecture documentation with horizontal scaling plan
- System build process documentation
- Resilience measures documentation (restart policies, health checks, backup strategy)
- Post-mortem report covering all incidents during development and deployment

### Fixed
- `ALLOWED_ORIGINS` env var crash on startup when set to empty string in Railway
- `ALLOWED_ORIGINS` now accepts comma-separated string, JSON array, or empty (uses default)

### Security
- Upgraded `next` from 14.2.3 to 14.2.35 (fixes CVE-2025-55184, CVE-2025-67779)
- Added rate limiting to prevent brute force attacks on auth endpoints

## [1.0.0] - 2026-04-06

### Added
- FastAPI backend with full CRUD for restaurants, tables, bookings, reviews
- Next.js 14 App Router frontend with Tailwind CSS
- Supabase Auth integration with role-based access (customer, owner, admin)
- PostgreSQL schema with RLS policies via Supabase migration
- Docker multi-stage builds for backend and frontend
- Nginx reverse proxy routing `/api` → backend, `/` → frontend
- GitHub Actions CI/CD pipeline (lint → test → build → deploy)
- Railway cloud deployment (backend + frontend)
- pytest test suite for auth and booking endpoints
- Health check endpoint `GET /health`
- Comprehensive documentation (architecture, deployment guide, progress logs)
- Change request process (CR-001, CR-002)
- 8 GitHub Issues tracking bugs, enhancements, and tech debt

## [0.1.0] - 2026-04-06

### Added
- Initial project scaffold
- Monorepo structure with `frontend/`, `backend/`, `docs/`, `.github/`
- Environment variable templates
