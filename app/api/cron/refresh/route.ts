// =============================================================================
// AI GOVERNANCE OBSERVATORY - CRON REFRESH API ROUTE
// app/api/cron/refresh/route.ts
//
// Vercel Cron endpoint. Runs twice daily at 06:00 and 18:00 UTC.
// Configure in vercel.json:
// {
//   "crons": [
//     { "path": "/api/cron/refresh", "schedule": "0 6,18 * * *" }
//   ]
// }
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { refreshAllFeeds } from "@/lib/ingestion/engine";

/** Timing-safe string comparison. Returns false if either value is undefined/empty. */
function safeCompare(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Vercel Cron requires this config for the runtime
export const maxDuration = 300; // 5 minutes max
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets CRON_SECRET automatically)
  const authHeader = request.headers.get("authorization");
  const expectedBearer = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined;
  if (!safeCompare(authHeader ?? undefined, expectedBearer)) {
    // Also allow manual triggers with API key during development
    const apiKey = request.headers.get("x-api-key");
    if (!safeCompare(apiKey ?? undefined, process.env.ADMIN_API_KEY)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    console.log("[CRON] Starting feed refresh...");

    const result = await refreshAllFeeds();

    const response = {
      status: "success",
      timestamp: new Date().toISOString(),
      feeds_processed: result.results.length,
      total_items_created: result.total_created,
      total_errors: result.total_errors,
      duration_ms: result.duration_ms,
      results: result.results.map((r) => ({
        source: r.source,
        processed: r.items_processed,
        created: r.items_created,
        skipped: r.items_skipped,
        errors: r.errors.length,
      })),
    };

    console.log(
      `[CRON] Complete. Created ${result.total_created} items, ${result.total_errors} errors, ${result.duration_ms}ms`
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("[CRON] Fatal error:", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
