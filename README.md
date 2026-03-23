# AI Governance Observatory

Real-time AI governance intelligence platform tracking regulations, vendor guardrails, safety frameworks, and enforcement actions across all major AI providers.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Hosting + Cron)                   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Next.js 14   │  │  API Routes  │  │  Vercel Cron     │  │
│  │  Dashboard UI │  │  /api/cron/* │  │  06:00, 18:00 UTC│  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   SUPABASE      │
                    │   PostgreSQL    │
                    │   + RLS + Auth  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────┴───┐  ┌──────┴──────┐  ┌───┴────────┐
     │ alerts     │  │ vendors     │  │ frameworks │
     │ feed_src   │  │ timeline    │  │ audit_log  │
     │ dedup      │  │             │  │            │
     └────────────┘  └─────────────┘  └────────────┘
              │
    ┌─────────┴─────────────────────────────┐
    │       INGESTION ENGINE                │
    │                                       │
    │  ┌───────────┐  ┌──────────────────┐  │
    │  │ RSS Parser │  │ Cheerio Scraper │  │
    │  │ (rss-parser)│ │ (cheerio)       │  │
    │  └───────────┘  └──────────────────┘  │
    │                                       │
    │  ┌──────────────────────────────────┐  │
    │  │ Keyword Detection Engine        │  │
    │  │  - Severity scoring             │  │
    │  │  - Category classification      │  │
    │  │  - Vendor identification        │  │
    │  │  - Tag extraction               │  │
    │  └──────────────────────────────────┘  │
    │                                       │
    │  ┌──────────────────────────────────┐  │
    │  │ Priority Scoring (PostgreSQL fn) │  │
    │  │  - Severity base (5-90)         │  │
    │  │  - Category boost (+2 to +10)   │  │
    │  │  - Recency decay (-5 to -20)    │  │
    │  │  - New item boost (+5)          │  │
    │  └──────────────────────────────────┘  │
    └───────────────────────────────────────┘
              │
    ┌─────────┴──────────────────────────────┐
    │         PUBLIC DATA SOURCES             │
    │  (Zero API cost - RSS/Scrape only)     │
    │                                        │
    │  Government:    NIST, EU AI Act, OECD  │
    │  Research:      FLI, PAI, CAIS, CSA    │
    │  Vendor Blogs:  OpenAI, Anthropic,     │
    │                 Google, Meta, Microsoft │
    │  News:          Axios, Lawfare,        │
    │                 Brookings, CISA        │
    └────────────────────────────────────────┘
```

## Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| Frontend | Next.js 14 + React 18 + Tailwind v4 | Free (Vercel Hobby) |
| Backend | Supabase PostgreSQL + RLS | Free tier (500MB) |
| Cron | Vercel Cron (2x daily) | Free (Hobby plan) |
| Ingestion | RSS Parser + Cheerio | $0 (no paid APIs) |
| Hosting | Vercel | Free (Hobby plan) |

**Total operational cost: $0/month** on free tiers.

## Priority Scoring Logic

Items are scored 0-100 automatically on insert/update:

| Factor | Points |
|--------|--------|
| Severity: Critical | 90 base |
| Severity: High | 70 base |
| Severity: Medium | 45 base |
| Severity: Low | 20 base |
| Category: Enforcement | +10 |
| Category: Regulatory | +8 |
| Category: Vendor Guardrails | +7 |
| Category: Safety Research | +5 |
| Recency: < 24h | No decay |
| Recency: 24-72h | -5 |
| Recency: 3-7d | -10 |
| Recency: > 7d | -20 |
| New item flag | +5 |

Items scoring >= 40 appear on the Command Center dashboard.

## Deployment

### 1. Supabase Setup

```bash
# Create project at supabase.com
# Run schema migration
psql $DATABASE_URL < supabase/schema.sql
```

### 2. Environment Variables

```bash
cp .env.template .env.local
# Fill in Supabase URL, anon key, service role key
```

### 3. Seed Data

```bash
npx tsx scripts/seed.ts
```

### 4. Deploy to Vercel

```bash
vercel deploy
# Set environment variables in Vercel dashboard
# Cron jobs auto-configure from vercel.json
```

### 5. Verify Cron

```bash
# Manual trigger
curl -H "x-api-key: YOUR_ADMIN_KEY" https://your-app.vercel.app/api/cron/refresh
```

## Data Sources (16 feeds, all free)

| Source | Type | Frequency | Category |
|--------|------|-----------|----------|
| NIST AI News | RSS | 12h | Standards |
| EU AI Act Service Desk | Scrape | 12h | Regulatory |
| OECD AI Policy | RSS | 12h | Frameworks |
| Partnership on AI | Scrape | 12h | Frameworks |
| Future of Life Institute | RSS | 12h | Safety Research |
| Center for AI Safety | Scrape | 24h | Safety Research |
| CSA AI Research | Scrape | 24h | Frameworks |
| OpenAI Blog | Scrape | 6h | Vendor Guardrails |
| Anthropic Research | RSS | 6h | Vendor Guardrails |
| Google DeepMind Blog | RSS | 12h | Vendor Guardrails |
| Meta AI Blog | Scrape | 12h | Vendor Guardrails |
| Microsoft AI Blog | RSS | 12h | Vendor Guardrails |
| Axios AI | RSS | 6h | Regulatory |
| Lawfare AI | RSS | 12h | Enforcement |
| Brookings AI | RSS | 12h | Frameworks |
| CISA Advisories | RSS | 6h | Enforcement |

## File Structure

```
ai-governance-observatory/
├── app/
│   ├── api/
│   │   └── cron/
│   │       └── refresh/
│   │           └── route.ts          # Vercel Cron endpoint
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Dashboard page
├── lib/
│   └── ingestion/
│       └── engine.ts                 # RSS/scrape ingestion engine
├── scripts/
│   └── seed.ts                       # Database seed script
├── supabase/
│   └── schema.sql                    # Full database schema + functions
├── .env.template                     # Environment variable template
├── package.json
├── vercel.json                       # Cron schedule config
└── README.md
```

## Target Audience

- **Executives / C-Suite**: Command Center dashboard with critical alerts
- **IT Directors / CISOs**: Vendor guardrail matrix, framework tracking
- **Compliance / GRC Teams**: Regulatory timeline, enforcement actions
- **Security Architects**: Standards updates, vendor safety policies

## Keyword Detection

The ingestion engine uses keyword matching to automatically:

1. **Score severity** (critical/high/medium/low) based on terms like "banned," "enforcement action," "framework," "research"
2. **Identify vendors** (OpenAI, Anthropic, Google, etc.) from content
3. **Classify categories** (regulatory, vendor_guardrails, frameworks, safety_research, enforcement, standards)
4. **Extract tags** for filtering (EU AI Act, NIST, Autonomous Weapons, Agentic AI, etc.)

## Future Enhancements

- [ ] Email digest for critical alerts (Resend, free tier)
- [ ] Slack webhook integration for new critical items
- [ ] Executive PDF report generation (weekly)
- [ ] Vendor guardrail change detection (diff engine)
- [ ] Full-text search with Supabase pg_trgm
- [ ] User bookmarks and notes (auth layer)
- [ ] API endpoint for external consumption
- [ ] RSS feed output for subscribers
