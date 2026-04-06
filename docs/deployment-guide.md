# Deployment Guide — Railway

## Prerequisites

- GitHub account with repository pushed
- Railway account (railway.app)
- Supabase project created and migration run

---

## Step 1: Run the Database Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `backend/supabase/migrations/001_init.sql`
4. Paste and click **Run**
5. Verify tables created: profiles, restaurants, tables, bookings, reviews

---

## Step 2: Get Supabase Credentials

From your Supabase project → **Settings → API**:

| Value | Where to find |
|-------|--------------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_KEY` | `service_role` key (keep secret!) |
| `SUPABASE_JWT_SECRET` | Settings → API → JWT Settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` public key |

---

## Step 3: Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project from repo
railway init
```

Or via the web UI: railway.app → New Project → Deploy from GitHub Repo

---

## Step 4: Add Services on Railway

### Backend Service

1. New Service → GitHub Repo → select `restaurant-booking`
2. Set **Root Directory** to `backend`
3. Railway will detect the Dockerfile automatically
4. Set environment variables (Settings → Variables):

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret
ALLOWED_ORIGINS=https://your-frontend.railway.app
APP_ENV=production
```

5. Note the generated backend URL (e.g. `https://rb-backend.railway.app`)

### Frontend Service

1. New Service → Same GitHub Repo
2. Set **Root Directory** to `frontend`
3. Set environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://rb-backend.railway.app
```

---

## Step 5: Configure GitHub Actions Secrets

In your GitHub repo → Settings → Secrets and Variables → Actions:

| Secret | Value |
|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_API_URL` | Railway backend URL |
| `RAILWAY_DEPLOY_WEBHOOK` | Railway webhook URL (see below) |

### Getting the Railway Webhook URL

1. Railway project → Settings → Webhooks
2. Add webhook → copy the deploy URL
3. Paste as `RAILWAY_DEPLOY_WEBHOOK` in GitHub secrets

---

## Step 6: Push to Trigger Pipeline

```bash
git checkout main
git push origin main
```

Pipeline stages will run in order:
1. **lint** — ruff + eslint
2. **test** — pytest + jest
3. **build** — Docker images pushed to GHCR
4. **deploy** — Railway webhook triggered

---

## Step 7: Health Check Verification

After deployment, verify all services are healthy:

```bash
# Backend health
curl https://rb-backend.railway.app/health
# Expected: {"status": "ok", "version": "1.0.0"}

# API docs
open https://rb-backend.railway.app/docs

# Frontend
open https://rb-frontend.railway.app
```

---

## Rollback Procedure

### Via Railway Dashboard
1. Railway → Service → Deployments
2. Find last working deployment
3. Click **Redeploy**

### Via Git
```bash
git revert HEAD
git push origin main
# Pipeline will re-deploy the reverted code
```

---

## Environment Variable Updates

When updating env vars:
1. Update in Railway service settings
2. Railway will automatically redeploy

For secrets used at build time (Next.js `NEXT_PUBLIC_*`), you must trigger a new build:

```bash
git commit --allow-empty -m "chore: trigger rebuild for env update"
git push origin main
```

---

## Monitoring

- Railway dashboard shows live logs for each service
- Health endpoint: `GET /health` returns `{"status": "ok"}`
- Supabase dashboard shows query performance and auth logs
