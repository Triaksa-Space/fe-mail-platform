"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mail } from "./types";
import { InboxListSkeleton } from "./InboxListSkeleton";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";
import { LazyList } from "@/components/VirtualList";

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
  userEmail?: string;
  sentCount?: number;
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
  userEmail,
  sentCount = 0,
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
        "flex flex-col h-full bg-gray relative",
        // On desktop: fixed width with border when not fullWidth, full width when fullWidth
        fullWidth
          ? "w-full"
          : "w-full lg:w-[360px] xl:w-[420px] lg:border-r lg:border-gray-200",
        className
      )}
      aria-busy={isRefreshing}
    >
      {/* Header */}
      <div className="px-5 py-3 relative z-20 bg-gray">
        <div className="h-10 flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw
              className={cn("h-4 w-4 text-gray-800", isRefreshing && "animate-spin")}
            />
          </Button>
          {userEmail && (
            <span className="text-base font-semibold text-gray-800 truncate max-w-[220px]">
              {userEmail}
            </span>
          )}
        </div>
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
          "flex-1 overflow-y-auto relative px-5",
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
          <div className="flex-1 px-4 md:px-5 py-12 flex items-start justify-center">
            <div className="w-full bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-gray-200 px-3 py-12 flex flex-col justify-center items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <Inbox className="w-9 h-9 text-gray-300" />
              </div>
              <div className="flex flex-col justify-start items-center gap-1">
                <p className="text-base font-medium text-gray-800">No Email Yet</p>
                <p className="text-center text-xs font-normal text-gray-600 leading-5">
                  There are no email in your inbox
                  <br className="hidden sm:block" />
                  at the moment.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <LazyList
            items={emails}
            batchSize={20}
            getItemKey={(email) => email.email_encode_id}
            className="flex flex-col gap-2 pb-4"
            renderItem={(email) => (
              <InboxRow
                email={email}
                isSelected={selectedId === email.email_encode_id}
                onClick={() => onSelect(email)}
              />
            )}
          />
        )}
      </div>
    </div>
  );
};

// Gmail-style inbox row component - Memoized to prevent unnecessary re-renders
interface InboxRowProps {
  email: Mail;
  isSelected: boolean;
  onClick: () => void;
}

const InboxRow: React.FC<InboxRowProps> = memo(function InboxRow({ email, isSelected, onClick }) {
  const isUnread = email.unread;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2 transition-colors",
        "rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] border border-gray-200",
        isUnread ? "bg-white" : "bg-gray-100",
        "hover:bg-sky-100 focus:outline-none focus:bg-sky-100",
        isSelected && "bg-sky-100"
      )}
    >
      <div className="flex items-start gap-3">

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: Sender + Time + Unread indicator */}
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                "text-base truncate",
                isUnread ? "font-semibold text-gray-800" : "font-normal text-gray-600"
              )}
            >
              {email.from || "Unknown Sender"}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  isUnread ? "font-semibold text-gray-800" : "font-normal text-gray-600"
                )}
              >
                {email.date}
              </span>
              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </div>
          </div>

          {/* Subject line */}
          <p
            className={cn(
              "text-sm truncate mt-1",
              isUnread ? "font-semibold text-gray-800" : "font-normal text-gray-600"
            )}
          >
            {email.subject || "(No subject)"}
          </p>

          {/* Snippet/Preview */}
          <p
            className={cn(
              "text-sm line-clamp-1 mt-1",
              isUnread ? "font-normal text-gray-600" : "font-normal text-gray-600"
            )}
          >
            {email.snippet || "No preview available"}
          </p>
        </div>
      </div>
    </button>
  );
});

export default InboxList;
