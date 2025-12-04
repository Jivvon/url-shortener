# Deployment Guide

Complete guide to deploying Snip to production.

## Prerequisites Checklist

Before deploying, make sure you have:

- ✅ Supabase project created and configured
- ✅ Database migrations applied
- ✅ Google OAuth configured
- ✅ All environment variables ready
- ✅ Tests passing (`npm test`)
- ✅ Code pushed to GitHub

## Step-by-Step Deployment

### 1. Prepare Supabase for Production

#### Database Migrations

Make sure all migrations are applied:

```sql
-- Run these in Supabase SQL Editor
-- 1. Initial schema
-- (Copy content from supabase/migrations/20241204000000_initial_schema.sql)

-- 2. Daily clicks function
-- (Copy content from supabase/migrations/20241204000001_daily_clicks_function.sql)

-- 3. Subscription fields
-- (Copy content from supabase/migrations/20241204000002_add_subscription_fields.sql)
```

#### Verify RLS Policies

1. Go to **Authentication > Policies**
2. Ensure all tables have RLS enabled
3. Verify policies are active:
   - `profiles`: Users can view/update own profile
   - `links`: Users can CRUD own links
   - `clicks`: Users can view own clicks, anyone can insert
   - `plans`: Public read access

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select the `snip-next` directory as the root
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `snip-next`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Add Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (keep secret!)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SHORT_DOMAIN=yourdomain.com
POLAR_API_KEY=polar_...
POLAR_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

6. Click **Deploy**
7. Wait ~2 minutes for build to complete

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd snip-next
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Add environment variables when prompted

# Deploy to production
vercel --prod
```

### 3. Post-Deployment Configuration

#### Update Supabase URLs

1. Go to Supabase Dashboard > **Authentication > URL Configuration**
2. Update **Site URL**: `https://yourdomain.vercel.app`
3. Add to **Redirect URLs**:
   ```
   https://yourdomain.vercel.app
   https://yourdomain.vercel.app/auth/callback
   https://yourdomain.vercel.app/**
   ```

#### Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services > Credentials**
3. Edit your OAuth 2.0 Client
4. Add **Authorized Redirect URIs**:
   ```
   https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback
   ```

#### Configure Webhooks

**Polar Webhook** (if using Polar):
1. Go to Polar Dashboard
2. Add webhook URL: `https://yourdomain.vercel.app/api/webhooks/polar`
3. Select events: `subscription.created`, `subscription.updated`, `subscription.canceled`
4. Copy webhook secret and add to Vercel environment variables

### 4. Custom Domain (Optional)

1. In Vercel Dashboard, go to **Settings > Domains**
2. Add your custom domain (e.g., `snip.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~5-60 minutes)
5. Update all environment variables:
   - `NEXT_PUBLIC_APP_URL=https://snip.com`
   - `NEXT_PUBLIC_SHORT_DOMAIN=snip.com`
6. Update Supabase and Google OAuth redirect URLs

### 5. Verify Deployment

After deployment, test these critical features:

- [ ] Visit homepage loads correctly
- [ ] Login with Google works
- [ ] Can create a short link
- [ ] Short link redirects correctly
- [ ] Analytics tracking works
- [ ] QR code generation works

**Test Redirect:**
```bash
# Create a link in dashboard, then test:
curl -I https://yourdomain.com/abc123
# Should return 307 redirect
```

**Test API:**
```bash
# Test link creation (requires auth token)
curl -X POST https://yourdomain.com/api/links \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Troubleshooting

### Build Fails

**Error**: `Module not found`
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error**: `Environment variable not found`
- Verify all required env vars are set in Vercel
- Use `NEXT_PUBLIC_` prefix for client-side variables

### Authentication Issues

**Error**: `redirect_uri_mismatch`
- Check Google OAuth redirect URIs match exactly
- Ensure Supabase redirect URLs are configured

**Error**: `Invalid API key`
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check for typos or extra spaces

### Redirect Not Working

**Issue**: 404 for short links
- Make sure `app/[shortCode]/page.tsx` exists
- Check Vercel build logs for errors

**Issue**: Redirect is slow
- This is expected on first request (cold start)
- Subsequent requests will be fast

## Monitoring

### Vercel Analytics

1. Go to Vercel Dashboard > **Analytics**
2. Monitor:
   - Page load times
   - Edge function performance
   - Error rates

### Supabase Monitoring

1. Go to Supabase Dashboard > **Reports**
2. Monitor:
   - Database usage
   - API requests
   - Auth events

### Posthog (Optional)

1. Go to Posthog Dashboard
2. Monitor:
   - Link creation events
   - Click events
   - User journeys

## Scaling Considerations

### Performance

- Vercel automatically scales based on traffic
- Edge functions provide global low-latency redirects
- Supabase handles up to 500 concurrent connections (Free tier)

### Database

If you exceed Supabase limits:
- Upgrade to Pro plan ($25/month)
- Or migrate to managed PostgreSQL (AWS RDS, Railway, etc.)

### Costs Estimate

**Free Tier Usage:**
- Vercel: Free (100GB bandwidth, unlimited requests)
- Supabase: Free (500MB database, 2GB bandwidth)
- Total: $0/month

**Paid Tiers (Recommended for Production):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Polar: 5% + $0.25 per transaction
- Resend: $20/month (50k emails)
- Posthog: $0 (1M events free)
- **Total**: ~$65/month + usage

## Backup & Recovery

### Database Backups

Supabase automatically backs up your database daily (Pro plan).

To create manual backup:

```bash
# Using Supabase CLI
supabase db dump > backup.sql

# Restore
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

### Environment Variables Backup

Save a copy of all environment variables:

```bash
# In Vercel
vercel env pull .env.production
```

## Rolling Back

If something goes wrong:

```bash
# Via Vercel Dashboard
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." > "Promote to Production"

# Via CLI
vercel rollback
```

## Support

Need help? Contact:
- 📧 Email: support@snip.com
- 💬 Discord: [discord.gg/snip](https://discord.gg/snip)
- 📖 Docs: [docs.snip.com](https://docs.snip.com)

---

**Deployment Checklist:**

- [ ] Supabase project configured
- [ ] Database migrations applied
- [ ] Environment variables set in Vercel
- [ ] Domain configured (if using custom domain)
- [ ] OAuth redirect URIs updated
- [ ] Webhooks configured
- [ ] Deployment verified
- [ ] Monitoring set up
- [ ] Backups configured

**You're live! 🎉**
