# 🔥 Hearth

**The community meal co-op app.** Form a small cooking circle with neighbors or friends. Cook once per week. Eat home-cooked meals all week.

---

## What Is This

Hearth solves a clear problem: busy people want affordable, healthy, home-cooked meals but don't have time to cook every night. Rather than ordering delivery every night, small groups of 3–8 people take turns cooking — each person cooks once per week and gets meals from their pod-mates on the other nights.

## Quick Start

### Prerequisites
- Node.js 20+
- Yarn 4+
- Docker (for local PostgreSQL)
- Expo Go app on your phone (for mobile dev)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/YOUR_ORG/hearth
cd hearth
yarn install

# 2. Start database
docker compose up -d

# 3. Set up API environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your Clerk, Stripe, Cloudinary keys

# 4. Set up mobile environment
cp apps/mobile/.env.example apps/mobile/.env.local
# Edit with your Clerk publishable key

# 5. Run database migrations + seed
yarn db:migrate
yarn db:seed

# 6. Start development
yarn dev:api     # API on http://localhost:4000
yarn dev:web     # Web on http://localhost:3000
yarn dev:mobile  # Expo dev server — scan QR with Expo Go
```

## Project Structure

```
hearth/
├── apps/
│   ├── api/          # Fastify REST API
│   │   ├── prisma/   # Database schema + migrations + seed
│   │   └── src/      # Routes, services, middleware
│   ├── mobile/       # Expo React Native app (iOS-first)
│   │   └── src/      # Screens, components, hooks, store
│   └── web/          # Next.js 14 marketing + web app
│       └── src/      # Pages, components
└── packages/
    └── shared/       # Shared TypeScript types and utilities
```

## Build Order

If starting from scratch, build in this order:
1. `packages/shared` — types first
2. `apps/api` — backend
3. `apps/web` — web app
4. `apps/mobile` — mobile last

## Key Commands

```bash
yarn dev:api          # Start API (port 4000)
yarn dev:web          # Start web (port 3000)
yarn dev:mobile       # Start Expo
yarn db:studio        # Prisma Studio (DB GUI)
yarn db:seed          # Seed with demo data
yarn typecheck        # Type check all packages
yarn test             # Run tests
```

## Documentation

- [`CLAUDE.md`](./CLAUDE.md) — Full build guide for Claude Code
- [`docs/PRD.md`](./docs/PRD.md) — Product requirements, market research, biz model
- API docs available at `http://localhost:4000/docs` in development

## Tech Stack

| Layer | Tech |
|-------|------|
| Mobile | Expo SDK 51 (React Native) |
| Web | Next.js 14 (App Router) |
| API | Fastify 4 + TypeScript |
| Database | PostgreSQL 16 + Prisma 5 |
| Auth | Clerk |
| Payments | Stripe |
| Storage | Cloudinary |
| Push | Expo Notifications |
| Deploy | Railway (API) + Vercel (web) |

## Pricing

- **Free**: 1 pod, unlimited meals, basic scheduling
- **Premium**: $4.99/mo or $39/yr — unlimited pods, matching, AI suggestions
- **Lifetime**: $14.99 one-time — all premium features, forever

## Status

🚧 **In development** — v1.0 targeting iOS App Store, 2026

---

Made with ❤️ and a shared pot of soup.
