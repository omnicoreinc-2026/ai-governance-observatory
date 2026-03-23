import { formatDistanceToNow, format, parseISO } from "date-fns";

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "MMM d, yyyy HH:mm");
  } catch {
    return "—";
  }
}
