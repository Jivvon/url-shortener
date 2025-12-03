# Snip - URL Shortener Service

Snip is a URL shortener service built with React, Cloudflare Workers, D1, and KV.

## Features

- **Free Tier**: 50 URLs/month, 7-day stats retention
- **Pro Tier**: 1,000 URLs/month, Custom Alias, 90-day stats
- **Business Tier**: Unlimited URLs, API Access, Unlimited stats

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Zustand, Recharts
- **Backend**: Cloudflare Workers, Hono
- **Database**: Cloudflare D1 (SQLite)
- **Cache**: Cloudflare KV
- **Auth**: Google OAuth 2.0 + JWT

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Deploy to Cloudflare:
   ```bash
   npm run deploy
   ```
