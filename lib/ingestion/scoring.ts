import type { AlertSeverity, AlertCategory } from "@/lib/supabase/types";

const SEVERITY_BASE: Record<string, number> = {
  critical: 90,
  high: 70,
  medium: 45,
  low: 20,
  info: 5,
};

const CATEGORY_BOOST: Record<string, number> = {
  enforcement: 10,
  regulatory: 8,
  vendor_guardrails: 7,
  safety_research: 5,
  frameworks: 3,
  standards: 2,
};

export function computePriorityScore(
  severity: AlertSeverity,
  category: AlertCategory,
  isNew: boolean,
  publishedAt: string | null
): number {
  let score = SEVERITY_BASE[severity] ?? 5;
  score += CATEGORY_BOOST[category] ?? 0;

  if (publishedAt) {
    const ageHours =
      (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
    if (ageHours < 24) {
      // no decay
    } else if (ageHours < 72) {
      score -= 5;
    } else if (ageHours < 168) {
      score -= 10;
    } else {
      score -= 20;
    }
  }

  if (isNew) score += 5;

  return Math.max(0, Math.min(100, score));
}
