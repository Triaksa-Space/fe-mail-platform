"use client";

import React from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CARD_STYLES } from "@/lib/styles";
import { Button } from "@/components/ui/button";

interface AdminEmailListRowProps {
  primaryText: string;
  subject: string;
  snippet: string;
  sideText: string;
  dateText: string;
  isUnread?: boolean;
  isSelected?: boolean;
  isLast?: boolean;
  onClick?: () => void;
}

const AdminEmailListRow: React.FC<AdminEmailListRowProps> = ({
  primaryText,
  subject,
  snippet,
  sideText,
  dateText,
  isUnread = false,
  isSelected = false,
  isLast = false,
  onClick,
}) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        isSelected ? CARD_STYLES.selected : CARD_STYLES.interactive,
        "h-auto self-stretch w-full text-left px-4 py-2 inline-flex justify-start items-center gap-2 min-w-0",
        isLast && "outline-none shadow-none",
      )}
    >
      <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1">
        <div className="self-stretch min-w-0 inline-flex justify-between items-center gap-2">
          <div
            className={cn(
              "min-w-0 text-base font-['Roboto'] leading-6 truncate",
              isUnread
                ? "text-neutral-800 font-semibold"
                : "text-neutral-600 font-normal",
            )}
          >
            {primaryText}
          </div>
          <div className="flex shrink-0 justify-end items-center gap-0.5">
            <div
              className={cn(
                "max-w-[120px] text-xs font-['Roboto'] leading-5 truncate",
                isUnread
                  ? "text-neutral-800 font-semibold"
                  : "text-neutral-600 font-normal",
              )}
            >
              {dateText}
            </div>
            {isUnread && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
          </div>
        </div>

        <div className="self-stretch min-w-0 inline-flex justify-start items-start gap-2">
          <div className="flex-1 min-w-0 inline-flex flex-col justify-start items-start gap-1">
            <div
              className={cn(
                "self-stretch text-sm font-['Roboto'] leading-5 truncate",
                isUnread
                  ? "text-neutral-800 font-semibold"
                  : "text-neutral-600 font-normal",
              )}
            >
              {subject}
            </div>
            <div className="self-stretch text-neutral-600 text-sm font-normal font-['Roboto'] leading-5 truncate">
              {snippet}
            </div>
          </div>
          <div className="max-w-[180px] shrink-0 text-neutral-600 text-xs font-normal font-['Roboto'] leading-5 truncate">
            {sideText}
          </div>
        </div>
      </div>
    </Button>
  );
};

export const formatEmailListDate = (value?: string) =>
  value ? formatRelativeTime(value) : "";

export default AdminEmailListRow;
