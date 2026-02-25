import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function parseDateInput(date: Date | string): Date {
  if (date instanceof Date) return date;

  const raw = date.trim();

  // Truncate sub-millisecond precision — Go backends often send microseconds or
  // nanoseconds (e.g. "2026-02-25T09:10:00.123456789Z"). Browsers only support
  // milliseconds, so strip extra fractional digits beyond 3.
  const trimmed = raw.replace(/(\.\d{3})\d+/, "$1");

  // Normalize some common backend timezone forms:
  // - "+0700" -> "+07:00"
  // - trailing " UTC" -> "Z"
  const withTz = trimmed
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2")
    .replace(/\sUTC$/, "Z");

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(withTz);
  const hasTime = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(trimmed);
  const normalized = withTz.replace(" ", "T");

  if (!hasTimezone && hasTime) {
    // Some endpoints send naive timestamps in local time, others in UTC.
    // Parse both and choose the one closest to "now" to avoid large future offsets.
    const localDate = new Date(normalized);
    const utcDate = new Date(`${normalized}Z`);

    if (!Number.isNaN(localDate.getTime()) && !Number.isNaN(utcDate.getTime())) {
      const now = Date.now();
      return Math.abs(localDate.getTime() - now) <= Math.abs(utcDate.getTime() - now)
        ? localDate
        : utcDate;
    }
    if (!Number.isNaN(localDate.getTime())) return localDate;
    return utcDate;
  }

  return new Date(normalized);
}

/**
 * Formats a date into a human-readable relative time string
 * @param date - Date object or ISO date string
 * @returns Formatted relative time string (e.g., "Just now", "5 minutes ago", "2 hours ago", "3 days ago", "Jan 15")
 */
export function formatRelativeTime(date: Date | string): string {
  const targetDate = parseDateInput(date);
  if (Number.isNaN(targetDate.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const absDiffMs = Math.abs(diffMs);
  const diffMins = Math.floor(absDiffMs / 60000);
  const diffHours = Math.floor(absDiffMs / 3600000);
  const diffDays = Math.floor(absDiffMs / 86400000);
  const isFuture = diffMs < 0;

  if (absDiffMs < 60000) {
    return "Just now";
  } else if (diffMins < 60) {
    return isFuture
      ? `in ${diffMins} minute${diffMins !== 1 ? "s" : ""}`
      : `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return isFuture
      ? `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`
      : `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return isFuture
      ? `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`
      : `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

/**
 * Prefer server-provided relative time when available, otherwise compute from timestamp.
 */
export function resolveRelativeTime(
  date: Date | string | undefined,
  serverRelativeTime?: string | null,
): string {
  const relative = (serverRelativeTime || "").trim();
  if (relative) return relative;
  if (!date) return "";
  return formatRelativeTime(date);
}
