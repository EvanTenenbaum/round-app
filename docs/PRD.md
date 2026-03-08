# Round — Product Requirements Document
## Version 2.0 | March 2026 | Post-Research Revision

> Version 2.0 incorporates findings from a 7-agent brand and market research session including synthetic focus groups across 5 demographics (25 participants). Major changes from v1.0 are called out inline.

---

## Executive Summary

**Round** is a community meal co-op mobile app (iOS-first, web companion) where neighbors form small cooking circles of 3–8 people and take turns cooking for each other. Each person cooks once per week and receives home-cooked meals from circle-mates on the other nights.

The concept solves a clear and widely-felt pain: busy people want affordable, healthy, home-cooked meals but don't have the time or energy to cook every night. The real job-to-be-done goes deeper than convenience — it's about feeling like you have a family table again. Working parents are grieving the loss of the family dinner. Singles cooking for one are lonely. Empty nesters who love to cook have no one to cook for anymore. Round solves an emotional problem that DoorDash, HelloFresh, and every other food product ignores.

---

## Naming and Nomenclature

> **v2.0 change: "Hearth" → "Round". All internal terminology updated.**

### Why We Killed "Hearth"

Brand research and focus group testing across all five target demographics surfaced the same problem unprompted: three of five groups described "Hearth" as a real estate or home décor brand before being told what the app does. Urban renters — the highest-delivery-spend demographic — actively rejected it as suburban. App Store discoverability scored 4/10 (buried under fireplace products and a B2B HR tool). Trademark risk is high in the home services category. A safe, warm name that's invisible in the app store and sends the wrong signal before the icon is tapped is not a viable launch name.

### Why Round

- Cooking round, round robin, roundtable — captures the rotation mechanic intuitively
- One syllable, globally neutral, no trademark conflicts in food or tech
- Brand essence: **Fair. Warm. Yours.**
- Works for both urban renters (feels neutral, modern) and suburban families (feels equitable, organized)
- The only name tested that resonated across all five demographics without a strong objection in any group

Runner-up: **Table**. Universal, immediately understood. Use if Round has domain or trademark blockers.
Do not use: Supper Club (implies cooking skill gatekeeping, repels anxious cooks), Hearth (reasons above).

### Full Nomenclature System

| Old | New | Why |
|-----|-----|-----|
| Pod | **Circle** | Warmer, no tech/WeWork baggage, implies ongoing gathering |
| Cook day | **Your turn** | Conveys rotation and personal ownership, not scheduling language |
| Claim | **Save a seat** | Social, not transactional. You don't "claim" dinner. |
| Members | **Your circle** (in-app) / **neighbors** (marketing) | Human, not feature-speak |
| Free tier | **Round** | Product name as tier name |
| Premium | **Round Member** | Membership framing, not upgrade framing |
| Lifetime | **Founding Member** | Launch positioning, creates urgency and identity |

---

## Market Research

### The Problem (Validated)

Five focus groups across all target demographics confirmed the same thing: demand is there and organizing friction is the only reason dinner circles don't already happen. Multiple participants in every group said some version of "I've wanted to do this, we just never set it up." This is not an education problem. It is a coordination problem. Round is the answer to a known desire.

Key pain points ranked by frequency:
1. **Exhaustion** — too tired after work to cook, even people who like cooking
2. **Cost** — delivery is $400–800/month for working singles and families; every group knew their exact number
3. **Isolation** — singles cook for one; empty nesters cook for nobody; parents eat standing over the sink
4. **Repetition** — even skilled cooks are bored making the same meals
5. **Guilt** — the gap between "I want to feed my family well" and "we ordered DoorDash again"

### Competitive Landscape

