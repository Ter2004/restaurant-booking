# Change Request CR-002: Add Rate Limiting to Authentication Endpoints

| Field | Details |
|-------|---------|
| **CR ID** | CR-002 |
| **Date** | 2026-04-06 |
| **Requested By** | Development Team |
| **Priority** | High |
| **Status** | Approved |
| **Related Issue** | #5 |

## Description
Implement rate limiting on `/auth/login` and `/auth/register` endpoints to prevent brute force attacks.

## Motivation
Authentication endpoints are publicly accessible with no request throttling. An attacker could attempt thousands of password combinations per second without restriction.

## Proposed Changes
- Add `slowapi` library to backend dependencies
- Configure rate limiter: max 5 requests/minute per IP on `/auth/login`
- Configure rate limiter: max 3 requests/minute per IP on `/auth/register`
- Return HTTP 429 Too Many Requests when limit exceeded

## Impact Assessment
- **Backend**: Add slowapi middleware + decorators on auth router
- **Frontend**: Handle 429 response with user-friendly error message
- **Database**: No changes required
- **Risk**: Low — only affects clients exceeding the threshold

## Rollback Plan
Remove slowapi middleware. No database changes to revert.
