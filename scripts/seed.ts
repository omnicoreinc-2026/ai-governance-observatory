// =============================================================================
// AI GOVERNANCE OBSERVATORY - SEED SCRIPT
// scripts/seed.ts
//
// Run: npx tsx scripts/seed.ts
// Populates feed sources, vendor profiles, frameworks, and timeline events.
// =============================================================================

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// FEED SOURCES
// =============================================================================

const feedSources = [
  // Government and Standards Bodies
  {
    name: "NIST AI News",
    feed_type: "rss",
    url: "https://www.nist.gov/news-events/news/rss.xml",
    default_category: "standards",
    default_severity: "medium",
    frequency_hours: 12,
  },
  {
    name: "EU AI Act Service Desk",
    feed_type: "scrape",
    url: "https://artificialintelligenceact.eu/latest-updates/",
    scrape_selector: "article, .post",
    default_category: "regulatory",
    default_severity: "high",
    frequency_hours: 12,
  },
  {
    name: "OECD AI Policy Observatory",
    feed_type: "rss",
    url: "https://oecd.ai/en/feed",
    default_category: "frameworks",
    default_severity: "medium",
    frequency_hours: 12,
  },
  // Research and Advocacy
  {
    name: "Partnership on AI",
    feed_type: "scrape",
    url: "https://partnershiponai.org/news/",
    scrape_selector: ".news-card, article",
    default_category: "frameworks",
    default_severity: "medium",
    frequency_hours: 12,
  },
  {
    name: "Future of Life Institute",
    feed_type: "rss",
    url: "https://futureoflife.org/feed/",
    default_category: "safety_research",
    default_severity: "medium",
    frequency_hours: 12,
  },
  {
    name: "Center for AI Safety",
    feed_type: "scrape",
    url: "https://www.safe.ai/blog",
    scrape_selector: "article, .blog-post",
    default_category: "safety_research",
    default_severity: "medium",
    frequency_hours: 24,
  },
  {
    name: "CSA AI Research",
    feed_type: "scrape",
    url: "https://cloudsecurityalliance.org/research/ai/",
    scrape_selector: ".resource-card, article",
    default_category: "frameworks",
    default_severity: "medium",
    frequency_hours: 24,
  },
  // Vendor Blogs
  {
    name: "OpenAI Blog",
    feed_type: "scrape",
    url: "https://openai.com/blog",
    scrape_selector: "article, [class*='post'], [class*='card']",
    default_category: "vendor_guardrails",
    default_severity: "medium",
    frequency_hours: 6,
  },
  {
    name: "Anthropic Research",
    feed_type: "rss",
    url: "https://www.anthropic.com/feed.xml",
    default_category: "vendor_guardrails",
    default_severity: "medium",
    frequency_hours: 6,
  },
  {
    name: "Google DeepMind Blog",
    feed_type: "rss",
    url: "https://deepmind.google/blog/rss.xml",
    default_category: "vendor_guardrails",
    default_severity: "medium",
    frequency_hours: 12,
  },
  {
    name: "Meta AI Blog",
    feed_type: "scrape",
    url: "https://ai.meta.com/blog/",
    scrape_selector: "article, .blog-post",
    default_category: "vendor_guardrails",
    default_severity: "medium",
    frequency_hours: 12,
  },
  {
    name: "Microsoft AI Blog",
    feed_type: "rss",
    url: "https://blogs.microsoft.com/ai/feed/",
    default_category: "vendor_guardrails",
    default_severity: "medium",
    frequency_hours: 12,
  },
  // News and Analysis
  {
    name: "Axios AI",
    feed_type: "rss",
    url: "https://api.axios.com/feed/",
    default_category: "regulatory",
    default_severity: "medium",
    frequency_hours: 6,
  },
  {
    name: "Lawfare AI",
    feed_type: "rss",
    url: "https://www.lawfaremedia.org/feed",
    default_category: "enforcement",
    default_severity: "medium",
    frequency_hours: 12,
  },
  {
    name: "Brookings AI",
    feed_type: "rss",
    url: "https://www.brookings.edu/topic/artificial-intelligence/feed/",
    default_category: "frameworks",
    default_severity: "low",
    frequency_hours: 12,
  },
  {
    name: "CISA Advisories",
    feed_type: "rss",
    url: "https://www.cisa.gov/news.xml",
    default_category: "enforcement",
    default_severity: "medium",
    frequency_hours: 6,
  },
];

// =============================================================================
// VENDORS
// =============================================================================

