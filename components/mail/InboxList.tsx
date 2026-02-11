"use client";

import React, { memo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { EnvelopeOpenIcon } from "@heroicons/react/24/solid"
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        "flex flex-col h-full relative overflow-hidden gap-5",
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
      <div className="hidden lg:flex relative z-20">
        <div className="self-stretch h-10 inline-flex justify-between items-center w-full">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "w-10 h-10 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center overflow-hidden",
              isRefreshing
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white hover:bg-gray-50"
            )}
          >
            <ArrowPathIcon
              className={cn(
                "h-4 w-4",
                isRefreshing ? "text-gray-300 animate-spin" : "text-gray-800"
              )}
            />
          </button>
          {userEmail && (
            <span className="text-base font-semibold font-['Roboto'] leading-6 text-gray-800 truncate max-w-[220px]">
              {userEmail}
            </span>
          )}
        </div>
      </div>

      {/* Loading indicator when refreshing */}
      {isRefreshing && emails.length > 0 && (
        <div className="self-stretch inline-flex justify-center items-center gap-1 py-2">
          <span className="text-primary-600 text-sm font-normal font-['Roboto'] leading-5">Loading</span>
          <ArrowPathIcon className="w-4 h-4 text-primary-600 animate-spin" />
        </div>
      )}

      {/* Email List with fade-in transition */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-y-auto relative pb-24 lg:pb-0",
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
              <ArrowPathIcon className="h-3 w-3 mr-1.5" />
              Try again
            </Button>
          </div>
        ) : emails.length === 0 ? (
          <div className={cn(
            "flex-1 mx-4 lg:mx-0 px-3 py-12 flex flex-col justify-center items-center h-full px-4 gap-3",
            // Frosted glass on mobile
            "rounded-2xl bg-white/70 backdrop-blur-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] border border-white/50",
            // Desktop styling
            "lg:rounded-xl lg:bg-white lg:backdrop-blur-none lg:shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] lg:outline lg:outline-1 lg:outline-offset-[-1px] lg:outline-gray-200 lg:border-none"
          )}>
            <div className="w-10 h-10 flex items-center justify-center">
              <EnvelopeOpenIcon className="w-9 h-9 text-gray-300" />
            </div>
            <div className="flex flex-col justify-start items-center gap-1">
              <p className="text-base font-medium text-gray-800 font-['Roboto'] leading-6">No Email Yet</p>
              <p className="text-center text-xs font-normal text-gray-600 font-['Roboto'] leading-5">
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
            className="w-full flex flex-col gap-2 px-4 lg:px-0"
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
        "w-full px-4 py-2 rounded-2xl flex justify-start items-center gap-2 transition-all",
        // Frosted glass effect on mobile
        "bg-white/70 backdrop-blur-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] border border-white/50",
        // Desktop styling
        "lg:bg-white lg:backdrop-blur-none lg:shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] lg:outline lg:outline-1 lg:outline-offset-[-1px] lg:outline-gray-200 lg:border-none lg:rounded-xl",
        // Unread state
        isUnread ? "lg:bg-white" : "lg:bg-gray-100",
        // Hover/focus states
        "hover:bg-white/90 lg:hover:bg-blue-100 focus:outline-none focus:bg-white/90 lg:focus:bg-blue-100",
        isSelected && "bg-white/90 lg:bg-blue-100"
      )}
    >
      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch inline-flex justify-start items-start gap-4">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
            {/* Top row: Sender + Time */}
            <div className="self-stretch inline-flex justify-between items-center">
              <span className={cn(
                "text-base font-['Roboto'] leading-6 truncate",
                isUnread ? "font-semibold text-gray-800" : "font-normal text-gray-600"
              )}>
                {email.from || "Unknown Sender"}
              </span>
              <div className="flex justify-end items-center gap-0.5">
                <span className={cn(
                  "text-xs font-['Roboto'] leading-5 line-clamp-1",
                  isUnread ? "font-semibold text-gray-800" : "font-normal text-gray-600"
                )}>
                  {email.date}
                </span>
                {isUnread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
            </div>

            {/* Subject line */}
            <p className={cn(
              "self-stretch text-sm font-['Roboto'] leading-5 truncate text-left",
              isUnread ? "font-semibold text-gray-800" : "font-normal text-gray-600"
            )}>
              {email.subject || "(No subject)"}
            </p>
          </div>
        </div>

        {/* Snippet/Preview */}
        <p className="self-stretch text-gray-600 text-sm font-normal font-['Roboto'] leading-5 line-clamp-1 text-left">
          {email.snippet || "No preview available"}
        </p>
      </div>
    </button>
  );
});

export default InboxList;


