// =============================================================================
// AI GOVERNANCE OBSERVATORY - FEED INGESTION ENGINE
// lib/ingestion/engine.ts
//
// Handles RSS parsing, web scraping, deduplication, and priority scoring.
// Zero paid APIs. All data from public RSS feeds and web scraping.
// =============================================================================

import Parser from "rss-parser";
import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  detectSeverity,
  detectCategory,
  detectVendor,
  extractTags,
} from "@/lib/ingestion/keywords";
import type {
  FeedSource,
  IngestedItem,
  IngestionResult,
  RefreshResult,
} from "@/lib/ingestion/types";

const rssParser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "AIGovernanceObservatory/1.0 (+https://governance.omnicoreinc.com)",
  },
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function hashUrl(url: string): string {
  return createHash("sha256").update(url.toLowerCase().trim()).digest("hex");
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .slice(0, 2000); // Cap length
}

// =============================================================================
// RSS FEED PARSER
// =============================================================================

async function parseRSSFeed(source: FeedSource): Promise<IngestedItem[]> {
  const items: IngestedItem[] = [];

  try {
    const feed = await rssParser.parseURL(source.url);

    for (const entry of feed.items || []) {
      const title = cleanText(entry.title || "");
      const summary = cleanText(
        entry.contentSnippet || entry.content || entry.summary || ""
      );
      const combined = `${title} ${summary}`;

      items.push({
        title,
        summary: summary.slice(0, 500),
        source_name: source.name,
        source_url: entry.link || source.url,
        category: detectCategory(combined, source.default_category),
        severity: detectSeverity(combined),
        vendor: detectVendor(combined),
        published_at: entry.isoDate || entry.pubDate || null,
        tags: extractTags(combined),
        raw_data: {
          guid: entry.guid,
          creator: entry.creator,
          categories: entry.categories,
        },
      });
    }
  } catch (error) {
    console.error(`[RSS] Error parsing ${source.name}:`, error);
    throw error;
  }

  return items;
}

// =============================================================================
// WEB SCRAPER
// =============================================================================

async function scrapeFeed(source: FeedSource): Promise<IngestedItem[]> {
  const items: IngestedItem[] = [];

  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent":
          "AIGovernanceObservatory/1.0 (+https://governance.omnicoreinc.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${source.url}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Default selector targets common blog/news article patterns
    const selector =
      source.scrape_selector || "article, .post, .entry, .news-item";

    $(selector).each((_i, el) => {
      const $el = $(el);
      const title = cleanText(
        $el.find("h1, h2, h3, .title, .headline").first().text()
      );
      const summary = cleanText(
        $el.find("p, .summary, .excerpt, .description").first().text()
      );
      const link =
        $el.find("a").first().attr("href") ||
        $el.find("h2 a, h3 a").first().attr("href");
      const dateStr =
        $el.find("time").attr("datetime") ||
        $el.find(".date, .published").first().text();

      if (title && title.length > 10) {
        const combined = `${title} ${summary}`;
        const fullUrl = link?.startsWith("http")
          ? link
          : `${new URL(source.url).origin}${link}`;

        items.push({
          title,
          summary: summary.slice(0, 500),
          source_name: source.name,
          source_url: fullUrl || source.url,
          category: detectCategory(combined, source.default_category),
          severity: detectSeverity(combined),
          vendor: detectVendor(combined),
          published_at: dateStr ? new Date(dateStr).toISOString() : null,
          tags: extractTags(combined),
          raw_data: { scraped_from: source.url },
        });
      }
    });
  } catch (error) {
    console.error(`[SCRAPE] Error scraping ${source.name}:`, error);
    throw error;
  }

  return items;
}

// =============================================================================
// DEDUPLICATION
// =============================================================================

async function isDuplicate(url: string, sourceId: string): Promise<boolean> {
  const urlHash = hashUrl(url);

  const { data } = await supabaseAdmin
    .from("ingested_urls")
    .select("url_hash")
    .eq("url_hash", urlHash)
    .single();

  if (data) {
    // Update last_seen
    await supabaseAdmin
      .from("ingested_urls")
      .update({ last_seen: new Date().toISOString() })
      .eq("url_hash", urlHash);
    return true;
  }

  // Record new URL
  await supabaseAdmin.from("ingested_urls").insert({
    url_hash: urlHash,
    url,
    source_id: sourceId,
  });

  return false;
}

