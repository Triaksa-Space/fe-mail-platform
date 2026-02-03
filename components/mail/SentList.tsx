"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw, Send, Paperclip, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SentMail } from "./types";
import { InboxListSkeleton } from "./InboxListSkeleton";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";
import { LazyList } from "@/components/VirtualList";

interface SentListProps {
  emails: SentMail[];
  selectedId: string | null;
  onSelect: (email: SentMail) => void;
  onRefresh: () => void;
  onCompose?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  className?: string;
  fullWidth?: boolean;
  userEmail?: string;
  sentCount?: number;
}

const SentList: React.FC<SentListProps> = ({
  emails,
  selectedId,
  onSelect,
  onRefresh,
  onCompose,
  isLoading = false,
  isRefreshing = false,
  error = null,
  className,
  fullWidth = false,
  userEmail,
  sentCount = 0,
}) => {
  const { shouldShowLoading, isTransitioning } = useMinimumLoading(isLoading, {
    minimumDuration: 300,
  });

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
          {onCompose && (
            <Button
              onClick={onCompose}
              className="h-10 px-4 py-2.5 bg-blue-600 hover:bg-blue-800 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] border border-sky-600 text-white"
            >
              <PenSquare className="h-4 w-4 mr-1.5 text-white" />
              <span className="text-base font-medium leading-4">Compose</span>
            </Button>
          )}
          {userEmail && (
            <span className="text-base font-semibold text-gray-800 truncate max-w-[220px]">
              {userEmail}
            </span>
          )}
        </div>
      </div>

      {/* Refreshing indicator */}
      {isRefreshing && emails.length > 0 && (
        <div className="px-4 py-2 bg-blue-50/80 border-b border-blue-100">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
            <span className="text-xs text-blue-600">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Email List */}
      <div
        className={cn(
          "flex-1 overflow-y-auto relative px-5",
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
              <Send className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No sent emails</p>
            <p className="text-xs text-gray-500 text-center mb-3">
              Emails you send will appear here
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
          <LazyList
            items={emails}
            batchSize={20}
            getItemKey={(email) => email.id}
            className="flex flex-col gap-2 pb-4"
            renderItem={(email) => (
              <SentRow
                email={email}
                isSelected={selectedId === email.id}
                onClick={() => onSelect(email)}
              />
            )}
          />
        )}
      </div>
    </div>
  );
};

// Sent email row component - Memoized to prevent unnecessary re-renders
interface SentRowProps {
  email: SentMail;
  isSelected: boolean;
  onClick: () => void;
}

const SentRow: React.FC<SentRowProps> = memo(function SentRow({ email, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2 transition-colors",
        "rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] border border-gray-200",
        "bg-white hover:bg-sky-100 focus:outline-none focus:bg-sky-100",
        isSelected && "bg-sky-100"
      )}
    >
      <div className="flex items-start gap-3">

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: To + Time */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-base font-normal text-gray-600 truncate">
              To: {email.to || "Unknown"}
            </span>
            <span className="text-xs font-normal text-gray-600 whitespace-nowrap flex-shrink-0">
              {email.date}
            </span>
          </div>

          {/* Subject line */}
          <p className="text-sm font-normal text-gray-600 truncate mt-1">
            {email.subject || "(No subject)"}
          </p>

          {/* Snippet/Preview */}
          <p className="text-sm font-normal text-gray-600 line-clamp-1 mt-1">
            {email.snippet || "No preview available"}
          </p>
        </div>
      </div>
    </button>
  );
});

export default SentList;
