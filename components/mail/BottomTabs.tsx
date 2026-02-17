"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  EnvelopeIcon as InboxOutlineIcon,
  PaperAirplaneIcon as PaperAirplaneOutlineIcon,
  Cog6ToothIcon as SettingsOutlineIcon,
  ArrowLeftEndOnRectangleIcon as LogoutOutlineIcon,
} from "@heroicons/react/24/outline";
import {
  EnvelopeIcon as InboxSolidIcon,
  PaperAirplaneIcon as PaperAirplaneSolidIcon,
  Cog6ToothIcon as SettingsSolidIcon,
} from "@heroicons/react/24/solid";
import { ViewType } from "./types";

interface BottomTabsProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  unreadCount?: number;
  className?: string;
}

const BottomTabs: React.FC<BottomTabsProps> = ({
  currentView,
  onViewChange,
  onLogout,
  unreadCount = 0,
  className,
}) => {
  return (
    <div
      className={cn(
        "fixed bottom-4 left-0 right-0 z-50 flex justify-center items-center",
        "lg:hidden", // Hide on desktop
        className
      )}
    >
      <nav
        className="flex items-center justify-start px-4 py-2 gap-5 rounded-xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.12)]"
      >
        {/* Inbox tab */}
        <Button
          variant="ghost"
          onClick={() => onViewChange("inbox")}
          className={cn(
            "w-14 h-auto flex flex-col items-center justify-center gap-0.5 relative px-0 py-0",
            currentView === "inbox"
              ? "text-primary-500 hover:text-primary-500"
              : "text-neutral-600 hover:text-neutral-600"
          )}
        >
          <div className="relative w-[20px] h-[20px]">
            {currentView === "inbox" ? (
              <InboxSolidIcon className="!w-[20px] !h-[20px]" />
            ) : (
              <InboxOutlineIcon className="!w-[20px] !h-[20px]" />
            )}
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-2 flex w-4 h-4 p-[2px] justify-center items-center aspect-square rounded-[40px] text-white text-[10px] font-semibold leading-none"
                style={{ background: "var(--destructive-500-main, #EF4444)" }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <span className={cn(
            "w-14 text-center text-sm font-['Roboto'] leading-5",
            currentView === "inbox" ? "font-semibold" : "font-normal"
          )}>Inbox</span>
        </Button>

        {/* Sent tab */}
        <Button
          variant="ghost"
          onClick={() => onViewChange("sent")}
          className={cn(
            "w-14 h-auto flex flex-col items-center justify-center gap-0.5 px-0 py-0",
            currentView === "sent"
              ? "text-primary-500 hover:text-primary-500"
              : "text-neutral-600 hover:text-neutral-600"
          )}
        >
          {currentView === "sent" ? (
            <PaperAirplaneSolidIcon className="!w-[20px] !h-[20px]" />
          ) : (
            <PaperAirplaneOutlineIcon className="!w-[20px] !h-[20px]" />
          )}
          <span className={cn(
            "w-14 text-center text-sm font-['Roboto'] leading-5",
            currentView === "sent" ? "font-semibold" : "font-normal"
          )}>Sent</span>
        </Button>

        {/* Settings tab */}
        <Button
          variant="ghost"
          onClick={() => onViewChange("settings")}
          className={cn(
            "w-14 h-auto flex flex-col items-center justify-center gap-0.5 px-0 py-0",
            currentView === "settings"
              ? "text-primary-500 hover:text-primary-500"
              : "text-neutral-600 hover:text-neutral-600"
          )}
        >
          {currentView === "settings" ? (
            <SettingsSolidIcon className="!w-[20px] !h-[20px]" />
          ) : (
            <SettingsOutlineIcon className="!w-[20px] !h-[20px]" />
          )}
          <span className={cn(
            "w-14 text-center text-sm font-['Roboto'] leading-5",
            currentView === "settings" ? "font-semibold" : "font-normal"
          )}>Settings</span>
        </Button>

        {/* Logout tab */}
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-14 h-auto flex flex-col items-center justify-center gap-0.5 text-neutral-600 hover:text-neutral-600 px-0 py-0"
        >
          <LogoutOutlineIcon className="!w-[20px] !h-[20px]" />
          <span className="w-14 text-center text-sm font-normal font-['Roboto'] leading-5">Logout</span>
        </Button>
      </nav>
    </div>
  );
};

export default BottomTabs;