const vendors = [
  {
    name: "OpenAI",
    display_name: "OpenAI",
    models: "GPT-5, o3, o4-mini, DALL-E 4",
    color: "#10A37F",
    safety_policy: "Usage Policy + Model Spec",
    red_teaming: "Internal + External red teaming",
    content_filtering: "Multi-layer moderation API",
    bias_audits: "Published model cards with evaluations",
    incident_response: "Bug bounty program + rapid response team",
    military_use: "Permitted (amended DoD deal, Feb 2026)",
    agentic_controls: "Operator controls for tool use, agent safety layers",
    transparency_score: 65,
    risk_level: "medium",
  },
  {
    name: "Anthropic",
    display_name: "Anthropic",
    models: "Claude 4.6 Opus, Claude 4.6 Sonnet, Claude Haiku 4.5",
    color: "#D4A574",
    safety_policy: "Frontier Safety Roadmap (replaced RSP Feb 2026)",
    red_teaming: "Internal + External + ASL capability evaluations",
    content_filtering: "Constitutional AI + layered system prompts",
    bias_audits: "Published safety evaluations and model cards",
    incident_response: "Responsible disclosure program",
    military_use: "Restricted (refused DoD any-lawful-use expansion, Feb 2026)",
    agentic_controls: "Tool use safety layers, MCP protocol integration",
    transparency_score: 78,
    risk_level: "low",
  },
  {
    name: "Google DeepMind",
    display_name: "Google DeepMind",
    models: "Gemini 2.5 Pro, Gemini 2.5 Flash",
    color: "#4285F4",
    safety_policy: "Frontier Safety Framework",
    red_teaming: "Internal DeepMind safety team + external evaluators",
    content_filtering: "Safety filters and classifiers",
    bias_audits: "Model cards with evaluation results",
    incident_response: "Google security response team",
    military_use: "Selective DoD engagement (Project Maven history)",
    agentic_controls: "Gemini agent safety controls",
    transparency_score: 60,
    risk_level: "medium",
  },
  {
    name: "Meta AI",
    display_name: "Meta AI",
    models: "Llama 4, Llama 4 Scout/Maverick",
    color: "#0668E1",
    safety_policy: "Responsible Use Guide (open weight)",
    red_teaming: "Purple Llama toolkit + external red teaming",
    content_filtering: "Llama Guard safety classifier",
    bias_audits: "Published in model cards",
    incident_response: "Community reporting mechanisms",
    military_use: "Not restricted for open weight models",
    agentic_controls: "Limited agent-specific safety controls",
    transparency_score: 55,
    risk_level: "high",
  },
  {
    name: "Microsoft",
    display_name: "Microsoft",
    models: "Copilot, Azure AI, Azure OpenAI Service",
    color: "#00BCF2",
    safety_policy: "Responsible AI Standard v3",
    red_teaming: "AI Red Team (AIRT) dedicated unit",
    content_filtering: "Azure AI Content Safety service",
    bias_audits: "Fairlearn + HAX toolkit",
    incident_response: "MSRC integration for AI incidents",
    military_use: "Full DoD partnership",
    agentic_controls: "Copilot Studio guardrails and DLP integration",
    transparency_score: 62,
    risk_level: "medium",
  },
  {
    name: "xAI",
    display_name: "xAI",
    models: "Grok 3, Grok 3 Mini",
    color: "#1DA1F2",
    safety_policy: "Minimal published safety policy",
    red_teaming: "Limited public transparency on testing",
    content_filtering: "Basic content moderation",
    bias_audits: "Not publicly published",
    incident_response: "Unknown/unpublished",
    military_use: "DoD contract awarded (2025)",
    agentic_controls: "Grok agent features emerging",
    transparency_score: 20,
    risk_level: "high",
  },
  {
    name: "Mistral",
    display_name: "Mistral AI",
    models: "Mistral Large, Mistral Medium, Mistral Small, Codestral",
    color: "#FF7000",
    safety_policy: "Usage Policy + moderation guardrails",
    red_teaming: "Internal safety evaluations",
    content_filtering: "Moderation API and system-level guardrails",
    bias_audits: "Published model cards with benchmark results",
    incident_response: "Security contact and disclosure process",
    military_use: "No public DoD contracts; EU-based focus",
    agentic_controls: "Function calling safety layers",
    transparency_score: 50,
    risk_level: "medium",
  },
  {
    name: "DeepSeek",
    display_name: "DeepSeek",
    models: "DeepSeek-V3, DeepSeek-R1, DeepSeek-Coder-V2",
    color: "#4A6CF7",
    safety_policy: "Basic usage terms; limited public safety documentation",
    red_teaming: "Internal testing; limited external transparency",
    content_filtering: "Content moderation with Chinese regulatory compliance",
    bias_audits: "Benchmark results published; no independent bias audits",
    incident_response: "No published incident response program",
    military_use: "Subject to Chinese government directives",
    agentic_controls: "Limited agent-specific safety controls",
    transparency_score: 25,
    risk_level: "high",
  },
];

