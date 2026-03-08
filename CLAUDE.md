# Round — Claude Code Build Guide
## Version 2.0 (Post-Architecture Review)

> This codebase was reviewed by a senior architecture team after the initial build.
> All critical structural issues are fixed. Follow this guide exactly — it reflects the corrected architecture.

---

## What Is Round

Everything uses Round terminology throughout — no mapping layer needed.


## What Is Round

Community meal co-op app. Neighbors form circles of 3–8 people. Each person cooks once per week and receives home-cooked meals from pod-mates on the other nights. Think of it as a cooking roster, coordinated by app.

**The core loop**: Post meal → Pod members claim servings → Pickup → Leave review.

---

## Architecture

```
/apps/api        → Fastify 4 + TypeScript + Prisma (REST API, port 4000)
/apps/mobile     → Expo SDK 51, Expo Router (file-based nav), iOS-first
/apps/web        → Next.js 14 App Router + Pages Router (dual, intentional)
/packages/shared → Shared TS types only — no runtime code
```

**Critical architecture notes:**
- Web uses **both** Pages Router (marketing: `/pages`) AND App Router (dashboard: `/app`). This is intentional. Next.js 14 supports both simultaneously. Do NOT consolidate them until told to.
- Mobile uses **Expo Router** (file-based). All screens go in `/app/`. Source components go in `/src/`. Route files just re-export from src.
- Shared package is **types-only** — it has zero runtime dependencies. Never add `zod` or `prisma` to it.

---

## What's Already Built and Working

### API (`/apps/api/src/`)
| File | Status | Notes |
|------|--------|-------|
| `app.ts` | ✅ Complete | Fastify factory, all plugins registered |
| `server.ts` | ✅ Complete | Entry point |
| `db/client.ts` | ✅ Complete | Prisma singleton |
| `middleware/auth.middleware.ts` | ✅ Complete | Clerk → internal userId resolution |
| `middleware/error.middleware.ts` | ✅ Complete | Zod + Prisma error normalization |
| `routes/auth.routes.ts` | ✅ Complete | Clerk webhook → DB sync |
| `routes/user.routes.ts` | ✅ Complete | Full CRUD incl. push token, GDPR delete |
| `routes/pod.routes.ts` | ✅ Complete | Full pod lifecycle + invite code join |
| `routes/meal.routes.ts` | ✅ Complete | Post/edit/cancel/claim/unclaim |
| `routes/review.routes.ts` | ✅ Complete | Post review + aggregate |
| `routes/notification.routes.ts` | ✅ Complete | List + mark read |
| `routes/subscription.routes.ts` | ✅ Complete | Stripe checkout + webhook handler |
| `routes/matching.routes.ts` | ✅ Complete | Premium pod/user discovery |
| `services/pod.service.ts` | ✅ Complete | createPod, getPodWithMembers, schedule, dietary conflict check |
| `services/matching.service.ts` | ✅ Complete | Haversine distance + compatibility scoring |
| `services/notification.service.ts` | ✅ Complete | Expo push + DB persistence |
| `test/pod.test.ts` | ✅ Built | Unit tests for pod service + business rules |

### Mobile (`/apps/mobile/`)
| File | Status |
|------|--------|
| `app/_layout.tsx` | ✅ Complete — ClerkProvider + QueryClient + SplashScreen |
| `app/(tabs)/_layout.tsx` | ✅ Complete — Tab navigator with post button + badge |
| `app/(tabs)/index.tsx` | ✅ Complete — re-exports HomeScreen |
| `app/(tabs)/post.tsx` | ✅ Complete — Full PostMeal with photo upload, dietary tags, time picker |
| `app/(auth)/_layout.tsx` | ✅ Complete |
| `app/(auth)/sign-in.tsx` | ✅ Complete |
| `src/screens/HomeScreen.tsx` | ✅ Complete |
| `src/services/api.ts` | ✅ Complete — All API methods |
| `src/store/app.store.ts` | ✅ Complete — Zustand store |
| `src/styles/theme.ts` | ✅ Complete — Full design system |

