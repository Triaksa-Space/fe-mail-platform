import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function parseDateInput(date: Date | string): Date {
  if (date instanceof Date) return date;

  const raw = date.trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(raw);
  const hasTime = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/.test(raw);

  // Backend may return UTC timestamps without timezone, e.g. "2026-02-25T09:10:00".
  // Treat those as UTC to avoid local-time misparse (which can look like "future/just now").
  const normalized = !hasTimezone && hasTime ? `${raw.replace(" ", "T")}Z` : raw;
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
