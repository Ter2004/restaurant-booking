# Post-Mortem Report — Restaurant Booking Platform

**Date:** 2026-04-06  
**Author:** Kittinantantajina  
**Version:** v1.1.0

---

## Summary

This report documents the incidents, root causes, and resolutions encountered during the development and deployment of the Restaurant Booking Platform for the DevOps course project.

---

## Incident 1: Docker Frontend Container Crash (`server.js not found`)

**Severity:** High  
**Duration:** ~1 hour

### What Happened
The frontend container started successfully but immediately crashed with `Error: Cannot find module '/app/server.js'`.

### Root Cause
The `docker-compose.yml` had volume mounts (`./frontend:/app`) that overwrote the Next.js standalone build output inside the container with the raw source code from the host. The `server.js` file is only generated during `npm run build` — it does not exist in the source directory.

### Resolution
Removed the frontend volume mounts from `docker-compose.yml`. The container now runs purely from its built image.

### Prevention
Never mount source directories over build output directories in production-style containers. Use named volumes only for data that must persist (databases, uploads).

---

## Incident 2: Backend Crash on Railway (`JSONDecodeError` for `ALLOWED_ORIGINS`)

**Severity:** High  
**Duration:** ~2 hours (3 failed deploys)

### What Happened
The backend service crashed immediately on startup in Railway with `pydantic_settings.sources.SettingsError: error parsing value for field "allowed_origins"`.

### Root Cause
pydantic_settings intercepts `list[str]` fields and attempts to JSON-decode the environment variable value **before** any field validators run. When `ALLOWED_ORIGINS` was set to an empty string in Railway, `json.loads("")` raised `JSONDecodeError`.

A first fix using `@field_validator` failed because the validator runs after pydantic_settings' internal parsing stage.

### Resolution
Changed `allowed_origins` from `list[str]` to `str` with a `cors_origins` property that handles empty strings, comma-separated values, and JSON arrays. This bypasses pydantic_settings' automatic JSON parsing entirely.

### Prevention
Avoid using `list[str]` fields in pydantic_settings when the value will come from environment variables in cloud platforms. Use `str` + manual parsing instead.

---

## Incident 3: Railway Deployment Blocked by Security Vulnerabilities

**Severity:** Medium  
**Duration:** ~30 minutes

### What Happened
Railway's security scanner blocked the frontend deployment with:
- CVE-2025-55184 (HIGH) in `next@14.2.3`
- CVE-2025-67779 (HIGH) in `next@14.2.3`

### Root Cause
The project was initialized with `next@14.2.3` which had known high-severity vulnerabilities discovered after the project started.

### Resolution
Upgraded to `next@14.2.35` via `npm install next@^14.2.35`.

### Prevention
Run `npm audit` as part of the CI pipeline and fail the build on high-severity vulnerabilities before attempting deployment.

---

## Incident 4: CI/CD `pytest` Failing with `SupabaseException: Invalid API key`

**Severity:** Medium  
**Duration:** ~1 hour

### What Happened
All backend tests failed in GitHub Actions with `SupabaseException: Invalid API key` even though tests used `MagicMock`.

### Root Cause
The `conftest.py` fixture created a `TestClient` **before** setting up `dependency_overrides`, allowing FastAPI to call the real `get_supabase` dependency which tried to connect to Supabase with placeholder credentials during client initialization.

### Resolution
Restructured `conftest.py` to set `dependency_overrides` before creating `TestClient`, ensuring the mock is in place before any request is processed.

### Prevention
Always set dependency overrides before creating the test client. Use the context manager form (`with TestClient(app) as c`) to ensure proper lifecycle management.

---

## Lessons Learned

1. **Test locally before pushing** — Many CI failures could have been caught by running `pytest` and `npm run lint` locally first.
2. **Cloud environment variables behave differently** — What works locally (with `.env` files) may fail in cloud environments where variables are injected as plain strings.
3. **Security scanning is part of the pipeline** — Keeping dependencies up to date is not optional; outdated packages block production deployments.
4. **Docker volume mounts can mask build artifacts** — Production containers should not mount source directories.
