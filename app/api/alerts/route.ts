import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import type { AlertSeverity, AlertCategory } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity") as AlertSeverity | null;
    const category = searchParams.get("category") as AlertCategory | null;
    const vendor = searchParams.get("vendor");
    const isNew = searchParams.get("is_new");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

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
    if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message },
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
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
