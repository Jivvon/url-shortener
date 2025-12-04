# Snip - Modern URL Shortener

> **⚠️ Important:** This project has been migrated to Next.js 15. The new codebase is in the `snip-next/` directory.

A powerful, modern URL shortening service with advanced analytics, custom branding, and subscription management.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/snip)

---

## 🚀 Quick Start

### For New Development (Recommended)

```bash
cd snip-next
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

📖 **Full documentation**: See [snip-next/README.md](snip-next/README.md)

---

## 📁 Project Structure

```
url-shortter/
├── snip-next/              # ✨ NEW: Next.js 15 Project (USE THIS)
│   ├── app/                # Next.js App Router
│   ├── components/         # React components (shadcn/ui)
│   ├── lib/                # Utilities
│   ├── docs/               # Mintlify documentation
│   ├── README.md           # Detailed setup guide
│   └── DEPLOYMENT.md       # Deployment instructions
│
├── legacy/                 # 📦 OLD: Vite + Cloudflare Project (ARCHIVED)
│   └── ...                 # Kept for reference only
│
├── MIGRATION_PLAN.md       # Migration strategy document
├── TECH_SPEC_V2.md         # Technical specification
└── MIGRATION_PROGRESS.md   # Migration completion report
```

---

## ✨ Features

### Core Features
- 🔗 **URL Shortening** - Create short, memorable links
- 📊 **Advanced Analytics** - Track clicks, devices, locations, and referrers
- 🎨 **Custom Aliases** - Branded short links (Pro/Business plans)
- 📱 **QR Codes** - Generate QR codes for any link
- ⚡ **Edge Redirects** - Lightning-fast global redirects

### Business Features
- 🔐 **Authentication** - Google OAuth via Supabase
- 💳 **Subscriptions** - Three-tier plans (Free, Pro, Business)
- 💰 **Payments** - Integrated with Polar
- 📧 **Email** - Beautiful transactional emails via Resend
- 📈 **Analytics** - Posthog integration ready

### Developer Features
- ✅ **Full TypeScript** - End-to-end type safety
- 🧪 **Unit Tests** - 20+ tests with Jest
- 📚 **Documentation** - Comprehensive guides with Mintlify
- 🎨 **Modern UI** - shadcn/ui components
- 🚀 **Easy Deploy** - One-click Vercel deployment

---

## 🛠️ Tech Stack (New Project)

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router + RSC) |
| **UI** | [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Auth** | [Supabase Auth](https://supabase.com/auth) (Google OAuth) |
| **Payments** | [Polar](https://polar.sh/) |
| **Email** | [Resend](https://resend.com/) + [React Email](https://react.email/) |
| **Analytics** | [Posthog](https://posthog.com/) |
| **Testing** | [Jest](https://jestjs.io/) + [Testing Library](https://testing-library.com/) |
| **Deployment** | [Vercel](https://vercel.com/) |
| **Docs** | [Mintlify](https://mintlify.com/) |

---

## 📖 Documentation

### Getting Started
1. [Setup Guide](snip-next/README.md) - Complete setup instructions
2. [Supabase Setup](snip-next/SUPABASE_SETUP.md) - Database configuration
3. [Deployment Guide](snip-next/DEPLOYMENT.md) - Production deployment
4. [Folder Structure](snip-next/FOLDER_STRUCTURE.md) - Project organization

### Migration Documents
- [Migration Plan](MIGRATION_PLAN.md) - Original migration strategy
- [Technical Spec](TECH_SPEC_V2.md) - Detailed architecture
- [Progress Report](MIGRATION_PROGRESS.md) - Completion summary

### API Reference
See [snip-next/docs/](snip-next/docs/) for full API documentation.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import on [Vercel](https://vercel.com)
3. Set root directory to `snip-next`
4. Add environment variables
5. Deploy!

For detailed instructions, see [DEPLOYMENT.md](snip-next/DEPLOYMENT.md)

---

## 🧪 Testing

```bash
cd snip-next
npm test                    # Run all tests
npm run test:watch          # Watch mode
```

**Test Coverage**: 20 tests, 100% passing ✅

---

## 📊 Migration Status

✅ **Migration Completed** - December 4, 2024

All 10 phases completed successfully:
- ✅ Phase 1: Next.js 15 + shadcn/ui setup
- ✅ Phase 2: Supabase authentication
- ✅ Phase 3-4: Core URL shortening features
- ✅ Phase 5: Complete UI implementation
- ✅ Phase 6: Polar payment integration
- ✅ Phase 7: Resend email system
- ✅ Phase 8: Mintlify documentation
- ✅ Phase 9: Unit testing (Jest)
- ✅ Phase 10: Deployment preparation

**Time**: ~5 hours (originally estimated 13-19 days)

---

## 📁 Legacy Project

The original Vite + Cloudflare Workers project is archived in `legacy/`.

**Note:** The legacy project is no longer maintained. All new development happens in `snip-next/`.

To run the legacy project (for reference only):
```bash
cd legacy
npm install
npm run dev:all
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Focus on the `snip-next/` directory
2. Run tests before submitting (`npm test`)
3. Follow existing code patterns
4. Update documentation as needed

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

---

## 💬 Support

- 📧 Email: support@snip.com
- 💬 Discord: [discord.gg/snip](https://discord.gg/snip)
- 📖 Docs: [docs.snip.com](https://docs.snip.com)

---

## 🙏 Acknowledgments

Built with amazing open-source tools:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)

---

**✨ Start using the new project:**

```bash
cd snip-next
npm install
npm run dev
```

Open http://localhost:3000 and start building! 🚀
