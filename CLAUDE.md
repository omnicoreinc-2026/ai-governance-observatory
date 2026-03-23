# CLAUDE.md — AI Governance Observatory

> Real-time AI governance intelligence platform tracking regulations, vendor guardrails, safety frameworks, and enforcement actions across all major AI providers.

## Project Identity

| Field | Value |
|-------|-------|
| Project | AI Governance Observatory |
| Owner | Victor Perez / Omnicore Inc. |
| Repo | omnicoreinc-2026/ai-governance-observatory |
| Stack | Next.js 14, React 18, TypeScript, Supabase, Tailwind v4, Recharts, Lucide |
| Hosting | Vercel (Hobby tier) |
| Database | Supabase PostgreSQL (free tier) |
| Domains | governance.omnicoreinc.com (production) |
| Cost Model | $0/month — zero paid APIs, all data via RSS/scraping |

## Architecture Overview

```
VERCEL
├── Next.js 14 App Router (frontend + API)
│   ├── app/                    → Pages and API routes
│   ├── app/api/cron/refresh/   → Vercel Cron endpoint (2x daily)
│   ├── app/api/alerts/         → Public read API
│   ├── app/api/vendors/        → Public read API
│   └── app/api/frameworks/     → Public read API
├── lib/
│   ├── ingestion/engine.ts     → Core RSS/scrape ingestion pipeline
│   ├── ingestion/keywords.ts   → Severity/category/vendor detection
│   ├── ingestion/scoring.ts    → Priority score computation
│   ├── supabase/client.ts      → Supabase client (anon for reads)
│   └── supabase/admin.ts       → Supabase service role client (writes)
├── components/                 → React UI components
├── scripts/
│   ├── seed.ts                 → Initial data population
│   └── recompute-scores.ts     → Batch score recalculation
└── supabase/
    └── schema.sql              → Full database DDL

SUPABASE (PostgreSQL)
├── alerts              → Primary intelligence items
├── vendors             → AI vendor profiles + guardrail tracking
├── frameworks          → Governance frameworks and regulations
├── feed_sources        → RSS/scrape source configuration
├── timeline_events     → Regulatory milestones
├── audit_log           → Cron run history and data changes
└── ingested_urls       → SHA-256 deduplication index

DATA FLOW
  Vercel Cron (06:00, 18:00 UTC)
    → /api/cron/refresh
    → lib/ingestion/engine.ts
    → For each active feed_source:
       → RSS parse (rss-parser) OR web scrape (cheerio)
       → Keyword detection (severity, category, vendor, tags)
       → Dedup check (SHA-256 of normalized URL)
       → Insert to alerts table
       → PostgreSQL trigger computes priority_score
    → Mark items > 7 days old as not new
    → Write audit_log entry
```

## File Structure

```
ai-governance-observatory/
├── CLAUDE.md                         ← YOU ARE HERE
├── README.md                         ← Project overview + deployment guide
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── vercel.json                       ← Cron schedule config
├── .env.local                        ← Local env vars (gitignored)
├── .env.template                     ← Env var reference
│
├── app/
│   ├── layout.tsx                    ← Root layout, fonts, metadata
│   ├── page.tsx                      ← Main dashboard page
│   ├── globals.css                   ← Tailwind v4 imports + CSS vars
│   └── api/
│       ├── cron/
│       │   └── refresh/
│       │       └── route.ts          ← Cron endpoint (GET, auth required)
│       ├── alerts/
│       │   └── route.ts              ← GET alerts with filters
│       ├── vendors/
│       │   └── route.ts              ← GET vendor profiles
│       ├── frameworks/
│       │   └── route.ts              ← GET frameworks
│       └── health/
│           └── route.ts              ← System health check
│
├── components/
│   ├── dashboard/
│   │   ├── CommandCenter.tsx         ← Main dashboard view
│   │   ├── IntelligenceFeed.tsx      ← Alert list with filters
│   │   ├── VendorMatrix.tsx          ← Vendor comparison view
│   │   ├── FrameworksView.tsx        ← Frameworks table
│   │   ├── TimelineView.tsx          ← Regulatory timeline
│   │   └── DataSourcesView.tsx       ← Feed source status
│   ├── ui/
│   │   ├── SeverityBadge.tsx
│   │   ├── MetricCard.tsx
│   │   ├── NavItem.tsx
│   │   ├── ChartTooltip.tsx
│   │   └── VendorBar.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── Header.tsx
│
├── lib/
│   ├── ingestion/
│   │   ├── engine.ts                 ← Core ingestion pipeline
│   │   ├── keywords.ts               ← Keyword dictionaries
│   │   ├── scoring.ts                ← JS-side scoring helpers
│   │   └── types.ts                  ← Shared TypeScript interfaces
│   ├── supabase/
│   │   ├── client.ts                 ← Browser client (anon key)
│   │   ├── admin.ts                  ← Server client (service role)
│   │   └── types.ts                  ← Generated DB types
│   └── utils/
│       ├── dates.ts                  ← Date formatting helpers
│       └── constants.ts              ← Enums, colors, category maps
│
├── scripts/
│   ├── seed.ts                       ← Seed feed sources, vendors, frameworks, timeline
│   └── recompute-scores.ts           ← Batch recompute priority_score for all alerts
│
├── supabase/
│   ├── schema.sql                    ← Full DDL: tables, enums, functions, triggers, RLS, views
│   └── migrations/                   ← Incremental migrations (if using Supabase CLI)
│
└── public/
    └── favicon.ico
```

