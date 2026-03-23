import type { AlertSeverity, AlertCategory, TimelineEventType } from "@/lib/supabase/types";

export const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  critical: "#EF4444",
  high: "#F59E0B",
  medium: "#3B82F6",
  low: "#10B981",
  info: "#6B7280",
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

export const CATEGORY_COLORS: Record<AlertCategory, string> = {
  regulatory: "#F59E0B",
  vendor_guardrails: "#8B5CF6",
  frameworks: "#3B82F6",
  safety_research: "#EC4899",
  enforcement: "#EF4444",
  standards: "#10B981",
};

export const CATEGORY_LABELS: Record<AlertCategory, string> = {
  regulatory: "Regulatory",
  vendor_guardrails: "Vendor Guardrails",
  frameworks: "Frameworks",
  safety_research: "Safety Research",
  enforcement: "Enforcement",
  standards: "Standards",
};

export const EVENT_TYPE_COLORS: Record<TimelineEventType, string> = {
  regulatory: "#F59E0B",
  vendor: "#8B5CF6",
  standards: "#10B981",
  frameworks: "#3B82F6",
  enforcement: "#EF4444",
};

export const SEVERITY_ORDER: AlertSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

export const CATEGORY_ORDER: AlertCategory[] = [
  "enforcement",
  "regulatory",
  "vendor_guardrails",
  "safety_research",
  "frameworks",
  "standards",
];