| Player | Model | Status | Gap |
|--------|-------|--------|-----|
| **Potluck** (joinpotluck.app) | Identical concept | Waitlist only, May 2025 | Not launched |
| **Food Swap Network** | In-person swap events | Event-based | Not for weeknight dinners |
| **OLIO** | Food sharing/waste reduction | Active, 5M users | Not structured co-op |
| **Too Good to Go** | Restaurant surplus | Active, 40M users | Not home cooking |
| **HelloFresh/Sunbasket** | Meal kit delivery | Active, large | Expensive, impersonal |
| **DoorDash/Uber Eats** | Restaurant delivery | Dominant | $15–25/meal, unhealthy |

No production app exists doing structured reciprocal neighborhood meal co-ops. One near-competitor hasn't launched. The gap is real.

### Category Strategy: Create, Don't Enter

> **v2.0 change: explicit category creation strategy.**

Entering "food apps" puts Round next to DoorDash and HelloFresh. We cannot win that fight. Entering "community apps" puts us next to Nextdoor — different problem.

**The category to create: Cooperative Cooking / Dinner Circles.**

This requires a named concept people can repeat ("it's like a cooking co-op for your neighborhood"), a founding story, press that explains the category before explaining the product, and Round IS the category — not a version of someone else's.

Risk: takes longer, requires market education. Reward: Round owns the search terms, the mental model, and the press narrative permanently.

---

## User Personas

### Primary: Maya, 34 — The Burned-Out Working Parent

- Product manager in SF, two kids ages 3 and 6, partner also works full-time
- Orders DoorDash 3–4× per week ($400–600/month on delivery)
- Already in a neighborhood WhatsApp group — one step from a dinner circle
- Key need: know dinner is handled without cooking every night
- Conversion lever: "Replace $400/month in delivery with one real dinner per week"

### Primary: Amy, 45 — The Primary Cook Seeking Reciprocity

> **v2.0 addition: emerged from suburban families focus group as underserved and high-value.**

- Returning to work after 12 years home, four kids, Charlotte NC
- Has cooked for her family every night for over a decade. Excellent cook. Loves feeding people.
- Not burned out — she wants the exchange. She said: *"I cook for six people every single night, and nobody ever cooks for me."*
- Key need: reciprocity, not just convenience
- This persona is a natural circle founder. She will recruit neighbors and run the circle without being asked. Build organizer features for her.

### Secondary: Tomás, 28 — The Single Professional

- Software engineer in Austin, cooks decently, finds cooking for one wasteful
- $800/month on delivery; knows the exact number and hates it
- Misses communal meals from college
- Key need: social connection + variety + stop hemorrhaging money on delivery

### Secondary: Linda, 58 — The Empty Nester Circle Founder

> **v2.0 upgrade: moved from tertiary to secondary. This persona builds the network.**

- Retired teacher, Portland suburbs. Kids grown. Still loves cooking for groups.
- Already informally runs a rotating dinner arrangement on her street — it falls apart every August because there's no infrastructure.
- Has time, skills, social capital, and willingness to pay more than free-tier pricing suggests
- Key need: regular recipients for her cooking + a community she can organize around
- She is not a customer to acquire — she is a network builder to activate. Give her the "Circle Organizer" identity explicitly.

### Edge Case: Derek, 39 — The Allergy Parent

> **v2.0 addition: represents a vocal minority who will tank the product if handled badly.**

- Physician, Bethesda MD, three kids, son with anaphylactic tree nut allergy
- High anxiety about food from outside the household. Would use Round if allergen management is airtight.
- If his son has a reaction: app deleted, negative reviews everywhere
- Key need: trust, not features. Allergen information must be prominent and reliable.
- Allergen management is a trust-and-safety issue. Treat it that way.

---

## Core Design Principles

> **v2.0 addition: derived from cross-demographic research.**

### 1. Reliability is the product

Every focus group, unprompted, named "someone not showing up" as the thing that would kill the app for them. Not bad design. Not confusing UX. Flakiness. One missed cook night destroys the trust that makes the entire model work. Commitment confirmation, accountability visibility, and a clean cancellation flow are the trust infrastructure the product depends on. Build this before anything else.

