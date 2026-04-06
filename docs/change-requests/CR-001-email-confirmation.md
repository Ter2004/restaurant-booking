# Change Request CR-001: Add Email Confirmation for New Bookings

| Field | Details |
|-------|---------|
| **CR ID** | CR-001 |
| **Date** | 2026-04-06 |
| **Requested By** | Development Team |
| **Priority** | Medium |
| **Status** | Approved |
| **Related Issue** | #1 |

## Description
Add automatic email confirmation sent to customers immediately after a booking is successfully created.

## Motivation
Customers currently receive no confirmation after booking. This leads to uncertainty about whether their reservation was successful and increases support requests.

## Proposed Changes
- Integrate email service (e.g., SendGrid or Resend) into the backend
- Trigger email on `POST /bookings/` success response
- Email template includes: restaurant name, date, time, party size, booking ID, and cancellation link

## Impact Assessment
- **Backend**: Add email service dependency + send logic in booking router
- **Frontend**: No changes required
- **Database**: No schema changes required
- **Risk**: Low — email failure should not block booking creation (fire-and-forget)

## Rollback Plan
Disable email integration via environment variable `EMAIL_ENABLED=false`.
