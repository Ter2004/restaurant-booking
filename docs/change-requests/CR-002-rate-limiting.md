# Change Request CR-002: Add Rate Limiting to Authentication Endpoints

| Field | Details |
|-------|---------|
| **CR ID** | CR-002 |
| **Date** | 2026-04-06 |
| **Requested By** | Development Team |
| **Priority** | High |
| **Status** | Approved — Implemented in v1.1.0 |
| **Related Issue** | #5 |
| **Estimated Effort** | 1–2 hours |

## Description
Implement rate limiting on `/auth/login` and `/auth/register` endpoints to prevent brute force and credential stuffing attacks.

## Motivation
Authentication endpoints are publicly accessible with no request throttling. An attacker could attempt thousands of password combinations per second without restriction. This is a critical security gap identified during the v1.0.0 post-deployment review.

## Proposed Changes
- Add `slowapi==0.1.9` to `requirements.txt`
- Configure global `Limiter` in `main.py` with `get_remote_address` key function
- Apply `@limiter.limit("5/minute")` decorator to `POST /auth/login`
- Apply `@limiter.limit("3/minute")` decorator to `POST /auth/register`
- Return HTTP 429 Too Many Requests with retry-after header when limit exceeded

## Impact Analysis

| Component | Impact | Details |
|-----------|--------|---------|
| Backend (`main.py`) | Low | Add Limiter instance and exception handler |
| Backend (`routers/auth.py`) | Low | Add `@limiter.limit()` decorators + `request: Request` param |
| Backend (`requirements.txt`) | Low | Add `slowapi==0.1.9` |
| Frontend | None | 429 responses handled as generic auth errors |
| Database | None | No schema changes |
| CI/CD Pipeline | None | Tests unaffected (rate limiter inactive in unit tests) |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Legitimate users rate-limited | Low | Medium | 5/min on login is generous for normal use |
| IP spoofing bypasses rate limit | Medium | Medium | Acceptable for demo; production would use Redis-backed store |
| Tests fail due to rate limiting | Low | Medium | slowapi skips limits when `TESTING=True` env var set |

## Implementation Plan
1. Add `slowapi==0.1.9` to `requirements.txt`
2. Create `Limiter` in `main.py`, register exception handler
3. Add `@limiter.limit()` decorators to `/login` and `/register` endpoints
4. Verify HTTP 429 response on 6th request within a minute
5. Merge to `develop` → run CI → merge to `main` → tag `v1.1.0`

## Approval
- [x] Impact analysis reviewed
- [x] Risk assessment completed
- [x] Implementation complete (commit `e15492a`)
- [x] Tested in staging
- [x] Released in v1.1.0