### Web (`/apps/web/`)
| File | Status |
|------|--------|
| `src/app/layout.tsx` | ✅ Complete — Root with Clerk + metadata |
| `src/app/globals.css` | ✅ Complete |
| `src/app/page.tsx` | ✅ Complete — Delegates to pages/index |
| `src/pages/index.tsx` | ✅ Complete — Full landing page |
| `next.config.js` | ✅ Complete |
| `tailwind.config.js` | ✅ Complete |
| `postcss.config.js` | ✅ Complete |
| `tsconfig.json` | ✅ Complete |

### Infrastructure
| File | Status |
|------|--------|
| `apps/api/prisma/schema.prisma` | ✅ Complete — All models + indexes |
| `apps/api/prisma/seed.ts` | ✅ Complete — 4 users, 1 pod, 4 meals |
| `docker-compose.yml` | ✅ Complete — Postgres + Redis |
| `.github/workflows/ci.yml` | ✅ Complete — typecheck + test + lint + build |
| `railway.toml` | ✅ Complete |

---

## What Needs To Be Built (Your Job)

Work in this order. Each section depends on the prior.

### PHASE 1 — Mobile screens (2–3 days)

**`app/(tabs)/pod.tsx`** — Pod detail tab
- Show this week's meal schedule by day (Mon–Sun grid)
- List pod members with their cook day, rating, dietary icons
- Invite button (copies invite link to clipboard + native share sheet)
- Settings gear → manage cook day assignments (owner only)

**`app/(tabs)/profile.tsx`** — Profile tab
- Show user's own profile: avatar, name, bio, dietary prefs, cook stats
- Subscription status with upgrade CTA for free users
- Settings: dietary prefs, cooking styles, location, notifications
- Sign out button

**`app/(tabs)/discover.tsx`** — Discover tab
- If FREE tier: upsell card with "Find pods near you" + upgrade button
- If PREMIUM: show MatchingScreen (call `/matching/suggestions?type=pods`)
- List compatible pods within X miles, join button

**`app/meals/[id].tsx`** — Meal detail screen
- Full meal info: photo (full width), cook name + avatar, description, dietary tags
- Servings counter (claimed / available)
- Claim / Unclaim button with optimistic update
- Map showing pickup location (use expo-maps or just show address text for MVP)
- Leave review section (shown after pickup time has passed and user has a claim)

**`app/circles/[id].tsx`** — Pod detail (deep link from notifications)
- Re-use pod detail content from the Pod tab
- Back button

**`app/invite/[code].tsx`** — Invite landing
- Show pod name + current member count
- Join button → calls `/circles/join/:code`
- Works when app is installed (deep link) AND as web fallback

**`app/(auth)/sign-up.tsx`** — Sign up screen (clone of sign-in, using `useSignUp`)

**`app/onboarding/index.tsx`** — Onboarding flow (after first sign-up)
- Step 1: Name + photo
- Step 2: Location permission + neighborhood name
- Step 3: Dietary restrictions
- Step 4: Cooking style tags
- On complete: PATCH /users/me with onboardingComplete=true → redirect to /(tabs)

### PHASE 2 — Web dashboard (1–2 days)

**`src/app/(app)/home/page.tsx`** — Authenticated home
- Show user's pods
- This week's meals for first pod
- Quick actions: post meal, invite someone

**`src/app/(app)/circles/[id]/page.tsx`** — Pod page
- Member list, weekly schedule, invite management

**`src/app/(app)/layout.tsx`** — App shell with nav sidebar

**`src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`** — Clerk sign-in component

**`src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`** — Clerk sign-up component

**`src/app/invite/[code]/page.tsx`** — Web invite landing (for non-app users)
- Same as mobile invite screen but as a marketing/web page
- "Download the app" CTA + "Continue in browser" option

**`src/app/pricing/page.tsx`** — Pricing page
- Three tiers with Stripe checkout links
- Annual/monthly toggle

### PHASE 3 — API cron + notifications (0.5 days)

**`src/routes/cron.routes.ts`** — Internal cron endpoints (called by Railway cron)
```
POST /cron/cook-day-reminders   → NotificationService.sendCookDayReminders()
POST /cron/pickup-reminders     → remind claimants 1h before pickup
```
Authenticate with `CRON_SECRET` header. Register in `app.ts`.