## Technology Decisions

### Stack Rationale

| Choice | Reason |
|--------|--------|
| Next.js 14 App Router | SSR for SEO, API routes colocated, Vercel native deployment |
| Supabase | Free PostgreSQL with RLS, realtime subscriptions, auto-generated API |
| Tailwind v4 | CSS-first config, no PostCSS dependency, bleeding edge |
| Recharts | Composable React charts, no D3 dependency overhead |
| Lucide | Tree-shakeable icon set, matches design system |
| rss-parser | Lightweight RSS/Atom parser, no native dependencies |
| cheerio | Server-side HTML parsing for scraping, jQuery-like API |
| Vercel Cron | Free on Hobby plan, native integration, no external scheduler |

### What We Do NOT Use (and Why)

| Avoided | Reason |
|---------|--------|
| Paid APIs (NewsAPI, etc.) | Zero-cost constraint. All data via RSS/scrape |
| OpenAI/Anthropic API calls | No AI-in-the-loop for ingestion. Keyword engine only |
| Prisma | Supabase client handles queries. No ORM overhead needed |
| tRPC | Overkill for read-heavy public dashboard |
| NextAuth | No user auth in v1. Public read access. Service role for writes |
| Redis/Upstash | Supabase handles caching needs. Add KV later if needed |

## Database Schema

### Tables

**alerts** — Primary intelligence items
- `id` UUID PK
- `severity` ENUM: critical, high, medium, low, info
- `category` ENUM: regulatory, vendor_guardrails, frameworks, safety_research, enforcement, standards
- `title` TEXT NOT NULL
- `summary` TEXT NOT NULL
- `full_content` TEXT (optional long form)
- `source_name` TEXT NOT NULL
- `source_url` TEXT
- `vendor` TEXT (NULL if not vendor-specific)
- `is_new` BOOLEAN (auto-false after 7 days)
- `is_pinned` BOOLEAN
- `priority_score` INTEGER 0-100 (auto-computed by trigger)
- `tags` TEXT[]
- `raw_data` JSONB
- `published_at` TIMESTAMPTZ
- `ingested_at` TIMESTAMPTZ
- `reviewed_at` TIMESTAMPTZ

**vendors** — AI vendor profiles
- `name` TEXT UNIQUE (slug: openai, anthropic, etc.)
- `display_name` TEXT
- `models` TEXT
- `color` TEXT (hex brand color)
- `safety_policy`, `red_teaming`, `content_filtering`, `bias_audits`, `incident_response`, `military_use`, `agentic_controls` TEXT
- `transparency_score` INTEGER 0-100
- `risk_level` ENUM: critical, high, medium, low
- `last_guardrail_change` TIMESTAMPTZ

**frameworks** — Governance frameworks and regulations
- `name` TEXT UNIQUE
- `status` ENUM: active, phased_enforcement, enacted, proposed, in_force, deprecated
- `jurisdiction` TEXT
- `framework_type` ENUM: mandatory, voluntary, certifiable
- `pillars` TEXT[]
- `key_dates` JSONB
- `last_updated` DATE

**feed_sources** — Ingestion source config
- `name` TEXT UNIQUE
- `feed_type` ENUM: rss, scrape, api
- `url` TEXT
- `scrape_selector` TEXT (CSS selector for cheerio)
- `status` ENUM: active, paused, error
- `frequency_hours` INTEGER
- `default_category` / `default_severity` — fallbacks if keyword engine finds nothing
- `last_fetched_at`, `last_error`, `error_count`, `items_ingested`

