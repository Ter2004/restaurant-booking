# Progress Log — Iteration 2

**Period:** Week 2  
**Branch:** `develop`

## Goals
- Set up GitHub Actions CI/CD pipeline (lint → test → build → deploy)
- Fix all linting and test failures
- Add missing frontend pages

## Completed
- [x] Created GitHub Actions workflow with 4 stages: Lint, Test, Build, Deploy
- [x] Fixed ruff lint errors (removed unused imports across backend)
- [x] Fixed pytest failures — switched to `dependency_overrides` for Supabase mocking
- [x] Created `.eslintrc.json` for Next.js frontend
- [x] Added missing pages: restaurant detail, booking detail, owner restaurant edit, table management
- [x] Fixed Next.js Dockerfile to accept `NEXT_PUBLIC_*` build args
- [x] Pipeline passing on both `main` and `develop` branches

## Issues Encountered
- pydantic_settings tries to JSON-decode `list[str]` fields before validators run — fixed by using `str` field with a `cors_origins` property
- `ALLOWED_ORIGINS` env var as empty string caused `JSONDecodeError` on backend startup
- Railway blocked frontend deployment due to `next@14.2.3` security vulnerabilities (CVE-2025-55184, CVE-2025-67779) — upgraded to `14.2.35`

## Metrics
- CI/CD pipeline runs: 20
- Test coverage: auth, bookings endpoints
- Pipeline duration: ~4-5 minutes

## Next Iteration Goals
- Deploy to Railway cloud
- Configure environment variables for production
- Create GitHub Issues for backlog
- Write change request documents
