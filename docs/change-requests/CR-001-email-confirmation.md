# Change Request CR-001: Add Email Confirmation for New Bookings

| Field | Details |
|-------|---------|
| **CR ID** | CR-001 |
| **Date** | 2026-04-06 |
| **Requested By** | Development Team |
| **Priority** | Medium |
| **Status** | Approved — Pending Implementation |
| **Related Issue** | #1 |
| **Estimated Effort** | 3–4 hours |

## Description
Add automatic email confirmation sent to customers immediately after a booking is successfully created.

## Motivation
Customers currently receive no confirmation after booking. This leads to uncertainty about whether their reservation was successful and increases support requests.

## Proposed Changes
- Integrate email service (e.g., Resend API) into the backend
- Trigger email on `POST /bookings/` success response
- Email template includes: restaurant name, date, time, party size, booking ID, and cancellation link
- Add `EMAIL_API_KEY` and `EMAIL_FROM` environment variables

## Impact Analysis

| Component | Impact | Details |
|-----------|--------|---------|
| Backend (`routers/bookings.py`) | Medium | Add email send call after successful insert |
| Backend (`requirements.txt`) | Low | Add `resend` or `httpx` email dependency |
| Frontend | None | No UI changes required |
| Database | None | No schema changes required |
| Environment Variables | Low | Add `EMAIL_API_KEY`, `EMAIL_FROM`, `EMAIL_ENABLED` |
| CI/CD Pipeline | None | No pipeline changes required |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Email delivery failure blocks booking | Medium | High | Use fire-and-forget (don't await); email failure must not fail the booking |
| API key exposed in logs | Low | High | Use env var, never log the key |
| Rate limits on email provider | Low | Low | Free tier (Resend: 100 emails/day) sufficient for demo |

## Implementation Plan
1. Create `app/services/email.py` with send function
2. Add `EMAIL_ENABLED`, `EMAIL_API_KEY`, `EMAIL_FROM` to `config.py`
3. Call email service in `POST /bookings/` after successful DB insert
4. Add `EMAIL_ENABLED=false` to CI test env to skip in tests
5. Test manually on staging before merging

## Approval
- [x] Impact analysis reviewed
- [x] Risk assessment completed
- [ ] Implementation complete
- [ ] Tested in staging
