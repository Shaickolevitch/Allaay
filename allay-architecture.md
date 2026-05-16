# Allay — Architecture & Build Reference

> Working title: **Allay** (English transliteration of עליי; also the English verb meaning "to relieve fears")
> Tagline candidate: *"The six degrees between you and every recommender."*

---

## 1. Concept

A trust-based social network for finding small/medium business services, where every recommendation comes with a visible **path of human connections** between you and the recommender (up to 6 hops). The goal: replace the "ask in WhatsApp group + search Mizrahg + check Facebook + ask mom" workflow with one specialized platform.

**The differentiator:** when you see "35 people recommend this electrician," you can see how each one is connected to you — through your sister's coworker, your kid's teacher, etc. — and click into their profile to verify the chain.

---

## 2. Locked Product Decisions

### Users & identity
- Single account type. Anyone can be a client, a business owner, or both.
- Sign-up: OAuth only (Google / Apple / Facebook) **+ verified phone + verified email**.
- Onboarding asks for name, photo, bio, city. Business page is a separate thing you optionally create.

### Friend graph
- **Mutual, confirmed friendships** (Facebook-style, not Instagram-style follows).
- **Hard cap: 150 friends** (Dunbar number — quality over quantity, prestige framing).
- Friends only between users. Pages cannot be "friended" — only liked/shared/commented on.
- Contacts import allowed for friend suggestions.

### Circles (relationship labels)
- Pre-made hard circles: **family, extended family, city, neighborhood, street, school, university, work, gym, other**.
- Asymmetric: my label for Sarah is independent of her label for me.
- One friend can be in multiple circles.
- Used to (a) filter the allayer list and (b) weight closeness in sort.

### Business pages
- Created by anyone. Creator = owner.
- **One owner per page for MVP** (multi-owner deferred to v1.1).
- v1.1: up to 10 members per page. Owner can add/remove editors; editors can edit content but not delete page or manage members. Google-Sheets-style permissions.
- **Each branch is a fully separate page**, soft-linked via `branch_of_id`.
- Fields: name, category, description, address, phone, WhatsApp, website, social links, opening hours, price range.
- **Service menu with prices** (CRUD per service).
- **1 profile picture + up to 10 gallery photos.**
- Business owners can recommend other business owners; their allays show in a separate column on the target page.

### The Allay action (core mechanic)
- One **Allay** per user per business page (the "trust me" boost).
- Allay is the **gate**: only after you Allay can you score or comment.
- Scoring is **required**, comment is optional.
- **5 universal scoring parameters, all 1–5 stars:** Professionalism, Initiative, Speed, Communication, Quality.
- Score is editable; allay can be revoked. Business owner is notified on allay events.
- Page displays the aggregate score first; tapping reveals the 5-parameter breakdown.
- Scores are **not** weighted by closeness in the aggregate (every allayer counts equally in the math). Closeness is used for sorting/filtering the recommender list, not the score itself.

### Comments
- Flat (no threads), public, editable by author.
- **Business owner cannot delete or moderate comments** — preserves trust.
- Can be allay/liked by other users.

### The connection paths (the differentiator)
- A business page shows the **total number of allays** prominently.
- Tapping the list opens two tabs:
  - **Familiar tab:** allayers within **1–3 hops** of you.
  - **Strangers tab:** allayers within **4–6 hops** of you.
  - Beyond 6 hops: not displayed (six-degrees-of-separation cap; bounds query cost).
- Both tabs sortable by closeness.
- Tapping any allayer opens their profile.
- On a profile, all paths (up to 6 hops, can be shortened by their privacy setting) between you and them are visible, including paths that go through your circles ("via your sister's high-school friend").

### Privacy
- Default profile visibility: public, paths shown to anyone within 6 hops.
- User can lower their own `max_steps_to_see_profile` setting (1–6). Direct friends always see unlimited info.
- **Bridge opt-out:** users can globally hide themselves as a "bridge node," OR hide themselves specifically from being shown as a bridge to one named person (e.g., an ex).

### Discovery
- **Search page:** filters include category, location/distance, minimum allays, minimum overall score, open now, price range, within-X-degrees, has photos, verified.
- **Natural language search:** LLM converts "wedding photographer in Tel Aviv under ₪5,000 my friends recommend" into structured filters. Costs ~$0.001/query.
- **Blob/network visualization** (deferred to v1.1): businesses as nodes, your connections as edges, filterable. Force-directed graph layout.
- No map view for MVP. Possibly never.
- Businesses with zero connections in your network appear only under a dedicated "Discover unknown" filter.

### Sharing
- Pages can be shared as links — **but viewing requires login.** This is a trust network, not a public directory.