// =============================================================================
// MAIN INGESTION PIPELINE
// =============================================================================

export async function ingestFeed(source: FeedSource): Promise<IngestionResult> {
  const startTime = Date.now();
  const result: IngestionResult = {
    source: source.name,
    items_processed: 0,
    items_created: 0,
    items_skipped: 0,
    errors: [],
    duration_ms: 0,
  };

  try {
    // Parse based on feed type
    let items: IngestedItem[] = [];
    if (source.feed_type === "rss") {
      items = await parseRSSFeed(source);
    } else if (source.feed_type === "scrape") {
      items = await scrapeFeed(source);
    }

    result.items_processed = items.length;

    // Process each item
    for (const item of items) {
      try {
        // Deduplication check
        if (item.source_url && (await isDuplicate(item.source_url, source.id))) {
          result.items_skipped++;
          continue;
        }

        // Insert alert
        const { error } = await supabaseAdmin.from("alerts").insert({
          severity: item.severity,
          category: item.category,
          title: item.title,
          summary: item.summary,
          source_name: item.source_name,
          source_url: item.source_url,
          vendor: item.vendor,
          is_new: true,
          tags: item.tags,
          published_at: item.published_at,
          raw_data: item.raw_data,
        });

        if (error) {
          result.errors.push(`Insert error for "${item.title}": ${error.message}`);
        } else {
          result.items_created++;
        }
      } catch (itemError: unknown) {
        const msg = itemError instanceof Error ? itemError.message : String(itemError);
        result.errors.push(`Item error: ${msg}`);
      }
    }

    // Update feed source status
    await supabaseAdmin
      .from("feed_sources")
      .update({
        last_fetched_at: new Date().toISOString(),
        items_ingested: (source.items_ingested || 0) + result.items_created,
        status: "active",
        error_count: 0,
        last_error: null,
      })
      .eq("id", source.id);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    result.errors.push(`Feed error: ${msg}`);

    // Update feed source with error
    await supabaseAdmin
      .from("feed_sources")
      .update({
        last_error: msg,
        error_count: (source.error_count || 0) + 1,
        status: (source.error_count || 0) >= 5 ? "error" : "active",
      })
      .eq("id", source.id);
  }

  result.duration_ms = Date.now() - startTime;
  return result;
}

// =============================================================================
// FULL REFRESH (ALL ACTIVE FEEDS)
// =============================================================================

export async function refreshAllFeeds(): Promise<RefreshResult> {
  const startTime = Date.now();

  // Fetch all active feed sources
  const { data: sources, error } = await supabaseAdmin
    .from("feed_sources")
    .select("*")
    .eq("status", "active");

  if (error || !sources) {
    throw new Error(`Failed to fetch feed sources: ${error?.message}`);
  }

  const results: IngestionResult[] = [];

  // Process feeds sequentially to avoid rate limiting
  for (const source of sources) {
    console.log(`[INGEST] Processing: ${source.name}`);
    const result = await ingestFeed(source as FeedSource);
    results.push(result);

    // Brief delay between feeds to be respectful
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const total_created = results.reduce((sum, r) => sum + r.items_created, 0);
  const total_errors = results.reduce((sum, r) => sum + r.errors.length, 0);

  // Log to audit table
  await supabaseAdmin.from("audit_log").insert({
    action: "cron_run",
    details: {
      feeds_processed: sources.length,
      results: results.map((r) => ({
        source: r.source,
        created: r.items_created,
        skipped: r.items_skipped,
        errors: r.errors.length,
      })),
    },
    source: "cron:refresh",
    items_processed: results.reduce((sum, r) => sum + r.items_processed, 0),
    items_created: total_created,
    errors: total_errors,
    duration_ms: Date.now() - startTime,
  });

  // Mark items older than 7 days as not new
  await supabaseAdmin
    .from("alerts")
    .update({ is_new: false })
    .lt("ingested_at", new Date(Date.now() - 7 * 86400000).toISOString())
    .eq("is_new", true);

  return {
    results,
    total_created,
    total_errors,
    duration_ms: Date.now() - startTime,
  };
}
