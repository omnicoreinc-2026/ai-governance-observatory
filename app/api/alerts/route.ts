import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import type { AlertSeverity, AlertCategory } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

/** Escape PostgREST special characters to prevent filter injection. */
function sanitizePostgrestSearch(input: string): string {
  return input.replace(/[.,()%*\\]/g, "");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity") as AlertSeverity | null;
    const category = searchParams.get("category") as AlertCategory | null;
    const vendor = searchParams.get("vendor");
    const isNew = searchParams.get("is_new");
    const search = searchParams.get("search");
    const rawLimit = parseInt(searchParams.get("limit") || "50", 10);
    const rawOffset = parseInt(searchParams.get("offset") || "0", 10);
    const limit = Number.isNaN(rawLimit) ? 50 : Math.max(1, Math.min(200, rawLimit));
    const offset = Number.isNaN(rawOffset) ? 0 : Math.max(0, rawOffset);

    let query = supabase
      .from("alerts")
      .select("*", { count: "exact" })
      .order("priority_score", { ascending: false })
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (severity) query = query.eq("severity", severity);
    if (category) query = query.eq("category", category);
    if (vendor) query = query.eq("vendor", vendor);
    if (isNew === "true") query = query.eq("is_new", true);
    if (search) {
      const sanitized = sanitizePostgrestSearch(search);
      if (sanitized) {
        query = query.or(`title.ilike.%${sanitized}%,summary.ilike.%${sanitized}%`);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[ALERTS] Supabase query error:", error.message);
      return NextResponse.json(
        { status: "error", message: "Failed to fetch alerts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      data,
      total: count,
      limit,
      offset,
    });
  } catch (error: unknown) {
    console.error("[ALERTS] Unexpected error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
