export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";
export type AlertCategory =
  | "regulatory"
  | "vendor_guardrails"
  | "frameworks"
  | "safety_research"
  | "enforcement"
  | "standards";
export type FeedType = "rss" | "scrape" | "api";
export type FeedStatus = "active" | "paused" | "error";
export type VendorRiskLevel = "critical" | "high" | "medium" | "low";
export type FrameworkStatus =
  | "active"
  | "phased_enforcement"
  | "enacted"
  | "proposed"
  | "in_force"
  | "deprecated";
export type FrameworkType = "mandatory" | "voluntary" | "certifiable";
export type TimelineEventType =
  | "regulatory"
  | "vendor"
  | "standards"
  | "frameworks"
  | "enforcement";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  summary: string;
  full_content: string | null;
  source_name: string;
  source_url: string | null;
  vendor: string | null;
  is_new: boolean;
  is_pinned: boolean;
  priority_score: number;
  tags: string[];
  raw_data: Record<string, unknown>;
  published_at: string | null;
  ingested_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  display_name: string;
  models: string | null;
  color: string;
  safety_policy: string | null;
  red_teaming: string | null;
  content_filtering: string | null;
  bias_audits: string | null;
  incident_response: string | null;
  military_use: string | null;
  agentic_controls: string | null;
  transparency_score: number;
  risk_level: VendorRiskLevel;
  notes: string | null;
  metadata: Record<string, unknown>;
  last_guardrail_change: string | null;
  created_at: string;
  updated_at: string;
}

export interface Framework {
  id: string;
  name: string;
  short_name: string | null;
  status: FrameworkStatus;
  jurisdiction: string;
  framework_type: FrameworkType;
  description: string | null;
  pillars: string[];
  key_dates: Record<string, string>;
  compliance_requirements: string | null;
  related_frameworks: string[] | null;
  source_url: string | null;
  metadata: Record<string, unknown>;
  last_updated: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedSource {
  id: string;
  name: string;
  feed_type: FeedType;
  url: string;
  scrape_selector: string | null;
  status: FeedStatus;
  frequency_hours: number;
  default_category: AlertCategory;
  default_severity: AlertSeverity;
  last_fetched_at: string | null;
  last_error: string | null;
  error_count: number;
  items_ingested: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  event_date: string;
  label: string;
  description: string | null;
  event_type: TimelineEventType;
  source_url: string | null;
  related_framework: string | null;
  is_upcoming: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: Record<string, unknown>;
  source: string | null;
  items_processed: number;
  items_created: number;
  errors: number;
  duration_ms: number | null;
  created_at: string;
}
