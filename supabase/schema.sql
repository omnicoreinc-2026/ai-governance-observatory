-- =============================================================================
-- AI GOVERNANCE OBSERVATORY - DATABASE SCHEMA
-- Supabase (PostgreSQL)
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE alert_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE alert_category AS ENUM (
  'regulatory',
  'vendor_guardrails',
  'frameworks',
  'safety_research',
  'enforcement',
  'standards'
);
CREATE TYPE feed_type AS ENUM ('rss', 'scrape', 'api');
CREATE TYPE feed_status AS ENUM ('active', 'paused', 'error');
CREATE TYPE vendor_risk_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE framework_status AS ENUM ('active', 'phased_enforcement', 'enacted', 'proposed', 'in_force', 'deprecated');
CREATE TYPE framework_type AS ENUM ('mandatory', 'voluntary', 'certifiable');
CREATE TYPE timeline_event_type AS ENUM ('regulatory', 'vendor', 'standards', 'frameworks', 'enforcement');

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Alerts: Primary content table for governance intelligence items
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  severity alert_severity NOT NULL DEFAULT 'info',
  category alert_category NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_content TEXT, -- Longer form content if available
  source_name TEXT NOT NULL,
  source_url TEXT,
  vendor TEXT, -- NULL if not vendor-specific
  is_new BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  priority_score INTEGER DEFAULT 0, -- Computed by scoring engine (0-100)
  tags TEXT[] DEFAULT '{}',
  raw_data JSONB DEFAULT '{}', -- Original scraped/parsed data
  published_at TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ, -- When an admin marks as reviewed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common query patterns
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_category ON alerts(category);
CREATE INDEX idx_alerts_vendor ON alerts(vendor);
CREATE INDEX idx_alerts_is_new ON alerts(is_new) WHERE is_new = true;
CREATE INDEX idx_alerts_priority ON alerts(priority_score DESC);
CREATE INDEX idx_alerts_published ON alerts(published_at DESC);
CREATE INDEX idx_alerts_search ON alerts USING gin(to_tsvector('english', title || ' ' || summary));

-- Vendors: AI vendor profiles and guardrail tracking
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  models TEXT, -- Comma-separated current model names
  color TEXT DEFAULT '#666666', -- Brand color for UI
  safety_policy TEXT,
  red_teaming TEXT,
  content_filtering TEXT,
  bias_audits TEXT,
  incident_response TEXT,
  military_use TEXT,
  agentic_controls TEXT,
  transparency_score INTEGER DEFAULT 0, -- 0-100
  risk_level vendor_risk_level DEFAULT 'medium',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  last_guardrail_change TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Frameworks: Governance frameworks and regulations
CREATE TABLE frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  short_name TEXT,
  status framework_status NOT NULL DEFAULT 'active',
  jurisdiction TEXT NOT NULL, -- US, EU, Global, US/State, etc.
  framework_type framework_type NOT NULL DEFAULT 'voluntary',
  description TEXT,
  pillars TEXT[] DEFAULT '{}', -- Key components/pillars
  key_dates JSONB DEFAULT '{}', -- { "effective": "2024-08-01", "enforcement": "2026-08-02" }
  compliance_requirements TEXT,
  related_frameworks TEXT[], -- Names of related frameworks
  source_url TEXT,
  metadata JSONB DEFAULT '{}',
  last_updated DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feed Sources: Configuration for data ingestion
CREATE TABLE feed_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  feed_type feed_type NOT NULL DEFAULT 'rss',
  url TEXT NOT NULL,
  scrape_selector TEXT, -- CSS selector for scraping (if type = scrape)
  status feed_status DEFAULT 'active',
  frequency_hours INTEGER DEFAULT 12,
  default_category alert_category DEFAULT 'regulatory',
  default_severity alert_severity DEFAULT 'medium',
  last_fetched_at TIMESTAMPTZ,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  items_ingested INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Additional config per source
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Events: Regulatory and enforcement milestones
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_date DATE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  event_type timeline_event_type NOT NULL,
  source_url TEXT,
  related_framework TEXT, -- FK reference by name
  is_upcoming BOOLEAN GENERATED ALWAYS AS (event_date > CURRENT_DATE) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_date ON timeline_events(event_date);