### Notifications
- Someone allays your page · Someone allays your recommendation · Friend request received · Friend joins Allay · Friend allays a business · Comment on your recommendation · Admin message.
- Delivered via in-app + email digest. Powered by Supabase Realtime.

### Verification & abuse
- Verified phone + verified email are required to participate. There is **no "verified badge" tier**. Being on Allay = being verified.
- "Report fake" button on every page/profile/comment. Admin (you) reviews manually.

### Monetization
- **Subscription for business owners only.** Pro tier with analytics, response templates, priority in tied rankings. ~₪29–99/mo.
- **No ads. No lead-gen fees. No verified-badge tier. No transaction fees** (for MVP).

### AI for MVP
- ✅ Natural-language search (LLM call → structured filters)
- ✅ Category auto-suggest at business signup
- 🕓 Spam/fake-recommendation detection — v2
- 🕓 Comment summarization — v2
- 🕓 Real match-making algorithm — v2 (needs data)

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js 14+ (App Router) | SSR for SEO of business pages, server actions, mature, solo-friendly |
| Language | TypeScript | Non-negotiable for solo dev sanity |
| Styling | Tailwind CSS + RTL plugin | Logical properties (`ms-4` not `ml-4`), RTL-clean |
| i18n | `next-intl` | Hebrew now, English drop-in later |
| Client state | Zustand | Tiny, no boilerplate |
| Data fetching | TanStack Query | Caching, optimistic updates |
| Graph viz | `react-force-graph` | For v1.1 blob page |
| Backend | Next.js server actions + API routes | One codebase, one mental model |
| Database | Supabase (Postgres + PostGIS) | Recursive CTEs for graph queries, geo for distance filters |
| Auth | Supabase Auth | OAuth providers + magic link out of the box |
| Storage | Supabase Storage | Business photos |
| Realtime | Supabase Realtime | Notifications, no websocket plumbing |
| Hosting | Vercel | Free tier, zero-config Next.js |
| SMS verify | Twilio | ~$0.05/verification in IL |
| Email | Resend | Transactional + digests |
| LLM | OpenAI or Anthropic API | NL search, category suggest |

**Estimated monthly cost at MVP scale: $0–30.**

---

## 4. Data Model

Core tables (PK = primary key, FK = foreign key):

### `users`
`id, email, phone, name, profile_pic_url, bio, city, privacy_max_steps (1–6, default 6), oauth_provider, created_at`

### `friendships`
`id, user_a_id, user_b_id, status (pending/accepted/declined), created_at, accepted_at`
Canonical ordering: `user_a_id < user_b_id`. Trigger enforces 150-friend cap.

### `friend_circles`
`id, user_id (labeler), friend_id (labeled), circle_type`
Enum: `family, extended_family, city, neighborhood, street, school, university, work, gym, other`.

### `business_pages`
`id, owner_id, name, slug, description, category_id, branch_of_id (nullable), profile_pic_url, phone, whatsapp, website, social_links (jsonb), address, latitude, longitude, opening_hours (jsonb), price_range, subscription_tier, created_at`

### `business_page_members` (data model ready, UI in v1.1)
`id, page_id, user_id, role (owner/editor)` — max 10 per page.

### `business_photos`
`id, page_id, url, display_order, caption` — max 10 per page.

### `business_services`
`id, page_id, name, description, price_min, price_max, currency, display_order`

### `categories`
`id, name_he, name_en, parent_id` — ~40 hand-picked top-level for MVP.

### `allays`
`id, user_id, page_id, created_at` — UNIQUE(user_id, page_id).

### `scores`
`id, user_id, page_id, professionalism, initiative, speed, communication, quality, created_at, updated_at` — all 1–5, all required. FK to existing allay.

### `comments`
`id, user_id, page_id, content, created_at, edited_at` — flat, gated by allay, editable by author only.

### `bridge_optouts`
`id, user_id, excluded_viewer_id (NULL = global)`

### `notifications`
`id, user_id, type, source_user_id, source_page_id, content (jsonb), read_at, created_at`

### `reports`
`id, reporter_id, target_type, target_id, reason, status, admin_notes`

### `page_aggregates` (materialized view)
`page_id, total_allays, avg_professionalism, avg_initiative, avg_speed, avg_communication, avg_quality, overall_avg` — refreshed on score change.

---

## 5. The Graph Query

Bidirectional view to simplify traversal:

```sql
CREATE VIEW friendship_edges AS
SELECT user_a_id AS src, user_b_id AS dst FROM friendships WHERE status='accepted'
UNION ALL
SELECT user_b_id AS src, user_a_id AS dst FROM friendships WHERE status='accepted';
```

