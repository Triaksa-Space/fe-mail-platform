"use client";

import React, { memo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SentMail } from "./types";
import { InboxListSkeleton } from "./InboxListSkeleton";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";
import { LazyList } from "@/components/VirtualList";
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import { EnvelopeOpenIcon } from "@heroicons/react/24/solid"

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
  isComposeOpen?: boolean;
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
  isComposeOpen = false,
}) => {
  const { shouldShowLoading, isTransitioning } = useMinimumLoading(isLoading, {
    minimumDuration: 300,
  });

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
        <div className="h-10 flex items-center justify-between w-full">
          {onCompose && (
            <Button
              onClick={onCompose}
              className="h-10 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-blue-600 text-white"
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

      {/* Loading indicator when refreshing */}
      {isRefreshing && emails.length > 0 && (
        <div className="self-stretch inline-flex justify-center items-center gap-1 py-2">
          <span className="text-blue-600 text-sm font-normal font-['Roboto'] leading-5">Loading</span>
          <ArrowPathIcon className="w-4 h-4 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Email List */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-y-auto relative lg:pb-0",
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
            "flex-1 mx-4 lg:mx-0 px-3 py-12 flex flex-col justify-center items-center gap-3",
            // Frosted glass on mobile
            "rounded-2xl bg-white/70 backdrop-blur-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] border border-white/50",
            // Desktop styling
            "lg:rounded-xl lg:bg-white lg:backdrop-blur-none lg:shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] lg:outline lg:outline-1 lg:outline-offset-[-1px] lg:outline-gray-200 lg:border-none"
          )}>
            <div className="w-10 h-10 flex items-center justify-center">
              <EnvelopeOpenIcon className="w-9 h-9 text-gray-300" />
            </div>
            <div className="flex flex-col justify-start items-center gap-1">
              <p className="text-base font-medium text-gray-800 font-['Roboto'] leading-6">No Outgoing Email</p>
              <p className="text-center text-xs font-normal text-gray-600 font-['Roboto'] leading-5">
                Emails you send will appear here
              </p>
            </div>
          </div>
        ) : (
          <LazyList
            items={emails}
            batchSize={20}
            getItemKey={(email) => email.id}
            className="w-full flex flex-col gap-2 px-4 lg:px-0"
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

      {/* Mobile Floating Compose Button - hidden when compose modal is open */}
      {onCompose && !isComposeOpen && (
        <button
          onClick={onCompose}
          className="lg:hidden fixed right-4 bottom-24 z-[60] h-10 px-4 py-2.5 bg-blue-600 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-blue-600 inline-flex justify-center items-center gap-1.5 hover:bg-blue-700 transition-colors"
        >
          <PenSquare className="w-5 h-5 text-white" />
          <span className="text-center text-white text-base font-medium font-['Roboto'] leading-4">Compose</span>
        </button>
      )}
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
        "w-full px-4 py-2 rounded-2xl inline-flex justify-start items-center gap-2 transition-all",
        // Frosted glass effect on mobile
        "bg-white/70 backdrop-blur-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] border border-white/50",
        // Desktop styling
        "lg:bg-gray-100 lg:backdrop-blur-none lg:shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] lg:outline lg:outline-1 lg:outline-offset-[-1px] lg:outline-gray-200 lg:border-none lg:rounded-xl",
        // Hover/focus states
        "hover:bg-white/90 lg:hover:bg-blue-100 focus:outline-none focus:bg-white/90 lg:focus:bg-blue-100",
        isSelected && "bg-white/90 lg:bg-blue-100"
      )}
    >
      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch inline-flex justify-start items-start gap-4">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
            {/* Top row: To + Time */}
            <div className="self-stretch inline-flex justify-between items-center">
              <div className="flex items-center gap-0.5">
                <span className="text-gray-600 text-base font-normal font-['Roboto'] leading-6">To:</span>
                <span className="text-gray-600 text-base font-normal font-['Roboto'] leading-6 truncate">
                  {email.to || "Unknown"}
                </span>
              </div>
              <span className="text-gray-600 text-xs font-normal font-['Roboto'] leading-5 line-clamp-1">
                {email.date}
              </span>
            </div>

            {/* Subject line */}
            <p className="self-stretch text-gray-600 text-sm font-normal font-['Roboto'] leading-5 truncate text-left">
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

export default SentList;
