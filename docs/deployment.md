# Round — Deployment Guide

## Architecture

| Layer | Service | Notes |
|-------|---------|-------|
| API | Railway | Auto-deploy from `main` |
| Web | Vercel | Next.js, auto-deploy from `main` |
| Mobile | EAS Build | `eas build --platform ios` |
| Database | Railway Postgres | Managed, auto-backups |
| Auth | Clerk | Handles JWT, social login |
| Payments | Stripe | Checkout + webhooks |
| File uploads | Cloudinary | Meal photos |
| Push notifications | Expo Push | Via `notification.service.ts` |
| Cron | Railway Cron | 4 jobs (see below) |

---

## Railway (API)

### Required Environment Variables

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Railway Postgres connection string |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `JWKS_URL` | `https://clerk.<your-domain>.com/.well-known/jwks.json` |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → Signing secret |
| `STRIPE_PRICE_MONTHLY` | Stripe price ID for `$7.99/mo` product |
| `STRIPE_PRICE_ANNUAL` | Stripe price ID for `$59/yr` product |
| `STRIPE_PRICE_FOUNDING` | Stripe price ID for `$49 one-time` product |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |
| `CRON_SECRET` | Generate: `openssl rand -hex 32` |

### Cron Jobs

Set up Railway Cron with these schedules, passing `x-cron-secret: $CRON_SECRET` header:

| Job | Endpoint | Schedule | What it does |
|-----|----------|----------|-------------|
| Turn reminders | `POST /cron/turn-reminders` | `0 19 * * *` | Notifies cooks whose turn is tomorrow |
| Confirm requests | `POST /cron/turn-confirm-requests` | `0 7 * * *` | Asks cooks to confirm on cook day morning |
| Pickup reminders | `POST /cron/pickup-reminders` | `0 * * * *` | Notifies diners 1hr before pickup |
| Reliability update | `POST /cron/reliability-update` | `0 0 * * *` | Marks missed turns, updates reliability scores |

### Stripe Webhook

Configure Stripe to send to: `https://api.round.app/subscriptions/webhook`

Events to enable:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Vercel (Web)

### Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | `https://api.round.app` |
| `API_URL` | `https://api.round.app` (server-side) |

---

## EAS Build (Mobile)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for TestFlight (iOS)
eas build --platform ios --profile preview

# Submit to App Store
eas submit --platform ios
```

### app.json Deep Links

Scheme: `round://`

Deep link routes:
- `round://invite/:code` → `app/invite/[code].tsx`
- `round://checkout/success` → triggers subscription refresh
- `round://circles/:id` → `app/circles/[id].tsx`

### EAS Environment Variables

Set in `eas.json` or Expo dashboard:
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_API_URL` → `https://api.round.app`

---

## Local Development

```bash
# 1. Start Postgres
docker-compose up postgres

# 2. Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/web/.env.example apps/web/.env

# 3. Run migrations + seed
yarn workspace @round/api db:migrate
yarn workspace @round/api db:seed

# 4. Start API
yarn workspace @round/api dev

# 5. Start web (separate terminal)
yarn workspace @round/web dev

# 6. Start mobile (separate terminal)
yarn workspace @round/mobile start
```

---

## Health Check

`GET https://api.round.app/health` → `{ "status": "ok", "ts": 1234567890 }`