**timeline_events** — Regulatory milestones
- `event_date` DATE
- `label` TEXT
- `event_type` ENUM: regulatory, vendor, standards, frameworks, enforcement
- `is_upcoming` BOOLEAN (generated column: event_date > CURRENT_DATE)

**audit_log** — Operational telemetry
- `action` TEXT (cron_run, alert_created, vendor_updated, etc.)
- `details` JSONB
- `items_processed`, `items_created`, `errors` INTEGER
- `duration_ms` INTEGER

**ingested_urls** — Deduplication index
- `url_hash` TEXT PK (SHA-256)
- `url` TEXT
- `source_id` UUID FK
- `first_seen`, `last_seen` TIMESTAMPTZ

### Key Database Functions

**compute_priority_score(severity, category, is_new, published_at)** → INTEGER
- Severity base: critical=90, high=70, medium=45, low=20, info=5
- Category boost: enforcement=+10, regulatory=+8, vendor_guardrails=+7, safety_research=+5, frameworks=+3, standards=+2
- Recency decay: <24h=0, 24-72h=-5, 3-7d=-10, >7d=-20
- New item boost: +5
- Clamped to 0-100

**auto_compute_priority()** — BEFORE INSERT OR UPDATE trigger on alerts. Calls compute_priority_score automatically.

**update_updated_at()** — BEFORE UPDATE trigger on all tables with updated_at column.

### Row Level Security

- All content tables: public SELECT (no auth required for reads)
- All writes: service_role only (cron jobs use SUPABASE_SERVICE_ROLE_KEY)
- No user authentication in v1

### Views

- `v_dashboard_alerts` — Top 20 alerts with priority_score >= 40
- `v_critical_alerts` — All critical severity alerts, newest first
- `v_vendor_risk_summary` — Vendor profiles sorted by risk level
- `v_feed_health` — Feed status with computed health_status (OK/STALE/ERROR)

## Ingestion Engine

### Pipeline Flow

```
For each active feed_source:
  1. Fetch content
     - RSS: rss-parser.parseURL(url)
     - Scrape: fetch(url) → cheerio.load(html) → $(selector).each()
  2. For each item:
     a. Clean text (strip HTML, normalize whitespace, cap at 2000 chars)
     b. Detect severity via keyword matching (GOVERNANCE_KEYWORDS dict)
     c. Detect vendor via keyword matching (VENDOR_KEYWORDS dict)
     d. Detect category via keyword scoring (CATEGORY_KEYWORDS dict)
     e. Extract tags (framework names, topic keywords)
     f. Dedup check: SHA-256(normalized_url) against ingested_urls
     g. If new: INSERT into alerts (trigger auto-computes priority_score)
  3. Update feed_source: last_fetched_at, items_ingested, error status
  4. After all feeds: mark alerts > 7 days old as is_new = false
  5. Write audit_log entry with full results
```

### Keyword Dictionaries

**Severity keywords** (first match wins, checked in order):
- `critical`: banned, prohibited, emergency, breach, violation, enforcement action, blacklisted, shutdown, autonomous weapons, mass surveillance, defense production act
- `high`: regulation, mandatory, compliance deadline, penalty, guardrail, safety policy, red line, executive order, eu ai act, responsible scaling
- `medium`: framework, guideline, standard, nist, iso 42001, risk management, governance, transparency, bias audit, model card
- `low`: research, paper, study, report, survey, recommendation, benchmark

**Vendor keywords**: Each vendor has 4-7 trigger terms (company name, model names, CEO names, product names)

**Category keywords**: 8-12 terms per category, scored by match count. Highest score wins. Falls back to feed_source.default_category.

### Scraping Rules

- User-Agent: `AIGovernanceObservatory/1.0 (+https://governance.omnicoreinc.com)`
- Timeout: 15s for RSS, 20s for scrape
- Rate limiting: 2 second delay between feeds
- Error handling: 5 consecutive errors → feed status set to "error"
- Default CSS selector: `article, .post, .entry, .news-item`
- Per-source selectors stored in feed_sources.scrape_selector

## Frontend Architecture

### Design System

