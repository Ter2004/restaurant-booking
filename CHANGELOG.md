# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-04-06

### Added
- FastAPI backend with full CRUD for restaurants, tables, bookings, reviews
- Next.js 14 App Router frontend with Tailwind CSS
- Supabase Auth integration with role-based access (customer, owner, admin)
- PostgreSQL schema with RLS policies via Supabase migration
- Docker multi-stage builds for backend and frontend
- Nginx reverse proxy routing `/api` → backend, `/` → frontend
- GitHub Actions CI/CD pipeline (lint → test → build → deploy)
- Railway deployment workflow via webhook trigger
- pytest test suite for health, auth, and booking endpoints
- Comprehensive documentation (architecture, deployment guide)

## [0.1.0] - 2026-04-06

### Added
- Initial project scaffold
- Monorepo structure with `frontend/`, `backend/`, `docs/`, `.github/`
- Environment variable templates
