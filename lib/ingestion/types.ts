export interface FeedSource {
  id: string;
  name: string;
  feed_type: "rss" | "scrape" | "api";
  url: string;
  scrape_selector?: string;
  status: string;
  default_category: string;
  default_severity: string;
  items_ingested: number;
  error_count: number;
  metadata: Record<string, unknown>;
}

export interface IngestedItem {
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  category: string;
  severity: string;
  vendor: string | null;
  published_at: string | null;
  tags: string[];
  raw_data: Record<string, unknown>;
}

export interface IngestionResult {
  source: string;
  items_processed: number;
  items_created: number;
  items_skipped: number;
  errors: string[];
  duration_ms: number;
}

export interface RefreshResult {
  results: IngestionResult[];
  total_created: number;
  total_errors: number;
  duration_ms: number;
}