| Token | Value |
|-------|-------|
| --bg | #09090B |
| --surface-0 | #0F0F12 |
| --surface-1 | rgba(255,255,255,0.025) |
| --surface-2 | #18181B |
| --accent | #38BDF8 (sky blue) |
| --text-0 | #FAFAFA (headings) |
| --text-1 | #D4D4D8 (body) |
| --text-2 | #A1A1AA (secondary) |
| --text-3 | #71717A (labels, meta) |
| --border | rgba(255,255,255,0.06) |
| --display | DM Sans |
| --body | DM Sans |
| --mono | IBM Plex Mono |
| --radius | 10px |

### Severity Color System

| Level | Color | Use |
|-------|-------|-----|
| critical | #EF4444 | Pulsing dot, red glow, left border accent |
| high | #F59E0B | Amber warning indicators |
| medium | #3B82F6 | Blue informational |
| low | #10B981 | Green, safe status |
| info | #6B7280 | Gray, neutral |

### Category Color System

| Category | Color | Icon |
|----------|-------|------|
| regulatory | #F59E0B | Scale |
| vendor_guardrails | #8B5CF6 | Shield |
| frameworks | #3B82F6 | Layers |
| safety_research | #EC4899 | Eye |
| enforcement | #EF4444 | AlertCircle |
| standards | #10B981 | FileText |

### Views (6 tabs via sidebar navigation)

1. **Command Center** — Metric cards, critical alert banner, severity donut chart, 6-month area trend chart, category bar chart, priority feed list, vendor guardrail strength bars
2. **Intelligence Feed** — Full alert list with search, severity filter, category filter, new-only toggle. Expandable rows with detail view. Priority score badges.
3. **Vendor Matrix** — Transparency vs. guardrails grouped bar chart, military AI posture panel with lock/unlock icons, individual vendor cards with progress bars
4. **Frameworks** — Table grid: framework name, status badge, jurisdiction, type (mandatory highlighted), updated date, pillar tags
5. **Timeline** — Vertical timeline with icon-coded milestones, past/upcoming state, color-coded by event type
6. **Data Sources** — Feed source cards with type (RSS/Scrape) badges, frequency, health status. Architecture panel.

### Chart Library (Recharts)

All charts use custom tooltip component (ChartTooltipContent) with dark theme styling. Available chart types in use:
- PieChart (severity distribution, donut style)
- AreaChart (6-month trend with gradient fills)
- BarChart horizontal (category breakdown)
- BarChart vertical grouped (vendor transparency vs. guardrails)

## Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/refresh",
      "schedule": "0 6,18 * * *"
    }
  ]
}
```

- Runs at 06:00 UTC and 18:00 UTC daily
- Max duration: 300 seconds (5 minutes)
- Auth: Bearer token via CRON_SECRET (Vercel auto-sets) OR x-api-key header for manual triggers
- Endpoint: GET /api/cron/refresh

## Environment Variables

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Yes | Client + Server | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Client | Supabase anon/public key (read only) |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Server only | Supabase service role key (full write access) |
| CRON_SECRET | Yes | Server only | Vercel auto-generated cron auth token |
| ADMIN_API_KEY | Yes | Server only | Manual cron trigger auth key |

**NEVER expose SUPABASE_SERVICE_ROLE_KEY or ADMIN_API_KEY to the client.** These are server-only. Use NEXT_PUBLIC_ prefix only for values safe to expose in browser.

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Push schema to Supabase
npm run db:push

# Seed initial data (feed sources, vendors, frameworks, timeline)
npm run db:seed

# Manual cron trigger (local)
npm run cron:refresh

# Recompute all priority scores
npm run cron:score

# Lint
npm run lint
```

## Data Sources (16 feeds)

### Government and Standards
| Source | Type | Frequency |
|--------|------|-----------|
| NIST AI News | RSS | 12h |
| EU AI Act Service Desk | Scrape | 12h |
| OECD AI Policy Observatory | RSS | 12h |

### Research and Advocacy
| Source | Type | Frequency |
|--------|------|-----------|
| Partnership on AI | Scrape | 12h |
| Future of Life Institute | RSS | 12h |
| Center for AI Safety | Scrape | 24h |
| CSA AI Research | Scrape | 24h |

### Vendor Blogs
| Source | Type | Frequency |
|--------|------|-----------|
| OpenAI Blog | Scrape | 6h |
| Anthropic Research | RSS | 6h |
| Google DeepMind Blog | RSS | 12h |
| Meta AI Blog | Scrape | 12h |
| Microsoft AI Blog | RSS | 12h |