### PHASE 4 — Polish (ongoing)

- [ ] Haptic feedback on claim/unclaim (use `expo-haptics`)
- [ ] Pull-to-refresh on all list screens
- [ ] Empty states with illustrations for: no pods, no meals this week, no notifications
- [ ] Loading skeletons instead of spinners
- [ ] Error boundary with retry button
- [ ] Offline detection banner

---

## Build Commands

```bash
# Local dev setup
docker compose up -d                  # Start Postgres
cd apps/api && cp .env.example .env  # Fill in secrets
yarn db:migrate                       # Apply migrations
yarn db:seed                          # Seed demo data

# Run all three apps
yarn dev:api     # → http://localhost:4000
yarn dev:web     # → http://localhost:3000
yarn dev:mobile  # → Expo dev server (scan with Expo Go)

# Database
yarn db:studio   # Prisma Studio UI
yarn db:push     # Push schema without migration (dev only)

# Quality
yarn test        # Run all tests
yarn typecheck   # Type check all packages
```

---

## Environment Variables Summary

### API (`apps/api/.env`)
```
DATABASE_URL=postgresql://hearth:hearth_local@localhost:5432/hearth
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PRICE_LIFETIME=price_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_PRESET=hearth_meals
SENDGRID_API_KEY=SG....
CRON_SECRET=some-random-secret
```

### Mobile (`apps/mobile/.env.local`)
```
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=...
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=hearth_meals
```

### Web (`apps/web/.env.local`)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Key Business Rules (Do Not Break These)

1. **Free tier = 1 active pod max.** Enforced in `pod.routes.ts` on both create AND join.
2. **Pod capacity = maxSize (default 5, max 8).** Checked on join.
3. **Cannot claim your own meal.** Checked in meal routes.
4. **Cannot unclaim within 2 hours of pickup.** Cutoff calculated from `meal.pickupTime`.
5. **Pod status auto-updates**: FORMING → ACTIVE when 3+ active members join.
6. **Invite codes use unambiguous charset** (no 0/O, 1/I). See `CircleService.generateInviteCode()`.
7. **Reviews are one-per-meal-per-type per reviewer.** Enforced by DB unique constraint.
8. **User delete is soft (GDPR)** — data is anonymized, not deleted.
9. **Push tokens are cleared on logout** — call `DELETE /users/me/push-token` on sign out.

---

## Design System

**Colors** (all defined in `apps/mobile/src/styles/theme.ts` and `tailwind.config.js`):
- Orange: `#E8733A` (primary actions, CTAs)
- Cream: `#FDF6EC` / `#FFF9F3` (backgrounds)
- Brown: `#3D2314` (text, headers)
- Green: `#4A7C59` (success, dietary tags)

**No dark mode in v1.** Do not add dark mode handling.

**All interactive elements** must have accessible labels (`accessibilityLabel` on RN, `aria-label` on web).

**Loading states**: Use skeleton UI (gray animated boxes), never plain spinners for content areas.

---

## Patterns To Follow

### React Query usage in mobile
```tsx
// ✅ Correct — invalidate after mutations
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: (data) => api.createMeal(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['meals', podId] })
  },
})

// ✅ Correct — optimistic update for claim
const claimMutation = useMutation({
  mutationFn: () => api.claimMeal(mealId),
  onMutate: async () => {
    await queryClient.cancelQueries({ queryKey: ['meal', mealId] })
    const prev = queryClient.getQueryData(['meal', mealId])
    queryClient.setQueryData(['meal', mealId], (old: any) => ({
      ...old,
      myClaim: { id: 'optimistic', portions: 1, status: 'CONFIRMED' },
      servingsClaimed: old.servingsClaimed + 1,
    }))
    return { prev }
  },
  onError: (_, __, ctx) => queryClient.setQueryData(['meal', mealId], ctx?.prev),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['meal', mealId] }),
})
```

### Error handling
```tsx
// All API calls throw on non-2xx. Catch at component level.
try {
  await api.joinPod(inviteCode)
  router.replace('/(tabs)/pod')
} catch (err: any) {
  Alert.alert('Could not join pod', err.message)
}
```

