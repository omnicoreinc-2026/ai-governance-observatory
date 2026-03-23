import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const [alertsRes, feedsRes, auditRes] = await Promise.all([
      supabase.from("alerts").select("id", { count: "exact", head: true }),
      supabase.from("feed_sources").select("id, name, status, last_fetched_at, error_count"),
      supabase
        .from("audit_log")
        .select("*")
        .eq("action", "cron_run")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    const feedHealth = (feedsRes.data || []).map((f) => ({
      name: f.name,
      status: f.status,
      last_fetched: f.last_fetched_at,
      error_count: f.error_count,
    }));

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      total_alerts: alertsRes.count ?? 0,
      feeds: feedHealth,
      last_cron: auditRes.data?.[0] ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
