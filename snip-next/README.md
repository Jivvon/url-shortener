# Snip - URL Shortener

A modern, full-featured URL shortening service built with Next.js 15, Supabase, and deployed on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/snip)

## ✨ Features

- 🔗 **URL Shortening** - Create short, memorable links
- 📊 **Advanced Analytics** - Track clicks, devices, locations, and referrers
- 🎨 **Custom Aliases** - Branded short links (Pro plan)
- 📱 **QR Codes** - Generate QR codes for any link
- 🔐 **Secure Authentication** - Google OAuth via Supabase Auth
- 💳 **Subscription Plans** - Integrated with Polar for payments
- 📧 **Email Notifications** - Beautiful emails with React Email & Resend
- 📈 **Usage Analytics** - Posthog integration
- 🚀 **Edge Computing** - Lightning-fast redirects globally

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router + React Server Components)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Payments**: [Polar](https://polar.sh/)
- **Email**: [Resend](https://resend.com/) + [React Email](https://react.email/)
- **Analytics**: [Posthog](https://posthog.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)

## 📋 Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account (for deployment)
- (Optional) [Polar](https://polar.sh), [Resend](https://resend.com), [Posthog](https://posthog.com) accounts

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/snip.git
cd snip/snip-next
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migrations:
   - `supabase/migrations/20241204000000_initial_schema.sql`
   - `supabase/migrations/20241204000001_daily_clicks_function.sql`
   - `supabase/migrations/20241204000002_add_subscription_fields.sql`
3. Go to **Settings > API** and copy your:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

### 4. Configure Google OAuth

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback`
5. In Supabase Dashboard, go to **Authentication > Providers > Google**
6. Enable Google and add your Client ID and Secret

### 5. Set up environment variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SHORT_DOMAIN=localhost:3000

# Optional: Polar (for payments)
POLAR_API_KEY=your_polar_api_key
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret

# Optional: Resend (for emails)
RESEND_API_KEY=your_resend_api_key

# Optional: Posthog (for analytics)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 7. Run tests

```bash
npm test
```

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables from `.env.local`
4. Deploy!

Vercel will automatically:
- Build your Next.js app
- Set up custom domains
- Enable HTTPS
- Configure CDN for global distribution

### Post-Deployment

1. Update your Supabase **Site URL** to your Vercel domain
2. Update **Redirect URLs** to include your Vercel domain
3. Update Google OAuth redirect URIs
4. (Optional) Configure Polar webhooks to point to `https://yourdomain.com/api/webhooks/polar`

## 📚 Documentation

Full documentation is available in the `/docs` folder. You can also deploy it to  [Mintlify](https://mintlify.com).

- [API Reference](docs/api-reference/introduction.mdx)
- [Creating Links](docs/essentials/creating-links.mdx)
- [Quickstart Guide](docs/quickstart.mdx)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

Current coverage: **20 tests** across 2 test suites, all passing ✅

## 📁 Project Structure

```
snip-next/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, callback)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── (marketing)/       # Public marketing pages
│   ├── api/               # API routes
│   └── [shortCode]/       # Dynamic redirect route
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard-specific components
│   └── marketing/         # Marketing components
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase client configuration
│   └── validations.ts     # Zod schemas
├── hooks/                 # Custom React hooks
├── emails/                # React Email templates
├── docs/                  # Mintlify documentation
└── supabase/              # Database migrations
```

## 🔒 Security

- All API routes are protected with Supabase Auth
- Row Level Security (RLS) enabled on all tables
- IP addresses are hashed before storage (SHA-256)
- Webhook signatures verified for Polar integration
- HTTPS enforced in production

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💬 Support

- 📧 Email: support@snip.com
- 💬 Discord: [Join our community](https://discord.gg/snip)
- 🐦 Twitter: [@snip](https://twitter.com/snip)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Vercel](https://vercel.com/) - Platform for frontend developers
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components

---

Built with ❤️ using Next.js and Supabase
