"use client";

import React, { memo } from "react";
import Image from "next/image";
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
        "flex flex-col h-full bg-gray-50 relative overflow-hidden",
        // On desktop: fixed width with border when not fullWidth, full width when fullWidth
        fullWidth
          ? "w-full"
          : "w-full lg:w-[360px] xl:w-[420px] lg:border-r lg:border-gray-200",
        className
      )}
      aria-busy={isRefreshing}
    >
      {/* Mobile Header with Logo */}
      <div className="lg:hidden px-4 py-3 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-4">
          <Image
            src="/mailria.png"
            alt="Mailria"
            width={112}
            height={40}
            className="h-10 w-28"
          />
        </div>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="text-gray-800 text-sm font-semibold font-['Roboto'] leading-5">
              {userEmail}
            </span>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex px-5 py-3 relative z-20 bg-gray-50">
        <div className="h-10 flex items-center justify-between w-full">
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
        <div className="px-4 py-2 bg-blue-50/80 border-b border-blue-100 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
            <span className="text-xs text-blue-600">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Email List with fade-in transition */}
      <div
        className={cn(
          "flex-1 overflow-y-auto relative px-4 pb-24 lg:pb-4",
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
          <div className="flex-1 py-12 flex items-start justify-center">
            <div className="w-full bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 px-3 py-12 flex flex-col justify-center items-center gap-3">
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
            className="flex flex-col gap-2"
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

// Inbox row component - Memoized to prevent unnecessary re-renders
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
        "rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200",
        isUnread ? "bg-white" : "bg-white",
        "hover:bg-sky-100 focus:outline-none focus:bg-sky-100",
        isSelected && "bg-sky-100"
      )}
    >
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex flex-col gap-0.5">
          {/* Top row: Sender + Time */}
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center gap-0.5">
              <span className={cn(
                "text-base font-['Roboto'] leading-6 truncate",
                isUnread ? "font-semibold text-gray-800" : "font-normal text-gray-600"
              )}>
                {email.from || "Unknown Sender"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5">
                {email.date}
              </span>
              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </div>
          </div>

          {/* Subject line */}
          <p className={cn(
            "text-sm font-['Roboto'] leading-5 truncate",
            isUnread ? "font-semibold text-gray-800" : "font-normal text-gray-600"
          )}>
            {email.subject || "(No subject)"}
          </p>
        </div>

        {/* Snippet/Preview */}
        <p className="text-gray-600 text-sm font-normal font-['Roboto'] leading-5 line-clamp-1">
          {email.snippet || "No preview available"}
        </p>
      </div>
    </button>
  );
});

export default InboxList;
