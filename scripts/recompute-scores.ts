import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function recomputeScores(): Promise<void> {
  const startTime = Date.now();
  console.log("[SCORE] Fetching all alerts...");

  const { data: alerts, error } = await supabase
    .from("alerts")
    .select("id, severity, category, is_new, published_at");

  if (error || !alerts) {
    console.error("[SCORE] Failed to fetch alerts:", error?.message);
    process.exit(1);
  }

  console.log(`[SCORE] Found ${alerts.length} alerts. Triggering recompute...`);

  let updated = 0;
  let errors = 0;

  for (const alert of alerts) {
    // Updating updated_at triggers the auto_compute_priority trigger
    const { error: updateError } = await supabase
      .from("alerts")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", alert.id);

    if (updateError) {
      console.error(`  Error updating ${alert.id}: ${updateError.message}`);
      errors++;
    } else {
      updated++;
    }
  }

  console.log(
    `\n[SCORE] Complete. Updated: ${updated}, Errors: ${errors}`
  );

  const { error: auditError } = await supabase.from("audit_log").insert({
    action: "score_recompute",
    details: { total: alerts.length, updated, errors },
    source: "script:recompute-scores",
    items_processed: alerts.length,
    items_created: 0,
    errors,
    duration_ms: Date.now() - startTime,
  });
  if (auditError) {
    console.error("[SCORE] Failed to write audit_log:", auditError.message);
  }
}

recomputeScores().catch((e) => { console.error(e); process.exit(1); });
