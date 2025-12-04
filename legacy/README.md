# Legacy Project (Archived)

> **⚠️ This is the legacy Vite + Cloudflare Workers version. It is no longer maintained.**
>
> **Please use the new Next.js 15 project in `/snip-next/` instead.**

This directory contains the original implementation of Snip using:
- Vite + React
- Cloudflare Workers (D1, KV)
- Custom Google OAuth

## Why Archived?

This project has been fully migrated to a modern tech stack:

| Old (Legacy) | New (snip-next) |
|--------------|-----------------|
| Vite | Next.js 15 |
| Cloudflare Workers | Next.js API Routes |
| D1 (SQLite) | Supabase (PostgreSQL) |
| Custom OAuth | Supabase Auth |
| Manual setup | Integrated solutions |

## Running Legacy (Not Recommended)

If you need to run this for reference:

```bash
# Install dependencies
npm install

# Create .dev.vars from example
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your credentials

# Run all services
npm run dev:all
# Or use Docker
docker-compose up
```

## Migration Complete

All features from this project have been reimplemented in `snip-next/` with:
- ✅ Better performance
- ✅ Modern tech stack
- ✅ Easier deployment
- ✅ More features (payments, emails, etc.)
- ✅ Better documentation
- ✅ Unit tests

**Use `/snip-next/` for all new work!**