### News and Analysis
| Source | Type | Frequency |
|--------|------|-----------|
| Axios AI | RSS | 6h |
| Lawfare (AI) | RSS | 12h |
| Brookings AI | RSS | 12h |
| CISA Advisories | RSS | 6h |

## Vendors Tracked (6)

| Vendor | Risk Level | Guardrails Score | Military Posture |
|--------|-----------|------------------|------------------|
| OpenAI | medium | 72 | Permitted (DoD deal) |
| Anthropic | low | 88 | Restricted (refused DoD expansion) |
| Google DeepMind | medium | 70 | Selective |
| Meta AI | high | 45 | Unrestricted (open weight) |
| Microsoft | medium | 68 | Full DoD partnership |
| xAI | high | 22 | DoD contract |

## Frameworks Tracked (9)

NIST AI RMF 2.0, EU AI Act, ISO/IEC 42001, Colorado AI Act, California SB 53, OECD AI Principles, Hiroshima AI Process, NYC Local Law 144, NAIC Model Bulletin

## Coding Conventions

### TypeScript
- Strict mode enabled
- All interfaces in dedicated `types.ts` files per module
- Use `Record<string, unknown>` over `any` for JSON blobs
- Explicit return types on all exported functions
- Prefer `const` assertions for literal objects

### File Naming
- Components: PascalCase (`SeverityBadge.tsx`)
- Utilities/lib: camelCase (`engine.ts`, `keywords.ts`)
- API routes: `route.ts` inside folder structure (`app/api/alerts/route.ts`)
- Scripts: kebab-case (`recompute-scores.ts`)

### Imports
- Absolute imports via `@/` alias (maps to project root)
- Group order: react → next → external libs → internal libs → components → types
- Named imports only, no default imports from libraries

### Component Patterns
- Functional components with explicit props interfaces
- Inline styles using CSS variables from design system (no Tailwind in artifact mode, Tailwind in deployed app)
- State management: React useState/useEffect only. No global state library in v1
- Charts: Recharts with custom tooltip component. Always use ResponsiveContainer wrapper

### API Routes (Next.js App Router)
- All routes export named HTTP method functions: `export async function GET(request: NextRequest)`
- Always return `NextResponse.json()`
- Cron routes: verify auth header before processing
- Error responses: `{ status: "error", message: string }` with appropriate HTTP status code

### Database
- All writes go through SUPABASE_SERVICE_ROLE_KEY (server-side only)
- All reads use NEXT_PUBLIC_SUPABASE_ANON_KEY (client-safe)
- Upsert on name column for idempotent seed operations
- Always check for Supabase error object after operations

### Supabase Queries
```typescript
// Read pattern (client-side safe)
const { data, error } = await supabase
  .from("alerts")
  .select("*")
  .eq("severity", "critical")
  .order("priority_score", { ascending: false })
  .limit(20);

// Write pattern (server-side only, service role)
const { error } = await supabase
  .from("alerts")
  .insert({ ...alertData });
```

### Error Handling
- try/catch around all async operations
- Log errors with `console.error("[MODULE] context:", error)`
- Feed errors: increment error_count, set status to "error" after 5 failures
- API routes: always return structured error response, never throw unhandled

## Adding a New Feed Source

1. Add entry to `scripts/seed.ts` feedSources array:
```typescript
{
  name: "New Source Name",
  feed_type: "rss" | "scrape",
  url: "https://example.com/feed",
  scrape_selector: ".article-card",  // only for scrape type
  default_category: "regulatory",
  default_severity: "medium",
  frequency_hours: 12,
}
```

2. Run seed: `npm run db:seed`

3. If scraping, verify CSS selector captures article titles and summaries. Test with:
```bash
curl -s "https://example.com/feed" | npx cheerio-cli ".article-card h2"
```

4. Add any new keywords to `lib/ingestion/keywords.ts` if the source covers topics not yet in the dictionaries.

## Adding a New Vendor

1. Add to `scripts/seed.ts` vendors array with all guardrail fields
2. Add vendor keywords to `VENDOR_KEYWORDS` in `lib/ingestion/keywords.ts`
3. Add vendor to `VENDORS_DATA` in the frontend dashboard component
4. Run seed: `npm run db:seed`

## Adding a New Framework

1. Add to `scripts/seed.ts` frameworks array
2. Add to `FRAMEWORKS` in the frontend dashboard component
3. Add relevant timeline events to timelineEvents array
4. Run seed: `npm run db:seed`

