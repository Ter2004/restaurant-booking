#!/usr/bin/env bash
# Run this ONCE after: gh auth login
# Usage: bash scripts/github-setup.sh
set -e

echo "==> Creating GitHub repository..."
gh repo create restaurant-booking --public --source=. --remote=origin

echo "==> Pushing develop branch..."
git push -u origin develop

echo "==> Creating and pushing main branch..."
git checkout -b main
git push -u origin main

echo "==> Setting develop as default branch..."
gh repo edit --default-branch develop

echo "==> Pushing v0.1.0 tag..."
git push origin v0.1.0

echo "==> Switching back to develop..."
git checkout develop

echo "==> Creating GitHub labels..."
gh label create "feat"       --color "0075ca" --description "New feature" 2>/dev/null || true
gh label create "bug"        --color "d73a4a" --description "Something isn't working" 2>/dev/null || true
gh label create "enhancement"--color "a2eeef" --description "Enhancement to existing feature" 2>/dev/null || true
gh label create "tech-debt"  --color "e4e669" --description "Technical debt" 2>/dev/null || true
gh label create "priority:high"   --color "b60205" --description "High priority" 2>/dev/null || true
gh label create "priority:medium" --color "fbca04" --description "Medium priority" 2>/dev/null || true
gh label create "priority:low"    --color "0e8a16" --description "Low priority" 2>/dev/null || true

echo "==> Creating GitHub Issues..."

gh issue create \
  --title "feat: implement booking confirmation email notification" \
  --label "feat,priority:high" \
  --body "## Description
Send an email confirmation to the customer when a booking status changes to \`confirmed\`.

## Acceptance Criteria
- [ ] Email is sent when booking status changes to \`confirmed\`
- [ ] Email includes: restaurant name, date, time, party size, table number
- [ ] Uses Supabase Edge Functions or a transactional email service (e.g. Resend)
- [ ] Email template is responsive HTML

## Technical Notes
Consider using Supabase Database Webhooks → Edge Function → Resend API."

gh issue create \
  --title "feat: add search and filter for restaurants" \
  --label "feat,priority:medium" \
  --body "## Description
Allow customers to search restaurants by name, filter by cuisine type, city, and availability.

## Acceptance Criteria
- [ ] Search bar on landing page
- [ ] Filter by cuisine type (dropdown)
- [ ] Filter by city
- [ ] Results update in real-time (debounced)
- [ ] URL params reflect current filters (shareable links)

## Technical Notes
Backend \`GET /restaurants/\` already supports \`?city=\` and \`?cuisine=\` params."

gh issue create \
  --title "bug: handle double-booking conflict on same table/timeslot" \
  --label "bug,priority:high" \
  --body "## Description
Two users can create conflicting bookings for the same table and overlapping time slots due to a race condition.

## Steps to Reproduce
1. Open two browser tabs as different customers
2. Both select the same restaurant, table, date, and time
3. Both click 'Confirm Booking' at the same time
4. Both bookings are created — conflict!

## Expected Behavior
One booking succeeds; the second receives a 409 Conflict error.

## Fix Notes
Backend has \`_check_conflict()\` but it's not transactional. Consider a database-level unique constraint or advisory lock."

gh issue create \
  --title "bug: fix JWT token expiry handling on frontend" \
  --label "bug,priority:medium" \
  --body "## Description
When a user's JWT token expires, API calls fail silently or show a generic error. The user is not redirected to login.

## Steps to Reproduce
1. Log in and let the session expire (default ~1 hour)
2. Attempt any action requiring auth
3. API returns 401 but no redirect happens

## Expected Behavior
User is automatically redirected to \`/auth/login\` with a message.

## Fix Notes
Add a Supabase \`onAuthStateChange\` listener in a root layout. Intercept 401 responses in \`lib/api.ts\`."

gh issue create \
  --title "enhancement: add pagination to restaurant listing" \
  --label "enhancement,priority:medium" \
  --body "## Description
The restaurant listing currently loads all results at once. Add pagination (or infinite scroll) for scalability.

## Acceptance Criteria
- [ ] Backend: \`skip\` and \`limit\` query params already supported
- [ ] Frontend: Page-based navigation OR infinite scroll
- [ ] Show total count in UI
- [ ] URL reflects current page number

## Technical Notes
Backend already supports \`?skip=0&limit=20\`."

gh issue create \
  --title "enhancement: improve mobile responsiveness on booking form" \
  --label "enhancement,priority:low" \
  --body "## Description
The booking form (\`/customer/bookings/new\`) is not fully responsive on screens < 375px.

## Issues Found
- Date/time grid overflows on small screens
- Select dropdowns are too small to tap comfortably
- Submit button is cut off on iPhone SE

## Acceptance Criteria
- [ ] All form fields usable on 375px wide screens
- [ ] Proper touch targets (min 44px height)
- [ ] Tested on Chrome DevTools mobile presets"

gh issue create \
  --title "tech-debt: add integration tests for booking flow" \
  --label "tech-debt,priority:medium" \
  --body "## Description
Current tests are unit tests with mocked Supabase. Add integration tests that test the full booking flow against a real test database.

## Scope
- [ ] Create booking → verify in DB
- [ ] Detect double-booking conflict
- [ ] Cancel booking → status updates to \`cancelled\`
- [ ] Block review creation for non-completed bookings

## Technical Notes
Use a dedicated Supabase test project or a local Supabase instance via \`supabase start\`."

gh issue create \
  --title "tech-debt: optimize Docker image size" \
  --label "tech-debt,priority:low" \
  --body "## Description
Current Docker images are larger than necessary.

## Current Sizes (approximate)
- Backend: ~180MB
- Frontend: ~250MB

## Target
- Backend: < 120MB
- Frontend: < 150MB

## Suggestions
- Backend: use \`--no-cache-dir\` pip, remove test dependencies from production image
- Frontend: audit \`node_modules\` with \`@next/bundle-analyzer\`, ensure \`.next/standalone\` is used
- Both: add \`.dockerignore\` files"

echo ""
echo "==> All done! Opening repository in browser..."
gh repo view --web
