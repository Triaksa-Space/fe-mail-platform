"use client";

import React, { memo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { EnvelopeOpenIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import CenterTruncate from "@/components/ui/center-truncate";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}) => {
  // Use minimum loading time to prevent skeleton flicker
  const { shouldShowLoading, isTransitioning } = useMinimumLoading(isLoading, {
    minimumDuration: 300,
  });

  // Show full skeleton during initial load
  if (shouldShowLoading) {
    return (
      <InboxListSkeleton
        rowCount={10}
        showHeader={true}
        fullWidth={fullWidth}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full relative overflow-hidden gap-4",
        fullWidth
          ? "w-full"
          : "w-full lg:w-[clamp(360px,34vw,760px)] lg:border-r lg:border-neutral-200",
        className,
      )}
      aria-busy={isRefreshing}
    >
      {/* Mobile Header with Logo */}
      <div className="lg:hidden flex items-center justify-between relative z-20">
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
            <CenterTruncate
              side="right"
              className="text-neutral-800 text-sm font-semibold font-['Roboto'] leading-5"
            >
              {userEmail}
            </CenterTruncate>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "w-10 h-10 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 overflow-hidden",
              isRefreshing
                ? "bg-neutral-100 cursor-not-allowed"
                : "bg-white hover:bg-neutral-50",
            )}
            aria-label="Refresh"
          >
            <ArrowPathIcon
              className={cn(
                "w-[16.25px] h-[14.874px]",
                isRefreshing
                  ? "text-primary-500 animate-spin"
                  : "text-neutral-800",
              )}
            />
          </Button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex relative z-20">
        <div className="self-stretch h-10 inline-flex justify-between items-center w-full">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "w-10 h-10 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 overflow-hidden",
              isRefreshing
                ? "bg-neutral-100 cursor-not-allowed"
                : "bg-white hover:bg-neutral-50",
            )}
          >
            <ArrowPathIcon
              className={cn(
                "w-[16.25px] h-[14.874px]",
                isRefreshing
                  ? "text-primary-500 animate-spin"
                  : "text-neutral-800",
              )}
            />
          </Button>
          {userEmail && (
            <CenterTruncate
              side="right"
              className="text-base font-semibold font-['Roboto'] leading-6 text-neutral-800"
            >
              {userEmail}
            </CenterTruncate>
          )}
        </div>
      </div>

      {/* Loading indicator when refreshing */}
      {isRefreshing && emails.length > 0 && (
        <div className="self-stretch inline-flex justify-center items-center gap-1 py-2">
          <span className="text-primary-500 text-sm font-normal font-['Roboto'] leading-5">
            Loading
          </span>
          <ArrowPathIcon className="w-[16.25px] h-[14.874px] text-primary-500 animate-spin" />
        </div>
      )}

      {/* Email List with fade-in transition */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-y-auto relative mb-10 lg:mb-0 lg:pb-0",
          // Fade-in animation when transitioning from loading
          isTransitioning && "animate-fade-in",
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
              <ArrowPathIcon className="w-[16.25px] h-[14.874px] mr-1.5" />
              Try again
            </Button>
          </div>
        ) : emails.length === 0 ? (
          <div
            className={cn(
              "flex-1 w-full px-3 py-12 flex flex-col justify-center items-center gap-3",
              "rounded-xl border border-neutral-200 shadow-[0_1px_2px_0_rgba(16,24,40,0.04),0_1px_2px_0_rgba(16,24,40,0.04)]",
              "bg-gradient-to-b from-white via-white/90 to-transparent lg:bg-white",
            )}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <EnvelopeOpenIcon className="w-9 h-9 text-neutral-300" />
            </div>
            <div className="flex flex-col justify-start items-center gap-1">
              <p className="text-base font-medium text-neutral-800 font-['Roboto'] leading-6">
                No Email Yet
              </p>
              <p className="text-center text-xs font-normal text-neutral-600 font-['Roboto'] leading-5">
                There are no email in your inbox
                <br />
                at the moment.
              </p>
            </div>
          </div>
        ) : (
          <LazyList
            items={emails}
            batchSize={20}
            getItemKey={(email) => email.email_encode_id}
            className="w-full flex flex-col gap-2 lg:px-0"
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

const InboxRow: React.FC<InboxRowProps> = memo(function InboxRow({
  email,
  isSelected,
  onClick,
}) {
  const isUnread = email.unread;
  const displayDate = email.date
    .replace(/\bMinutes?\b/g, (match) => match.toLowerCase())
    .replace(/\bMins?\b/gi, (match) => match.toLowerCase())
    .replace(/(\d+)\s*M\b/g, "$1m");

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full h-auto px-4 py-2 rounded-xl flex justify-start items-center gap-2 min-w-0 whitespace-normal",
        "border border-neutral-200 shadow-[0_2px_6px_0_rgba(16,24,40,0.06)] transition-all",
        isUnread ? "bg-white" : "bg-neutral-100",
        "hover:bg-primary-50 focus:bg-primary-50",
        "ring-0 ring-offset-0 outline-none",
        "focus:ring-0 focus:ring-offset-0",
        "focus-visible:ring-0 focus-visible:ring-offset-0",
        !isUnread &&
          "hover:shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]",
        isSelected && "bg-primary-50",
      )}
    >
      <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch min-w-0 inline-flex justify-start items-start gap-4">
          <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-0.5">
            {/* Top row: Sender + Time */}
            <div className="w-full min-w-0 flex items-center">
              <span
                className={cn(
                  "min-w-0 text-left text-base font-['Roboto'] leading-6 truncate",
                  isUnread
                    ? "font-semibold text-neutral-800"
                    : "font-normal text-neutral-600",
                )}
              >
                {email.from || "Unknown Sender"}
              </span>
              <div className="ml-auto shrink-0 flex items-center justify-end gap-0.5 text-right">
                <span
                  className={cn(
                    "text-xs font-['Roboto'] leading-5 truncate",
                    isUnread
                      ? "font-semibold text-neutral-800"
                      : "font-normal text-neutral-600",
                  )}
                >
                  {displayDate}
                </span>
                {isUnread && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </div>
            </div>

            {/* Subject line */}
            <p
              className={cn(
                "w-full min-w-0 text-sm font-['Roboto'] leading-5 text-left whitespace-normal break-words",
                isUnread
                  ? "font-semibold text-neutral-800"
                  : "font-normal text-neutral-600",
              )}
            >
              {email.subject || "(No subject)"}
            </p>
          </div>
        </div>

        {/* Snippet/Preview */}
        <p className="w-full min-w-0 text-neutral-600 text-sm font-normal font-['Roboto'] leading-5 text-left whitespace-normal break-words">
          {email.snippet || "No preview available"}
        </p>
      </div>
    </Button>
  );
});

export default InboxList;
