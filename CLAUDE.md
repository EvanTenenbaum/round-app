# Round — CLAUDE.md

Neighborhood dinner circle co-op. Cook once a week. Eat home-cooked meals from neighbors the rest.

---

## Repo Structure

```
round-app/
  apps/
    api/          Fastify REST API (Node 20, TypeScript)
    mobile/       Expo mobile app (iOS-first, React Native)
    web/          Next.js (Pages Router = marketing, App Router = dashboard)
  packages/
    shared/       @round/shared — types, constants shared across apps
  docs/
    PRD.md        Product requirements
    deployment.md Railway + Vercel + EAS setup
```

---

## Nomenclature (never deviate)

| Concept | DB model | Code | UI |
|---------|----------|------|----|
| Group | `Circle` | `circle` | circle |
| Cook assignment | `CircleMembership.turn` | `turn` | "your turn" |
| Meal reservation | `Seat` | `seat` | "save a seat" |
| Tiers | `FREE / MEMBER / FOUNDING` | — | Round / Round Member / Founding Member |

**Never use:** pod, claim, cookDay, Hearth, PREMIUM, LIFETIME

---

## Getting Started (local dev)

```bash
# 1. Start Postgres
docker-compose up postgres

# 2. Copy and fill env files
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/web/.env.example apps/web/.env

# 3. Install dependencies
yarn install

# 4. Run DB migration + seed
yarn workspace @round/api db:migrate
yarn workspace @round/api db:seed

# 5. Start API (port 4000)
yarn workspace @round/api dev

# 6. Start web (port 3000) — separate terminal
yarn workspace @round/web dev

# 7. Start mobile — separate terminal
yarn workspace @round/mobile start
```

---

## Key Business Rules

1. **FREE tier**: max 1 active circle, max 4 members per circle
2. **MEMBER tier**: unlimited circles, max 8 members per circle
3. Cannot save a seat at your own meal
4. Cannot unsave a seat within 2 hours of pickup
5. Circle goes `FORMING → ACTIVE` at 3+ members
6. Invite codes: 8 chars, no ambiguous chars (no 0/O/1/I)
7. User delete = GDPR soft-delete (anonymize, never hard-delete)
8. Clear push token on logout: `DELETE /users/me/push-token`

---

## API Routes

| Prefix | File |
|--------|------|
| `/circles` | `circle.routes.ts` |
| `/meals` | `meal.routes.ts` |
| `/users` | `user.routes.ts` |
| `/subscriptions` | `subscription.routes.ts` |
| `/notifications` | `notification.routes.ts` |
| `/matching` | `matching.routes.ts` |
| `/reviews` | `review.routes.ts` |
| `/cron` | `cron.routes.ts` — protected by `x-cron-secret` header |
| `/health` | `health.ts` |

---

## Cron Jobs

All jobs are at `/cron/*` and require header `x-cron-secret: $CRON_SECRET`.

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `POST /cron/turn-reminders` | `0 19 * * *` | Notify cooks whose turn is tomorrow |
| `POST /cron/turn-confirm-requests` | `0 7 * * *` | Request confirmation on cook day morning |
| `POST /cron/pickup-reminders` | `0 * * * *` | Notify diners 1hr before pickup |
| `POST /cron/reliability-update` | `0 0 * * *` | Mark missed turns, update reliability scores |

---

## Deployment

See `docs/deployment.md` for full instructions.

| Layer | Platform |
|-------|----------|
| API | Railway |
| Web | Vercel |
| Mobile | EAS (Expo) |
| Database | Railway Postgres |

---

## Reliability Infrastructure (non-negotiable MVP)

Reliability is the product. Without it, circles collapse.

- Cook receives push 24h before their turn (`TURN_REMINDER`)
- Cook receives push morning of their turn (`TURN_CONFIRM_REQUEST`)
- `turnConfirmedAt` updated when cook taps "I'm cooking"
- Last-minute cancel → all diners with saved seats get immediate notification
- `reliabilityRate` = fulfilled turns / total assigned turns (visible on profiles)
- `noShowCount` per membership; 3 strikes → admin prompted to review
