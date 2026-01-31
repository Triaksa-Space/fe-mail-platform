"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mail } from "./types";

interface InboxListProps {
  emails: Mail[];
  selectedId: string | null;
  onSelect: (email: Mail) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  className?: string;
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
}) => {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200",
        "w-full lg:w-[360px] xl:w-[420px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
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

      {/* Refreshing indicator */}
      {isRefreshing && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-xs text-blue-600 text-center">Refreshing...</p>
        </div>
      )}

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading emails...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32 px-4">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 px-4">
            <p className="text-sm text-gray-500 text-center">No emails found</p>
            <button
              onClick={onRefresh}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {emails.map((email) => (
              <MailRow
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

// Individual mail row component
interface MailRowProps {
  email: Mail;
  isSelected: boolean;
  onClick: () => void;
}

const MailRow: React.FC<MailRowProps> = ({ email, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 transition-colors",
        "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
        isSelected && "bg-blue-50 hover:bg-blue-50",
        email.unread && "bg-blue-50/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        <div className="mt-2 flex-shrink-0">
          {email.unread ? (
            <div className="w-2 h-2 rounded-full bg-blue-600" />
          ) : (
            <div className="w-2 h-2" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-sm truncate",
                email.unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"
              )}
            >
              {email.from}
            </span>
            <span className="text-xs text-gray-500 flex-shrink-0">{email.date}</span>
          </div>
          <p
            className={cn(
              "text-sm truncate mt-0.5",
              email.unread ? "font-medium text-gray-900" : "text-gray-700"
            )}
          >
            {email.subject}
          </p>
          <p className="text-sm text-gray-500 truncate mt-0.5">{email.snippet}</p>
        </div>
      </div>
    </button>
  );
};

export default InboxList;
