"use client";

import { useEffect, useState } from "react";
import { Rss, Globe, CheckCircle, XCircle, PauseCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils/dates";
import type { FeedSource } from "@/lib/supabase/types";

const STATUS_ICONS = {
  active: CheckCircle,
  paused: PauseCircle,
  error: XCircle,
} as const;

const STATUS_COLORS = {
  active: "#10B981",
  paused: "#F59E0B",
  error: "#EF4444",
} as const;

export function DataSourcesView(): JSX.Element {
  const [sources, setSources] = useState<FeedSource[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("feed_sources")
        .select("*")
        .order("name");
      setSources(data ?? []);
    }
    load();
  }, []);

  const activeCount = sources.filter((s) => s.status === "active").length;
  const errorCount = sources.filter((s) => s.status === "error").length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-6 text-sm">
        <span className="text-[#10B981]">{activeCount} Active</span>
        <span className="text-[#EF4444]">{errorCount} Error</span>
        <span className="text-[#A1A1AA]">{sources.length} Total</span>
      </div>

      {/* Feed Cards */}
      <div className="grid grid-cols-2 gap-3">
        {sources.map((source) => {
          const StatusIcon = STATUS_ICONS[source.status];
          const statusColor = STATUS_COLORS[source.status];

          return (
            <div
              key={source.id}
              className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {source.feed_type === "rss" ? (
                    <Rss className="h-4 w-4 text-[#F59E0B]" />
                  ) : (
                    <Globe className="h-4 w-4 text-[#8B5CF6]" />
                  )}
                  <span className="text-sm font-medium text-[#FAFAFA]">
                    {source.name}
                  </span>
                </div>
                <StatusIcon
                  className="h-4 w-4 shrink-0"
                  style={{ color: statusColor }}
                />
              </div>

              <div className="space-y-1 text-xs text-[#71717A]">
                <div className="flex items-center justify-between">
                  <span>Type</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor:
                        source.feed_type === "rss"
                          ? "#F59E0B15"
                          : "#8B5CF615",
                      color:
                        source.feed_type === "rss" ? "#F59E0B" : "#8B5CF6",
                    }}
                  >
                    {source.feed_type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Frequency</span>
                  <span className="text-[#A1A1AA]">
                    Every {source.frequency_hours}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Fetch</span>
                  <span className="text-[#A1A1AA]">
                    {timeAgo(source.last_fetched_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Items Ingested</span>
                  <span className="font-mono text-[#A1A1AA]">
                    {source.items_ingested}
                  </span>
                </div>
                {source.error_count > 0 && (
                  <div className="flex items-center justify-between text-[#EF4444]">
                    <span>Errors</span>
                    <span className="font-mono">{source.error_count}</span>
                  </div>
                )}
              </div>

              {source.last_error && (
                <p className="mt-2 rounded bg-[#EF4444]/5 p-2 text-[10px] text-[#EF4444]">
                  {source.last_error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {sources.length === 0 && (
        <div className="py-12 text-center text-sm text-[#71717A]">
          No feed sources. Run the seed script to populate.
        </div>
      )}

      {/* Architecture Panel */}
      <div className="rounded-[10px] border border-white/[0.06] bg-[#0F0F12] p-4">
        <h3 className="mb-3 text-sm font-medium text-[#FAFAFA]">
          Data Pipeline Architecture
        </h3>
        <div className="font-mono text-xs text-[#A1A1AA] space-y-1 whitespace-pre">
          {`Vercel Cron (06:00, 18:00 UTC)
  → /api/cron/refresh
  → lib/ingestion/engine.ts
  → For each active feed:
     → RSS parse OR web scrape
     → Keyword detection (severity, category, vendor)
     → SHA-256 dedup check
     → Insert to alerts (trigger computes score)
  → Mark old items as not new
  → Write audit_log entry`}
        </div>
      </div>
    </div>
  );
}