### Expo deep links
The app scheme is `round://`. Deep link patterns:
- `round://invite/CODE` → `app/invite/[code].tsx`
- `round://meals/ID` → `app/meals/[id].tsx`
- `round://circles/ID` → `app/circles/[id].tsx`

Web equivalents: `https://round.app/invite/CODE` etc.

---

## Testing Strategy

- **Unit tests**: Vitest. Located in `apps/api/src/test/`. Run with `yarn test`.
- **Integration**: Test against real Postgres (CI spins one up). No mocking DB in integration tests.
- **Mobile**: Expo's built-in dev tools + manual testing on device. Detox in v2.
- **Coverage target**: 60% line coverage on services. Routes are lower priority.

Run `yarn test:coverage` to see coverage report.


## Core Problem
Busy people (working parents, young professionals) want affordable, healthy home-cooked meals but don't have time to cook every night. Rather than ordering delivery or eating poorly, they can cook one big batch meal weekly and receive meals from 2–4 neighbors in return.

## Architecture Overview

```
/apps/api        → Fastify + TypeScript REST API (Node.js 20+)
/apps/mobile     → Expo React Native (iOS first, Android later)
/apps/web        → Next.js 14 (App Router) — mobile web + marketing
/packages/shared → Shared types, validation schemas, utilities
```

## Database: PostgreSQL via Prisma

Schema file: `apps/api/prisma/schema.prisma`

Core tables: User, Pod, PodMembership, Meal, Seat, Schedule, Review, Notification, Subscription

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo SDK 51 + React Native |
| State | Zustand + React Query (TanStack) |
| Web | Next.js 14 App Router + Tailwind CSS |
| API | Fastify 4 + TypeScript |
| ORM | Prisma 5 |
| DB | PostgreSQL 16 |
| Auth | Clerk (webhooks sync to our DB) |
| Storage | Cloudinary (meal photos) |
| Payments | Stripe (subscriptions + one-time IAP) |
| Maps | Expo Location + Mapbox GL |
| Notifications | Expo Push + SendGrid email |
| Real-time | Supabase Realtime (or WebSockets via Fastify) |
| Hosting | Railway (API + DB) + Vercel (web) |

## Environment Variables

See `.env.example` files in each app. Never commit actual secrets.

## Build Order

Build in this exact sequence to avoid dependency issues:

1. `packages/shared` — types and utils first
2. `apps/api` — full backend with all routes
3. `apps/web` — Next.js web app
4. `apps/mobile` — Expo app last

## Key Business Rules

1. **Pod size**: 3–8 members. Sweet spot is 4–5. Hard cap at 8.
2. **Cooking frequency**: Each member cooks 1× per week (their assigned "cook day").
3. **Meal claims**: Members claim a portion from each cook. Cooks batch-cook for the whole pod.
4. **Dietary restrictions**: Stored on user profile. Pods surface conflicts during invite flow.
5. **Trust**: Reviews are 1–5 stars, left after each meal received. A score below 3.5 triggers a warning.
6. **Matching**: New users who don't know neighbors can be matched by the algorithm (proximity + dietary compatibility + schedule).
7. **Free tier**: 1 pod, no matching, basic scheduling.
8. **Premium ($4.99/mo or $39/yr)**: Multiple pods, AI meal suggestions, smart scheduling, full history, priority support.
9. **Lifetime ($14.99)**: All premium features, one-time. Pushed in iOS/Android IAP.

## API Route Structure

