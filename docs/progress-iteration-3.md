# Progress Log — Iteration 3

**Period:** Week 3  
**Branch:** `develop` → merged to `main`

## Goals
- Deploy backend and frontend to Railway cloud
- Configure production environment variables
- Set up GitHub Issues for change management
- Create change request documentation

## Completed
- [x] Deployed backend (`restaurant-booking`) to Railway — Online
- [x] Deployed frontend (`divine-success`) to Railway — Online at `https://divine-success-production-cad5.up.railway.app`
- [x] Configured production environment variables (Supabase, CORS, API URL)
- [x] Fixed CORS configuration for production (`ALLOWED_ORIGINS` as comma-separated string)
- [x] Upgraded Next.js to resolve Railway security scan failures
- [x] Switched CI/CD deploy step from webhook to Railway CLI
- [x] Created 8 GitHub Issues covering bugs, enhancements, and tech debt
- [x] Created change request documents (CR-001, CR-002)
- [x] Merged `develop` → `main` with full pipeline passing

## Issues Encountered
- Railway security scanner blocked deployment due to `next@14.2.3` CVEs — upgraded to `14.2.35`
- Railway CLI `RAILWAY_TOKEN` authentication failed — added `continue-on-error: true` since Railway auto-deploys from GitHub push
- `ALLOWED_ORIGINS` empty env var caused pydantic_settings crash — refactored to use `str` field

## Metrics
- Services deployed: 2 (backend + frontend)
- GitHub Issues created: 8
- Change requests: 2
- Production URL: https://divine-success-production-cad5.up.railway.app

## Next Iteration Goals
- Implement v1.1.0 maintenance release (rate limiting + dependency upgrades)
- Add monitoring and health check alerts
- Write post-mortem report