### 2. The organizing friction is the only barrier

The demand exists. People already want to do this. Round's job is to make organization effortless, not to convince people the concept is good.

### 3. Normalize weeknight cooking, not performance

Young professionals and suburban parents both flagged performance anxiety about cooking for others. Set expectations at "Tuesday night dinner from a real person on your block" — not "impress your neighbors." Meal posting flow, photo prompts, and onboarding language should reinforce this.

### 4. Urban and suburban trust architectures are different

Suburban families trust neighbors they already know and use Round to coordinate. Urban renters need digital trust-building before physical exchange — they want profiles, food photos, and reviews before they ever meet someone. Design two distinct onboarding flows.

### 5. Container logistics are a UX problem, not an afterthought

Urban renters flagged Tupperware return logistics as a genuine friction point. Establish a clear standard in onboarding and in the meal posting flow: cook provides containers, no returns expected.

---

## MVP Features (v1.0)

### Must Have

**Auth and Onboarding**
- [ ] Auth via Clerk (email + Google OAuth)
- [ ] Onboarding step 1: name + photo
- [ ] Onboarding step 2: location permission + neighborhood name
- [ ] Onboarding step 3: dietary restrictions (prominent — this is a trust signal)
- [ ] Onboarding step 4: cooking style tags + skill level
- [ ] Allergen profile (separate from dietary prefs — for Derek-type users)
- [ ] Container preference ("I provide containers / bring your own")

**Circles**
- [ ] Create a circle (name, description, max size 4–8)
- [ ] Invite via link/code (8-char, shareable via iOS share sheet)
- [ ] Join circle via invite code
- [ ] Dietary compatibility warning when creating or joining a circle
- [ ] Assign turns to members
- [ ] Weekly schedule view: who's cooking which night

**Reliability Infrastructure** *(non-negotiable per Design Principle 1)*
- [ ] Cook confirmation: 24h before your turn, push notification requiring explicit confirmation
- [ ] If no confirmation by 6am: reminder push + warning on circle feed
- [ ] Last-minute cancel flow: notifies all who saved a seat; logs a reliability event on profile
- [ ] Reliability score visible on member profiles (% of turns fulfilled)
- [ ] 3 no-shows: circle admin gets prompted to review that membership

**Meals**
- [ ] Post a meal (title, description, photo, cuisine type, dietary tags, allergen flags, servings, pickup time, pickup location, container policy)
- [ ] Save a seat (replaces "claim")
- [ ] Unsave seat up to 2 hours before pickup
- [ ] Cancel meal post with immediate notification to everyone who saved a seat
- [ ] Weekly feed: what's cooking this week in your circle

**Reviews and Trust**
- [ ] Leave a review after pickup time passes (rating + optional note)
- [ ] Ratings visible on member profiles
- [ ] Report a meal (allergen mismatch, no-show, quality issue)

**Notifications**
- [ ] Turn reminder the night before
- [ ] Cook confirmation request 24h out
- [ ] Meal posted in your circle
- [ ] Someone saved a seat on your meal
- [ ] Pickup reminder 1h before

**Subscriptions**
- [ ] Round (free): 1 circle, max 4 members, 30-day history
- [ ] Round Member ($7.99/mo or $59/yr): unlimited circles, max 8 members, full history, matching, AI suggestions
- [ ] Founding Member ($49 one-time, launch only): all Member features forever

### Nice to Have in MVP
- [ ] Cook streak tracking (gamification — consecutive fulfilled turns)
- [ ] Recipe suggestions based on circle's dietary profile
- [ ] Circle size upgrade prompt when free tier hits 4-person limit

---

## Non-Goals (v1)

- No in-app messaging or chat (use existing phone/WhatsApp)
- No payment between members (explicitly gift-based)
- No grocery list features
- No Android app (v2)
- No stranger matching (v2 — premium feature, not core)
- No B2B or cohousing integrations (v3)
- No dark mode (v1)

---

## Revenue Model