**Query A — "Who allayed this business, and what's my path to each within 6 hops?"** Recursive CTE BFS, depth-capped at 6, cycle-protected, bridge-opt-outs excluded. Returns `min_hops` per allayer; frontend buckets into Familiar (1–3) and Strangers (4–6).

**Query B — "What's the shortest path between me and this specific user?"** Same shape, terminates when target found. Runs on profile visit.

### Indexes that matter
- `friendships(user_a_id, status)`
- `friendships(user_b_id, status)`
- `allays(page_id)`
- `allays(user_id)`

### Performance reality check
With the 150-friend cap and depth ≤6, real queries terminate in **10–200 ms** on Supabase's small tiers. Most paths terminate at hops 2–3 due to social clustering.

### Escape valve for scale (don't build until needed)
A `reachability_cache(viewer_id, target_id, min_hops, path)` table maintained via triggers when friendships change. Defer until you see P99 latency > 500 ms.

---

## 6. MVP Scope

### In MVP
- OAuth + phone + email verification
- Profile (name, photo, bio, city, privacy settings)
- Friend graph: search, request, accept, 150 cap, circles, bridge opt-outs
- **Single-owner** business pages (data model supports multi-owner; UI defers)
- Service menu with prices, opening hours, contact info, 1 + 10 photos
- Allay → Score (5 params, required) → Comment flow
- Aggregate score + breakdown display
- Allayers list with **Familiar (1–3 hops) / Strangers (4–6 hops)** tabs
- Profile pages with paths displayed (capped at 6)
- Search with filters + **NL search via LLM**
- Notifications (Realtime + email digest)
- Report flow + simple admin dashboard
- Hebrew RTL, responsive web

### Deferred to v1.1
- 🕓 Multi-owner / editor pages UI
- 🕓 **Blob/network visualization** discovery page
- 🕓 Branches "siblings" UI
- 🕓 Business subscription tier

### Deferred to v2
- AI spam/fake detection
- Comment summarization
- Real match-making engine
- English locale
- Native mobile apps
- Map view
- Business owner analytics dashboard

### Cut entirely
- ❌ Threaded comments
- ❌ News feed / posts
- ❌ Direct messaging (use WhatsApp deep-links)
- ❌ Verified badge tier
- ❌ Ads of any kind

---

## 7. Phased Build Plan

| Phase | Weeks | Deliverable |
|---|---|---|
| 0 — Foundation | 2 | Next.js + Supabase scaffolding, OAuth, phone verify, onboarding, i18n + RTL |
| 1 — Social Graph | 3 | Friend search/request/accept, 150 cap, circles, privacy settings, basic profile |
| 2 — Business Pages | 3 | Create/edit page, photos, service menu, categories, public page view |
| 3 — Core Loop | 2 | Allay button, 5-score widget, comments, aggregate scoring |
| 4 — Graph Magic | 3 | Recursive CTE path queries, paths-on-profile UI, Familiar/Strangers tabs, bridge opt-outs |
| 5 — Discovery | 2 | Search page, filters, NL search via LLM |
| 6 — Polish + Launch | 2 | Notifications, report flow, admin dashboard, TOS/privacy, landing page, seed users |

**Total: ~17 weeks full-time, ~25 weeks part-time.** Add 30% buffer.

---

## 8. Risks & Mitigations

1. **Path queries at scale.** Log every recursive CTE's runtime from day 1. If P99 > 500 ms, add the reachability cache.
2. **Privacy law (Israel + future GDPR).** Pay an Israeli privacy lawyer for 2 hours of review **before public launch**. Connection paths expose information about third-party bridges; opt-outs help but don't fully eliminate risk.
3. **Cold-start liquidity.** Pick ONE neighborhood + ONE vertical. Force-seed 200 clients + 50 businesses manually before public launch. Going wide kills the platform.
4. **Solo-dev burnout.** Plan for 25 weeks, not 17. When tired, cut scope, not quality.
5. **Hebrew + RTL bugs.** Test every page on every release. Use Tailwind logical properties religiously.

---

## 9. Open Questions (for you / business partner)

- Final list of ~40 top-level business categories
- Pricing for the business Pro subscription
- Seed strategy: which neighborhood, which vertical
- Final brand decision: confirm Allay + pick a workable domain (`allay.app`, `allay.co`, `getallay.com`, `allay.co.il`)
- Legal counsel selection in Israel
- Initial admin tooling needs (beyond report queue)

---

## 10. Next Concrete Steps

1. ✅ Lock the brand: Allay + domain
2. ✅ Settle business categories list (~40)
3. Privacy lawyer consultation (before any code goes live)
4. Repo skeleton: Next.js + Supabase + i18n + RTL + Tailwind boilerplate
5. Phase 0 build kickoff

---

*Last updated: planning phase. Update this doc whenever you make a locked decision.*
