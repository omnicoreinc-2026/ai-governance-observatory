"use client";

import { useEffect, useState, useCallback, useDeferredValue } from "react";
import { Search, Filter, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import {
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "@/lib/utils/constants";
import { timeAgo } from "@/lib/utils/dates";
import type { Alert, AlertSeverity, AlertCategory } from "@/lib/supabase/types";

/** Escape PostgREST special characters to prevent filter injection. */
function sanitizePostgrestSearch(input: string): string {
  return input.replace(/[.,()%*\\]/g, "");
}

/** Validate that a URL uses a safe protocol. */
function safeHref(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return url;
    }
    return "#";
  } catch {
    return "#";
  }
}

export function IntelligenceFeed(): JSX.Element {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "">("");
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | "">("");
  const [newOnly, setNewOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("alerts")
      .select("*", { count: "exact" })
      .order("priority_score", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(50);

    if (severityFilter) query = query.eq("severity", severityFilter);
    if (categoryFilter) query = query.eq("category", categoryFilter);
    if (newOnly) query = query.eq("is_new", true);
    if (deferredSearchQuery) {
      const sanitized = sanitizePostgrestSearch(deferredSearchQuery);
      if (sanitized) {
        query = query.or(
          `title.ilike.%${sanitized}%,summary.ilike.%${sanitized}%`
        );
      }
    }

    const { data, count } = await query;
    setAlerts(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [severityFilter, categoryFilter, newOnly, deferredSearchQuery]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search alerts"
            className="w-full rounded-[10px] border border-white/[0.06] bg-[#0F0F12] py-2 pl-9 pr-4 text-sm text-[#D4D4D8] placeholder-[#71717A] outline-none focus:border-[#38BDF8]/50"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) =>
            setSeverityFilter(e.target.value as AlertSeverity | "")
          }
          aria-label="Filter by severity"
          className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] px-3 py-2 text-sm text-[#D4D4D8] outline-none"
        >
          <option value="">All Severities</option>
          {Object.entries(SEVERITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as AlertCategory | "")
          }
          aria-label="Filter by category"
          className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] px-3 py-2 text-sm text-[#D4D4D8] outline-none"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>

        <button
          onClick={() => setNewOnly(!newOnly)}
          aria-pressed={newOnly}
          className={`rounded-[10px] border px-3 py-2 text-sm transition-colors ${
            newOnly
              ? "border-[#38BDF8]/50 bg-[#38BDF8]/10 text-[#38BDF8]"
              : "border-white/[0.06] bg-[#0F0F12] text-[#A1A1AA]"
          }`}
        >
          <Filter className="mr-1 inline h-3 w-3" />
          New Only
        </button>
      </div>

      <p className="text-xs text-[#71717A]">{total} alerts found</p>

      {/* Alert List */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-12 text-center text-sm text-[#71717A]">
            Loading...
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#71717A]">
            No alerts found. Adjust filters or run the cron job.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] overflow-hidden"
              style={{
                borderLeftWidth: 3,
                borderLeftColor: SEVERITY_COLORS[alert.severity],
              }}
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === alert.id ? null : alert.id)
                }
                aria-expanded={expandedId === alert.id}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <SeverityBadge severity={alert.severity} />
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[alert.category]}15`,
                        color: CATEGORY_COLORS[alert.category],
                      }}
                    >
                      {CATEGORY_LABELS[alert.category]}
                    </span>
                    {alert.vendor && (
                      <span className="text-[10px] text-[#A1A1AA] border border-white/[0.06] rounded-full px-2 py-0.5">
                        {alert.vendor}
                      </span>
                    )}
                    {alert.is_new && (
                      <span className="text-[10px] font-semibold text-[#38BDF8]">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#FAFAFA] line-clamp-1">
                    {alert.title}
                  </p>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    {alert.source_name} &middot;{" "}
                    {timeAgo(alert.published_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-semibold text-[#38BDF8]">
                    {alert.priority_score}
                  </span>
                  {expandedId === alert.id ? (
                    <ChevronUp className="h-4 w-4 text-[#71717A]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#71717A]" />
                  )}
                </div>
              </button>

              {expandedId === alert.id && (
                <div className="border-t border-white/[0.04] bg-white/[0.01] px-4 py-3">
                  <p className="text-sm text-[#D4D4D8]">{alert.summary}</p>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    {alert.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#A1A1AA]"
                      >
                        {tag}
                      </span>
                    ))}
                    {alert.source_url && (
                      <a
                        href={safeHref(alert.source_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 text-xs text-[#38BDF8] hover:underline"
                      >
                        Source <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