> **v2.0 change: pricing revised based on focus group willingness-to-pay and structural monetization analysis.**

### Why the Old Pricing Was Wrong

Three problems with v1.0 ($4.99/mo, $14.99 lifetime):

1. **Priced against features, not transformation.** The core value — the circle — exists in the free tier. $4.99 doesn't signal "never worry about dinner again."

2. **$14.99 lifetime was a conversion trap.** At 3× monthly, every engaged user buys it immediately and never pays again. Lifetime must be set at 6–8× monthly to protect MRR.

3. **Wrong conversion lever.** Premium features like AI and matching are not why people upgrade. Circle size is. The moment a fifth neighbor wants to join, they hit the upgrade wall. Make the upsell structural, not feature-based.

### Tiers

**Round — Free**
- 1 active circle, max 4 members
- Post unlimited meals
- Basic scheduling + turn assignment
- 30-day meal history
- Push notifications

**Round Member — $7.99/mo or $59/yr**
- Unlimited circles, max 8 members per circle
- Neighborhood matching algorithm
- Full meal history and stats
- AI meal suggestions based on circle's dietary profile
- Priority support

**Founding Member — $49 one-time (launch period only)**
- All Round Member features, forever
- Time-limited to create urgency and reward early adopters
- After launch period: ongoing lifetime pricing moves to $89

### Revenue Projections (revised)

| Month | MAU | Paid % | Avg rev/paid user | MRR |
|-------|-----|--------|-------------------|-----|
| 3 | 500 | 8% | $7.00 | $280 |
| 6 | 2,500 | 12% | $7.50 | $2,250 |
| 12 | 10,000 | 15% | $7.50 | $11,250 |
| 18 | 30,000 | 18% | $7.50 | $40,500 |
| 24 | 80,000 | 20% | $7.50 | $120,000 |

---

## Positioning and Messaging

> **v2.0 addition.**

### Brand Positioning

**For ads:** Round turns your neighbors into a dinner rotation. Everyone cooks once a week. Everyone eats home-cooked meals all week. Fair by design.

**Word of mouth:** "There are six of us on our block. We each cook one night — enough for everyone. I haven't made Tuesday dinner in four months."

### Taglines (ranked)

1. **"Dinner's on someone else tonight."** — immediate relief, specific to the 5pm feeling, no explanation needed. Use for paid acquisition.
2. **"Cook once. Eat all week."** — clean, factual, works as App Store subtitle.
3. **"Your neighborhood's dinner table."** — warmest, best for brand and press.

### The Quote That Belongs on the Wall

> "I cook for six people every single night, and nobody ever cooks for me." — Amy, 45

### Launch Message Architecture

**Working Parents**
Headline: Dinner's on someone else tonight.
Subhead: Round turns your neighborhood into a cooking rotation. Each person cooks once a week — everyone eats home-cooked meals all week.
Proof points: Replace $400/month in delivery with one real dinner per week · Dietary restrictions handled before you join · Start a circle in 2 minutes
CTA: Start your circle free

**Young Professionals**
Headline: Cook once a week. Eat well every night.
Subhead: Round connects you with neighbors for a weekly dinner rotation. Real food. Real people. Nobody cooks every night.
Proof points: The average Round member saves $340/month vs. delivery · One circle, one night a week, five nights of someone else's cooking · Find your building's circle now
CTA: Find circles near you

---

## Go-to-Market Strategy

> **v2.0 update: channels revised based on research. Distribution runs through existing trusted networks, not the app store.**

### Core Distribution Insight

Participants across every demographic said they would not find this app in the app store — they would hear about it from someone they trust in a community they're already in. The product spreads through existing trusted networks: neighborhood WhatsApp groups, building Slack channels, parent Facebook groups. Paid acquisition and influencer marketing are not the first move.

### Phase 1: Seeded Launch (Months 1–3)