```
POST   /auth/webhook              ← Clerk webhook to sync user
GET    /users/me
PATCH  /users/me
GET    /users/me/circles

POST   /circles                      ← Create pod
GET    /circles/:id
PATCH  /circles/:id
DELETE /circles/:id
POST   /circles/:id/invite           ← Send invite link
POST   /circles/:id/join             ← Join via invite code
DELETE /circles/:id/leave

GET    /circles/:id/schedule         ← Weekly cook schedule
POST   /circles/:id/schedule         ← Set/update schedule

POST   /meals                     ← Post a meal you're cooking
GET    /meals/:id
PATCH  /meals/:id
DELETE /meals/:id
POST   /meals/:id/claim           ← Claim a portion
DELETE /meals/:id/claim           ← Unclaim

POST   /reviews                   ← Leave review for received meal
GET    /users/:id/reviews

GET    /notifications
PATCH  /notifications/:id/read

POST   /subscriptions/checkout    ← Stripe checkout
POST   /subscriptions/portal      ← Customer portal
POST   /subscriptions/webhook     ← Stripe webhook
GET    /subscriptions/status

POST   /matching/request          ← Request pod matching
GET    /matching/suggestions      ← Get nearby compatible users
```

## Mobile Screen Map

```
Tab 1: Home
  → HomeScreen (today's meals, upcoming pickups, your next cook day)

Tab 2: Pod
  → PodScreen (your pod members, this week's schedule)
  → MealDetailScreen (meal info, claim, directions)
  → MemberProfileScreen

Tab 3: Post Meal
  → PostMealScreen (photo, description, portions, pickup time/location)

Tab 4: Discover
  → DiscoverScreen (find pods near you — premium)
  → MatchingScreen

Tab 5: Profile
  → ProfileScreen (dietary prefs, cook history, reviews, subscription)
  → SettingsScreen
  → NotificationsScreen
```

## Web Pages

```
/ → Landing (marketing + app download CTAs)
/how-it-works → Explainer
/signup → Clerk signup
/login → Clerk login
/app → Dashboard redirect (auth required)
/app/circles/[id] → Pod detail
/app/meals/[id] → Meal detail
/app/profile → Profile
/app/settings → Settings
/invite/[code] → Join pod via invite link (works without app)
/pricing → Pricing page
```

## Data Models (Summary)

### User
- id, clerkId, email, name, avatar
- bio, location (lat/lng), neighborhoodName
- dietaryRestrictions (array: VEGETARIAN, VEGAN, GLUTEN_FREE, DAIRY_FREE, NUT_FREE, HALAL, KOSHER, OTHER)
- allergies (text)
- portionSize (SMALL, STANDARD, LARGE)
- cookingStyle (tags: e.g., "Italian", "Mexican", "Asian", "Comfort food")
- subscriptionTier (FREE, PREMIUM, LIFETIME)
- createdAt, updatedAt

### Pod
- id, name, description, inviteCode
- maxSize (default 5, max 8)
- status (FORMING, ACTIVE, PAUSED, DISBANDED)
- neighborhoodName, lat, lng
- createdById, createdAt, updatedAt

### PodMembership
- id, podId, userId
- role (OWNER, ADMIN, MEMBER)
- turn (MON–SUN — their assigned cook day)
- status (PENDING, ACTIVE, PAUSED, LEFT)
- joinedAt

