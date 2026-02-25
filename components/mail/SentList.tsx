"use client";

import React, { memo } from "react";
import Image from "next/image";
import { cn, formatRelativeTime } from "@/lib/utils";
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import CenterTruncate from "@/components/ui/center-truncate";
import { SentMail } from "./types";
import { InboxListSkeleton } from "./InboxListSkeleton";
import { useMinimumLoading } from "@/hooks/use-minimum-loading";
import { LazyList } from "@/components/VirtualList";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { EnvelopeOpenIcon } from "@heroicons/react/24/solid";
import { useRelativeTimeTicker } from "@/hooks/use-relative-time-ticker";

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
  useRelativeTimeTicker();

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
        "flex flex-col h-full relative overflow-hidden gap-4",
        fullWidth
          ? "w-full max-w-none"
          : "w-full lg:w-[360px] xl:w-[420px] lg:border-r lg:border-neutral-200",
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
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex relative z-20">
        <div className="self-stretch h-10 inline-flex justify-between items-center w-full">
          <div className="inline-flex items-center gap-2">
            {onCompose && (
              <Button onClick={onCompose} className="h-10 px-4 py-2.5 rounded-lg btn-primary-skin gap-1.5">
                <PenSquare className="h-4 w-4 text-white" />
                <span className="text-base font-medium leading-4">
                  Compose
                </span>
              </Button>
            )}
          </div>
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

      {/* Email List */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-y-auto relative mb-10 lg:mb-0 lg:pb-0",
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
              <p className="text-base font-medium text-neutral-800 font-['Roboto'] leading-6">No Outgoing Email</p>
              <p className="text-center text-xs font-normal text-neutral-600 font-['Roboto'] leading-5">
                Emails you send will appear here
              </p>
            </div>
          </div>
        ) : (
          <LazyList
            items={emails}
            batchSize={20}
            getItemKey={(email) => email.id}
            className="w-full flex flex-col gap-2 lg:px-0"
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
        <Button
          onClick={onCompose}
          className="lg:hidden fixed right-4 bottom-24 z-[60] h-10 px-4 py-2.5 rounded-lg btn-primary-skin gap-1.5 transition-colors"
        >
          <PenSquare className="w-5 h-5 text-white" />
          <span className="text-center text-white text-base font-medium font-['Roboto'] leading-4">Compose</span>
        </Button>
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

const cleanSentSubject = (subject?: string) => {
  if (!subject) return "(No subject)";
  const cleaned = subject.replace(/^(?:\s*fwd:\s*)+/i, "").trim();
  return cleaned || "(No subject)";
};

const SentRow: React.FC<SentRowProps> = memo(function SentRow({ email, isSelected, onClick }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
        className={cn(
          "w-full h-auto px-4 py-2 rounded-xl flex justify-start items-center gap-2 min-w-0 whitespace-normal",
          "border border-neutral-200 bg-white shadow-[0_2px_6px_0_rgba(16,24,40,0.06)]",
          "transition-all",
          "hover:bg-primary-50 focus:bg-primary-50",
          "ring-0 ring-offset-0 outline-none",
          "focus:ring-0 focus:ring-offset-0",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
          isSelected && "bg-primary-50",
        )}
    >
      <div className="flex-1 min-w-0 flex w-full flex-col justify-start items-start gap-1">
        <div className="self-stretch min-w-0 flex w-full justify-start items-start gap-4">
          <div className="flex-1 min-w-0 flex w-full flex-col justify-start items-start gap-0.5">
            {/* Top row: To + Time */}
            <div className="self-stretch min-w-0 flex w-full justify-between items-center gap-2">
              <div className="flex-1 min-w-0 flex items-center gap-0.5">
                <span className="text-neutral-600 text-base font-normal font-['Roboto'] leading-6">To:</span>
                <span className="min-w-0 truncate text-neutral-600 text-base font-normal font-['Roboto'] leading-6">
                  {email.to || "Unknown"}
                </span>
              </div>
              <span className="shrink-0 text-neutral-600 text-xs font-normal font-['Roboto'] leading-5 truncate">
                {email.sent_at ? formatRelativeTime(email.sent_at) : email.date}
              </span>
            </div>

            {/* Subject line */}
            <p className="w-full min-w-0 text-neutral-600 text-sm font-normal font-['Roboto'] leading-5 truncate text-left">
              {cleanSentSubject(email.subject)}
            </p>
          </div>
        </div>

        {/* Snippet/Preview */}
        <p className="w-full min-w-0 text-neutral-600 text-sm font-normal font-['Roboto'] leading-5 truncate text-left">
          {email.snippet || "No preview available"}
        </p>
      </div>
    </Button>
  );
});

export default SentList;