-- Audit Log: Track all cron job runs and data changes
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL, -- 'cron_run', 'alert_created', 'vendor_updated', etc.
  details JSONB DEFAULT '{}',
  source TEXT, -- Which feed or process
  items_processed INTEGER DEFAULT 0,
  items_created INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- Deduplication tracking
CREATE TABLE ingested_urls (
  url_hash TEXT PRIMARY KEY, -- SHA-256 of normalized URL
  url TEXT NOT NULL,
  source_id UUID REFERENCES feed_sources(id),
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_alerts_updated BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vendors_updated BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_frameworks_updated BEFORE UPDATE ON frameworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_feed_sources_updated BEFORE UPDATE ON feed_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Priority scoring function
CREATE OR REPLACE FUNCTION compute_priority_score(
  p_severity alert_severity,
  p_category alert_category,
  p_is_new BOOLEAN,
  p_published_at TIMESTAMPTZ
) RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  age_hours FLOAT;
BEGIN
  -- Base severity score
  score := CASE p_severity
    WHEN 'critical' THEN 90
    WHEN 'high' THEN 70
    WHEN 'medium' THEN 45
    WHEN 'low' THEN 20
    WHEN 'info' THEN 5
  END;

  -- Category boost
  score := score + CASE p_category
    WHEN 'enforcement' THEN 10
    WHEN 'regulatory' THEN 8
    WHEN 'vendor_guardrails' THEN 7
    WHEN 'safety_research' THEN 5
    WHEN 'frameworks' THEN 3
    WHEN 'standards' THEN 2
  END;

  -- Recency decay (lose points as items age)
  age_hours := EXTRACT(EPOCH FROM (NOW() - COALESCE(p_published_at, NOW()))) / 3600;
  IF age_hours < 24 THEN
    score := score; -- No decay within 24h
  ELSIF age_hours < 72 THEN
    score := score - 5;
  ELSIF age_hours < 168 THEN
    score := score - 10;
  ELSE
    score := score - 20;
  END IF;

  -- New item boost
  IF p_is_new THEN
    score := score + 5;
  END IF;

  RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-compute priority score on insert/update
CREATE OR REPLACE FUNCTION auto_compute_priority()
RETURNS TRIGGER AS $$
BEGIN
  NEW.priority_score := compute_priority_score(
    NEW.severity, NEW.category, NEW.is_new, NEW.published_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_alerts_priority BEFORE INSERT OR UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION auto_compute_priority();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Public read access for all content tables
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public read vendors" ON vendors FOR SELECT USING (true);
CREATE POLICY "Public read frameworks" ON frameworks FOR SELECT USING (true);
CREATE POLICY "Public read timeline" ON timeline_events FOR SELECT USING (true);

-- Service role only for writes (cron jobs use service key)
CREATE POLICY "Service write alerts" ON alerts FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Service write vendors" ON vendors FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Service write frameworks" ON frameworks FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Service write feed_sources" ON feed_sources FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Service write timeline" ON timeline_events FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Service write audit" ON audit_log FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Dashboard view: Top priority alerts
CREATE VIEW v_dashboard_alerts AS
SELECT
  id, severity, category, title, summary, source_name, vendor,
  is_new, priority_score, published_at, tags
FROM alerts
WHERE priority_score >= 40
ORDER BY priority_score DESC, published_at DESC
LIMIT 20;

-- Critical alerts view
CREATE VIEW v_critical_alerts AS
SELECT * FROM alerts
WHERE severity = 'critical'
ORDER BY published_at DESC;

-- Vendor risk summary
CREATE VIEW v_vendor_risk_summary AS
SELECT
  name, display_name, models, color, risk_level,
  safety_policy, military_use, agentic_controls,
  transparency_score, last_guardrail_change, updated_at
FROM vendors
ORDER BY
  CASE risk_level
    WHEN 'critical' THEN 0
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END;

-- Feed health view
CREATE VIEW v_feed_health AS
SELECT
  name, feed_type, status, frequency_hours,
  last_fetched_at, error_count, items_ingested,
  CASE
    WHEN status = 'error' THEN 'ERROR'
    WHEN last_fetched_at < NOW() - (frequency_hours || ' hours')::INTERVAL THEN 'STALE'
    ELSE 'OK'
  END AS health_status
FROM feed_sources
ORDER BY
  CASE status
    WHEN 'error' THEN 0
    WHEN 'active' THEN 1
    WHEN 'paused' THEN 2
  END;
