import { SEVERITY_COLORS, SEVERITY_LABELS } from "@/lib/utils/constants";
import type { AlertSeverity } from "@/lib/supabase/types";

interface SeverityBadgeProps {
  severity: AlertSeverity;
  showDot?: boolean;
}

export function SeverityBadge({ severity, showDot = true }: SeverityBadgeProps): JSX.Element {
  const color = SEVERITY_COLORS[severity];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${severity === "critical" ? "animate-pulse" : ""}`}
          style={{ backgroundColor: color }}
        />
      )}
      {SEVERITY_LABELS[severity]}
    </span>
  );
}