## Deployment Checklist

1. Create Supabase project at supabase.com
2. Run `supabase/schema.sql` against the database
3. Set environment variables in Vercel dashboard
4. Run `npm run db:seed` to populate reference data
5. Deploy to Vercel: `vercel deploy --prod`
6. Verify cron: `curl -H "x-api-key: $ADMIN_API_KEY" https://your-app.vercel.app/api/cron/refresh`
7. Monitor audit_log table for cron run results

## Operational Notes

### Monitoring
- Check `v_feed_health` view for stale or errored feeds
- Check `audit_log` for cron run history (items_created, errors, duration)
- Critical alerts auto-surface on Command Center dashboard (score >= 40)

### Manual Intervention
- To force-refresh a single feed: update `last_fetched_at` to NULL in feed_sources, then trigger cron
- To pin an alert to top: set `is_pinned = true` in alerts table
- To re-score all alerts: `npm run cron:score`
- To reset a feed error state: update `status = 'active'`, `error_count = 0` in feed_sources

### Performance
- Cron processes feeds sequentially with 2s delay between feeds (respectful scraping)
- Max cron duration: 300s. If 16 feeds take too long, split into two cron jobs
- Supabase free tier: 500MB storage, 2GB transfer. Monitor via Supabase dashboard
- Dedup table grows indefinitely. Consider pruning ingested_urls older than 90 days

## Roadmap (Ordered by Priority)

### v1.1 — Notifications
- [ ] Email digest for critical alerts (Resend free tier, 100 emails/day)
- [ ] Slack webhook for new critical items
- [ ] RSS output feed for external subscribers

### v1.2 — Search and Personalization
- [ ] Full-text search via pg_trgm (already enabled in schema)
- [ ] User bookmarks and notes (add Supabase Auth)
- [ ] Alert dismissal / acknowledge tracking

### v1.3 — Reporting
- [ ] Weekly executive PDF report generation
- [ ] Vendor guardrail change detection (diff engine comparing snapshots)
- [ ] Framework compliance gap analysis tool

### v1.4 — Scale
- [ ] Move to Supabase Pro if storage exceeds 500MB
- [ ] Add Vercel KV for caching hot queries
- [ ] Implement Supabase Realtime for live dashboard updates
- [ ] API rate limiting for public endpoints

### v2.0 — Intelligence Layer
- [ ] AI-powered summarization of scraped articles (Claude API, optional paid feature)
- [ ] Automated vendor guardrail change detection via content diffing
- [ ] Predictive scoring: which frameworks are likely to become mandatory next
- [ ] Integration with CyberTTX for governance scenario exercises

## Security Considerations

- No user PII stored anywhere in v1
- All writes require service_role key (never exposed to client)
- Cron endpoint protected by CRON_SECRET + ADMIN_API_KEY
- RLS enabled on all tables
- Scraper user-agent identifies the project (responsible disclosure)
- No authentication bypass: public reads only, writes locked to service role
- SUPABASE_SERVICE_ROLE_KEY must never appear in client bundles or logs

## Testing Strategy

### Manual Testing
- Trigger cron via curl and verify audit_log entry
- Check feed_sources.last_fetched_at updated after cron run
- Verify new alerts appear with correct severity, category, vendor, tags
- Confirm dedup: run cron twice, second run should show items_skipped > 0
- Test each dashboard tab renders correctly with current data

### Automated (Future)
- Unit tests for keyword detection engine (vitest)
- Unit tests for priority scoring function
- Integration tests for ingestion pipeline with mock RSS feeds
- E2E tests for dashboard views (Playwright)

## Troubleshooting

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| Cron returns 401 | Missing or wrong CRON_SECRET | Verify env var in Vercel dashboard |
| Feed stuck in "error" | 5+ consecutive failures | Fix URL/selector, reset status and error_count |
| No new alerts after cron | All items deduplicated | Check ingested_urls table, verify feed has new content |
| Priority scores all 0 | Trigger not firing | Re-run schema.sql to recreate auto_compute_priority trigger |
| Dashboard charts empty | No data in Supabase | Run seed script, then trigger cron |
| Scrape returns 0 items | Wrong CSS selector | Inspect target page, update scrape_selector in feed_sources |
| Cron timeout (>300s) | Too many feeds or slow sources | Increase timeout or split into two cron endpoints |

## Contact

Victor Perez — Director of Cybersecurity
Omnicore Inc.