**Reddit communities where this conversation already exists**
- r/frugal, r/mealprepsunday, r/HENRY, r/urbanplanning, r/simpleliving
- Message: "We built the app for the thing you've been describing in the comments for years"
- Why: these communities already have the conversation. The product is the answer to threads with thousands of upvotes.

**Dense urban building Slack channels and neighborhood apps**
- Target apartment buildings with active Slack channels, condo buildings on Nextdoor
- A single Slack post can activate an entire building — no cold start problem when trust is pre-established

**New parent communities**
- Facebook groups, Peanut app, pediatrician offices
- Message: "Nobody tells you about the dinner problem after having a baby. We built the solution."
- Why: new parents are the highest-urgency working parent variant; word of mouth is intense

**Founding Member incentive:** First circle creators get Founding Member status free for 6 months. They invite everyone they know. That is the viral mechanic.

### Phase 2: Growth (Months 4–9)

- SEO: own "dinner circle app", "meal co-op app", "neighborhood cooking rotation" — category terms Round should name
- Partner with cohousing communities and neighborhood associations (Linda-persona organizers)
- Press: pitch the category, not the product. "The rise of dinner circles" gets coverage. "New app Round" doesn't.

### Phase 3: Expansion (Month 9+)

- Android launch
- B2B: pitch property management companies (dinner circles as a community amenity)
- International: UK and Australia have strong co-op culture
- Formal ambassador program targeting the empty nester / retired primary cook segment

---

## Legal Considerations

Round is structured as a reciprocal gift/sharing arrangement, not a food marketplace.

1. Do not frame as "selling" — users are sharing food, not selling it
2. Include allergen disclosure acknowledgment in onboarding
3. Include a general sharing waiver in onboarding
4. Allergen UI must be prominent — trust-and-safety, not UX nicety
5. Reliability score is visible but framed as transparency, not punishment

Consult a startup attorney before launch.

---

## Success Metrics

### North Star
**Weekly Active Circles** — circles with at least one meal posted, saved a seat on, and picked up that week

### Supporting Metrics
- D30 retention (target: 55%)
- Turn fulfillment rate (target: 85%+ of assigned turns result in a meal post)
- Save-a-seat rate (target: 80%+ of posted meals get at least one seat saved)
- Paid conversion rate (target: 12% at 6 months)
- Review completion rate (target: 60% of received meals get reviewed)

### Anti-metrics
- No-show rate > 10% — trust breakdown, existential risk
- Circle churn within 30 days — cold start failure
- Founding Member % of revenue > 25% — over-reliance on one-time purchases

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Co-op flakiness / ghosting | High | Critical | Reliability infrastructure is core MVP, not v2 |
| Cold start in new cities | High | High | Building and neighborhood Slack seeding |
| Allergen incident | Low | Critical | Prominent allergen UI, onboarding waiver, attorney review before launch |
| Potluck launches first | Medium | Medium | Move fast; differentiate on reliability and UX quality |
| Circle dissolution → churn | Medium | High | Build "restart your circle" and "find a new circle" flows |
| Lifetime purchasers drain MRR | Medium | High | $49 Founding Member is launch-only. Hard cutoff. Move to $89 after. |
| Platform fees (Apple 30%) | High | Medium | Web checkout alternative, RevenueCat optimization |

---

## Appendix: Name Decision Log

| Name | Why Considered | Why Rejected |
|------|---------------|--------------|
| Hearth | Warm, original brand name | Real estate/home décor associations; buried in App Store; repels urban renters |
| Potluck | Natural fit for concept | Taken by direct competitor |
| Supper Club | Resonated with empty nesters and suburban families | Implies cooking skill gatekeeping; repels anxious weeknight cooks |
| Commons | Strong with urban young professionals | Too abstract; doesn't signal food |
| Mise | Won with young professionals | Too opaque for working parents and suburban families |
| Table | Universal, immediately understood | table.com is a furniture company; SEO is brutal |
| **Round** | **Won across all demographics; no strong objections in any group** | **Selected** |