// =============================================================================
// FRAMEWORKS
// =============================================================================

const frameworks = [
  {
    name: "NIST AI RMF 2.0",
    short_name: "AI RMF",
    status: "active",
    jurisdiction: "US",
    framework_type: "voluntary",
    description:
      "Voluntary framework for managing AI risks. Four core functions: Govern, Map, Measure, Manage. Widely referenced by US regulators.",
    pillars: ["Govern", "Map", "Measure", "Manage"],
    key_dates: { released: "2024-02", gen_ai_profile: "2024-07" },
    last_updated: "2024-02-01",
  },
  {
    name: "EU AI Act",
    short_name: "AI Act",
    status: "phased_enforcement",
    jurisdiction: "EU",
    framework_type: "mandatory",
    description:
      "First comprehensive AI law. Risk-based classification system with phased enforcement through 2027.",
    pillars: [
      "Risk Classification",
      "Transparency",
      "Human Oversight",
      "Conformity Assessment",
    ],
    key_dates: {
      entered_force: "2024-08-01",
      prohibited_practices: "2025-02-02",
      gpai_rules: "2025-08-02",
      high_risk_annex_iii: "2026-08-02",
      full_enforcement: "2027-08-02",
    },
    last_updated: "2024-08-01",
  },
  {
    name: "ISO/IEC 42001",
    short_name: "ISO 42001",
    status: "active",
    jurisdiction: "Global",
    framework_type: "certifiable",
    description:
      "First international standard for AI management systems. Provides structured approach for ethical and transparent AI.",
    pillars: ["AI Management System", "Risk Treatment", "Performance Evaluation"],
    key_dates: { published: "2023-12" },
    last_updated: "2023-12-01",
  },
  {
    name: "Colorado AI Act",
    short_name: "CO AI Act",
    status: "enacted",
    jurisdiction: "US/State",
    framework_type: "mandatory",
    description:
      "State law requiring disclosure and impact assessments for high-risk AI in consequential decisions.",
    pillars: ["Disclosure", "Impact Assessment", "High-Risk AI"],
    key_dates: { enacted: "2024-05", effective: "2026-02-01" },
    last_updated: "2024-05-01",
  },
  {
    name: "California SB 53",
    short_name: "SB 53",
    status: "enacted",
    jurisdiction: "US/State",
    framework_type: "mandatory",
    description:
      "First frontier AI law requiring companies to publish safety testing results for their AI models.",
    pillars: ["Safety Testing Publication", "Frontier AI Transparency"],
    key_dates: { enacted: "2025-01" },
    last_updated: "2025-01-01",
  },
  {
    name: "OECD AI Principles",
    short_name: "OECD AI",
    status: "active",
    jurisdiction: "Global",
    framework_type: "voluntary",
    description:
      "International principles promoting responsible stewardship of trustworthy AI.",
    pillars: [
      "Inclusive Growth",
      "Human Values",
      "Transparency",
      "Robustness",
      "Accountability",
    ],
    key_dates: { adopted: "2019-05", updated: "2024-05" },
    last_updated: "2024-05-01",
  },
  {
    name: "Hiroshima AI Process (HAIP)",
    short_name: "HAIP",
    status: "active",
    jurisdiction: "G7",
    framework_type: "voluntary",
    description:
      "G7 framework with guiding principles and code of conduct for AI developers.",
    pillars: ["Guiding Principles", "Code of Conduct", "Interoperability"],
    key_dates: { established: "2023-05", framework: "2024-10" },
    last_updated: "2024-10-01",
  },
  {
    name: "NYC Local Law 144",
    short_name: "NYC LL144",
    status: "in_force",
    jurisdiction: "US/City",
    framework_type: "mandatory",
    description:
      "Requires bias audits for automated employment decision tools with public results.",
    pillars: ["Bias Audits", "Automated Hiring", "Published Results"],
    key_dates: { effective: "2023-07" },
    last_updated: "2023-07-01",
  },
  {
    name: "NAIC Model Bulletin on AI",
    short_name: "NAIC AI",
    status: "active",
    jurisdiction: "US/State",
    framework_type: "mandatory",
    description:
      "Adopted by 24 US states. Requires documented governance, bias controls, vendor oversight, and audit-ready decision logs for insurance AI.",
    pillars: [
      "Documented Governance",
      "Bias Controls",
      "Vendor Oversight",
      "Audit Logs",
    ],
    key_dates: { adopted_by_states: "2024-2025" },
    last_updated: "2025-01-01",
  },
];

