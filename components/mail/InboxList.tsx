"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mail } from "./types";
import { InboxListSkeleton } from "./InboxListSkeleton";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";

interface InboxListProps {
  emails: Mail[];
  selectedId: string | null;
  onSelect: (email: Mail) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  className?: string;
  fullWidth?: boolean;
}

const InboxList: React.FC<InboxListProps> = ({
  emails,
  selectedId,
  onSelect,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
  error = null,
  className,
  fullWidth = false,
}) => {
  // Use minimum loading time to prevent skeleton flicker
  const { shouldShowLoading, isTransitioning } = useMinimumLoading(isLoading, {
    minimumDuration: 300,
  });

  // Show full skeleton during initial load
  if (shouldShowLoading) {
    return (
      <InboxListSkeleton
        rowCount={8}
        showHeader={true}
        fullWidth={fullWidth}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white relative",
        // On desktop: fixed width with border when not fullWidth, full width when fullWidth
        fullWidth
          ? "w-full"
          : "w-full lg:w-[360px] xl:w-[420px] lg:border-r lg:border-gray-200",
        className
      )}
      aria-busy={isRefreshing}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 relative z-20 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 w-9 rounded-xl border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw
            className={cn("h-4 w-4 text-gray-600", isRefreshing && "animate-spin")}
          />
        </Button>
      </div>

      {/* Subtle refreshing indicator - stale-while-revalidate pattern */}
      {isRefreshing && emails.length > 0 && (
        <div className="px-4 py-2 bg-blue-50/80 border-b border-blue-100">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
            <span className="text-xs text-blue-600">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Email List with fade-in transition */}
      <div
        className={cn(
          "flex-1 overflow-y-auto relative",
          // Fade-in animation when transitioning from loading
          isTransitioning && "animate-fade-in"
        )}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center h-32 px-4">
            <p className="text-sm text-red-600 text-center mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="text-sm"
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Try again
            </Button>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 px-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <RefreshCw className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No emails found</p>
            <p className="text-xs text-gray-500 text-center mb-3">
              Your inbox is empty or no emails match your filter
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="text-sm"
            >
              Refresh
            </Button>
          </div>
        ) : (
          <div>
            {emails.map((email) => (
              <InboxRow
                key={email.email_encode_id}
                email={email}
                isSelected={selectedId === email.email_encode_id}
                onClick={() => onSelect(email)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Gmail-style inbox row component
interface InboxRowProps {
  email: Mail;
  isSelected: boolean;
  onClick: () => void;
}

const InboxRow: React.FC<InboxRowProps> = ({ email, isSelected, onClick }) => {
  const isUnread = email.unread;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-4 transition-colors border-b border-gray-100",
        "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
        isSelected && "bg-blue-50 hover:bg-blue-100"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator dot */}
        <div className="flex-shrink-0 pt-1.5">
          {isUnread ? (
            <div className="w-2 h-2 rounded-full bg-blue-600" />
          ) : (
            <div className="w-2 h-2" /> // Placeholder to maintain alignment
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: Sender + Time */}
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                "text-base truncate",
                isUnread
                  ? "font-semibold text-slate-900"
                  : "font-medium text-slate-700"
              )}
            >
              {email.from || "Unknown Sender"}
            </span>
            <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
              {email.date}
            </span>
          </div>

          {/* Subject line */}
          <p
            className={cn(
              "text-sm truncate mt-1",
              isUnread
                ? "font-semibold text-slate-900"
                : "font-medium text-slate-700"
            )}
          >
            {email.subject || "(No subject)"}
          </p>

          {/* Snippet/Preview */}
          <p className="text-sm text-gray-500 line-clamp-1 mt-1">
            {email.snippet || "No preview available"}
          </p>
        </div>
      </div>
    </button>
  );
};

export default InboxList;
