"use client";

import React, { memo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { RefreshCw, Send, PenSquare } from "lucide-react";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        "flex flex-col h-full bg-gray-50 relative overflow-hidden",
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
          {onCompose && (
            <Button
              onClick={onCompose}
              className="h-10 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-sky-600 text-white"
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
        <div className="px-4 py-2 bg-blue-50/80 border-b border-blue-100 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <ArrowPathIcon className="h-3 w-3 animate-spin text-blue-600" />
            <span className="text-xs text-blue-600">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Email List */}
      <div
        className={cn(
          "flex-1 overflow-y-auto relative px-4 pb-24 lg:pb-4",
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
          <div className="flex-1 py-12 flex items-start justify-center">
            <div className="w-full bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 px-3 py-12 flex flex-col justify-center items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <PaperAirplaneIcon className="w-9 h-9 text-gray-300" />
              </div>
              <div className="flex flex-col justify-start items-center gap-1">
                <p className="text-base font-medium text-gray-800">No Sent Email Yet</p>
                <p className="text-center text-xs font-normal text-gray-600 leading-5">
                  Emails you send will appear here
                </p>
              </div>
            </div>
          </div>
        ) : (
          <LazyList
            items={emails}
            batchSize={20}
            getItemKey={(email) => email.id}
            className="flex flex-col gap-2"
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

      {/* Mobile Floating Compose Button */}
      {onCompose && (
        <button
          onClick={onCompose}
          className="lg:hidden fixed right-4 bottom-24 z-[60] h-10 px-4 py-2.5 bg-sky-600 rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-sky-600 inline-flex justify-center items-center gap-1.5 hover:bg-sky-700 transition-colors"
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
        "w-full text-left px-4 py-2 transition-colors",
        "rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200",
        "bg-white hover:bg-sky-100 focus:outline-none focus:bg-sky-100",
        isSelected && "bg-sky-100"
      )}
    >
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex flex-col gap-0.5">
          {/* Top row: To + Time */}
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center gap-0.5">
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
          <p className="text-gray-600 text-sm font-normal font-['Roboto'] leading-5 truncate">
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

export default SentList;