### Meal
- id, podId, cookId
- title, description, photo (Cloudinary URL)
- cuisineType, dietaryTags
- servingsAvailable, servingsClaimed
- pickupTime, pickupLocation (text), pickupLat, pickupLng
- status (DRAFT, POSTED, CLAIMED, COMPLETED, CANCELLED)
- cookDate (the date it's for)
- createdAt, updatedAt

### Seat
- id, mealId, claimantId
- portions (default 1)
- status (PENDING, CONFIRMED, PICKED_UP, NO_SHOW)
- pickedUpAt

### Review
- id, mealId, reviewerId, revieweeId
- rating (1–5)
- comment
- type (MEAL_QUALITY, PICKUP_EXPERIENCE)
- createdAt

### Notification
- id, userId, type, title, body, data (JSON), read, createdAt

### Subscription
- id, userId, stripeCustomerId, stripePriceId, stripeSubscriptionId
- tier (PREMIUM, LIFETIME)
- status (ACTIVE, CANCELLED, PAST_DUE)
- currentPeriodEnd

## UI Design Principles

- **Warm, home-cooked feel**: Earthy palette. Cream (#FDF6EC), warm orange (#E8733A), deep brown (#3D2314), forest green (#4A7C59).
- **Card-based layout**: Meals are cards with photos, like Instagram but utilitarian.
- **Minimal cognitive load**: The home screen shows only what matters today.
- **Trust-forward**: Show member photos, review scores, cook history prominently.
- No dark mode in v1. Keep it warm.

Primary font: Inter (web/mobile cross-compatible)
Icon set: Lucide icons

## Common Commands

```bash
# Start API dev server
cd apps/api && yarn dev

# Start web dev server  
cd apps/web && yarn dev

# Start mobile dev
cd apps/mobile && yarn start

# Run database migrations
cd apps/api && yarn db:migrate

# Seed database
cd apps/api && yarn db:seed

# Open Prisma Studio
cd apps/api && yarn db:studio

# Type check all packages
yarn typecheck

# Run tests
yarn test
```

## Testing Strategy

- Unit tests: Vitest for API services and shared utilities
- Integration tests: Supertest against the Fastify server with a test DB
- Mobile: Detox for critical flows (sign up, post meal, claim meal)
- No snapshot tests — they're noise

## Key Implementation Notes

1. **Invite codes**: 8-char alphanumeric, stored on Pod, regeneratable. Works as deep link on mobile (`round://invite/CODE`) and web (`https://round.app/invite/CODE`).

2. **Matching algorithm** (`apps/api/src/services/matching.service.ts`):
   - Filter by radius (default 2 miles)
   - Score = (dietary_compatibility × 0.4) + (schedule_overlap × 0.3) + (pod_size_preference × 0.2) + (review_score × 0.1)
   - Return top 5 compatible pods or users

3. **Cook schedule logic**: When a pod has N members, each gets one weekday. Weekends are optional. Schedule rotates monthly. Stored as `turn` on PodMembership.

4. **Stripe integration**:
   - Monthly sub: `price_xxx_monthly` 
   - Annual sub: `price_xxx_annual`
   - Lifetime: one-time payment product
   - iOS/Android IAP handled natively in the mobile app (RevenueCat recommended for IAP abstraction)

5. **Photo uploads**: Mobile uploads directly to Cloudinary unsigned preset. API only stores the Cloudinary URL, never the binary.

6. **Push notifications**: Use Expo's push token stored on User. Send via `apps/api/src/services/notification.service.ts` which calls Expo's push API.

## Files That Must Be Built First

1. `packages/shared/src/types/index.ts` — all shared TypeScript types
2. `apps/api/prisma/schema.prisma` — full database schema
3. `apps/api/src/db/client.ts` — Prisma client singleton
4. `apps/api/src/app.ts` — Fastify app factory
5. `apps/api/src/routes/index.ts` — route registry

After those 5, the rest can be built in any order.

## Monetization Summary

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 1 pod, no matching, 20 meal history |
| Premium | $4.99/mo or $39/yr | Unlimited pods, matching, full history, AI suggestions |
| Lifetime | $14.99 one-time | Everything in Premium, forever |

**Revenue projection**: At 10k active users, 15% convert to paid → ~1,500 paid users. At avg $4.50/user/mo → ~$6,750 MRR. Lifetime buyers reduce churn risk.

## What To Build in MVP vs Later

### MVP (v1.0)
- [x] Auth (Clerk)
- [x] Create/join pod via invite code
- [x] Post a meal with photo, description, portions
- [x] Claim a meal
- [x] Cook schedule (manual assignment)
- [x] Basic push notifications (your cook day is tomorrow, meal claimed)
- [x] User profiles with dietary prefs
- [x] Reviews after meal pickup
- [x] Stripe subscription (Premium monthly only in v1)
- [x] Web app (responsive)
- [x] iOS app via Expo

### V2
- [ ] AI meal suggestions (based on pod dietary mix)
- [ ] Neighborhood matching algorithm  
- [ ] Android app
- [ ] Recurring meal templates ("I always make enchiladas on Tuesdays")
- [ ] Grocery list sharing between pod members
- [ ] Pod chat / comments on meals
- [ ] Lifetime IAP via RevenueCat
- [ ] Community leaderboards / cook streaks

### V3
- [ ] B2B: cohousing communities, office pods, apartment buildings
- [ ] Waitlist + pod discovery marketplace
- [ ] Integration with Instacart/grocery delivery