// =============================================================================
// TIMELINE EVENTS
// =============================================================================

const timelineEvents = [
  { event_date: "2024-08-01", label: "EU AI Act enters force", event_type: "regulatory" },
  { event_date: "2025-02-02", label: "EU: Prohibited AI practices apply", event_type: "regulatory" },
  { event_date: "2025-07-01", label: "Anthropic signs $200M DoD contract", event_type: "vendor" },
  { event_date: "2025-08-02", label: "EU: General-purpose AI rules apply", event_type: "regulatory" },
  { event_date: "2025-08-07", label: "OpenAI launches GPT-5", event_type: "vendor" },
  { event_date: "2025-12-01", label: "Trump Executive Order challenges state AI laws", event_type: "regulatory" },
  { event_date: "2025-12-12", label: "State AGs warn AI firms on harmful outputs", event_type: "enforcement" },
  { event_date: "2026-01-14", label: "Future of Life 2025 AI Safety Index published", event_type: "standards" },
  { event_date: "2026-01-15", label: "NIST releases AI standards evaluation (GCR-26-069)", event_type: "standards" },
  { event_date: "2026-02-01", label: "Colorado AI Act takes effect", event_type: "regulatory" },
  { event_date: "2026-02-19", label: "Partnership on AI: 2026 governance priorities", event_type: "frameworks" },
  { event_date: "2026-02-25", label: "Anthropic replaces RSP with Frontier Safety Roadmap", event_type: "vendor" },
  { event_date: "2026-02-27", label: "Pentagon vs. Anthropic: DoD contract standoff", event_type: "enforcement" },
  { event_date: "2026-02-27", label: "OpenAI signs Pentagon deal (post-Anthropic)", event_type: "vendor" },
  { event_date: "2026-03-03", label: "Axios: AI labs loosening safety guardrails industry-wide", event_type: "vendor" },
  { event_date: "2026-08-02", label: "EU: High-risk AI system rules (Annex III) apply", event_type: "regulatory" },
  { event_date: "2027-08-02", label: "EU: Pre-2025 GPAI model providers must comply", event_type: "regulatory" },
];

// =============================================================================
// SEED EXECUTION
// =============================================================================

async function seed() {
  console.log("[SEED] Starting database seed...\n");

  // Feed Sources
  console.log("[SEED] Inserting feed sources...");
  for (const source of feedSources) {
    const { error } = await supabase.from("feed_sources").upsert(source, {
      onConflict: "name",
    });
    if (error) console.error(`  Error: ${source.name} - ${error.message}`);
    else console.log(`  OK: ${source.name}`);
  }

  // Vendors
  console.log("\n[SEED] Inserting vendors...");
  for (const vendor of vendors) {
    const { error } = await supabase.from("vendors").upsert(vendor, {
      onConflict: "name",
    });
    if (error) console.error(`  Error: ${vendor.display_name} - ${error.message}`);
    else console.log(`  OK: ${vendor.display_name}`);
  }

  // Frameworks
  console.log("\n[SEED] Inserting frameworks...");
  for (const fw of frameworks) {
    const { error } = await supabase.from("frameworks").upsert(fw, {
      onConflict: "name",
    });
    if (error) console.error(`  Error: ${fw.name} - ${error.message}`);
    else console.log(`  OK: ${fw.name}`);
  }

  // Timeline Events — clear existing before re-seeding (no unique constraint for upsert)
  console.log("\n[SEED] Clearing existing timeline events...");
  await supabase.from("timeline_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("[SEED] Inserting timeline events...");
  for (const event of timelineEvents) {
    const { error } = await supabase.from("timeline_events").insert(event);
    if (error && !error.message.includes("duplicate"))
      console.error(`  Error: ${event.label} - ${error.message}`);
    else console.log(`  OK: ${event.label}`);
  }

  console.log("\n[SEED] Complete.");
}

seed().catch((e) => { console.error(e); process.exit(1); });
