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
  className?: string;
}

const BottomTabs: React.FC<BottomTabsProps> = ({
  currentView,
  onViewChange,
  onLogout,
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
        className="flex items-center justify-start px-4 py-2 gap-4 rounded-xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.12)]"
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
          {currentView === "inbox" ? (
            <InboxSolidIcon className="w-5 h-5" />
          ) : (
            <InboxOutlineIcon className="w-5 h-5" />
          )}
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
            <PaperAirplaneSolidIcon className="w-5 h-5" />
          ) : (
            <PaperAirplaneOutlineIcon className="w-5 h-5" />
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
            <SettingsSolidIcon className="w-5 h-5" />
          ) : (
            <SettingsOutlineIcon className="w-5 h-5" />
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
          <LogoutOutlineIcon className="w-5 h-5" />
          <span className="w-14 text-center text-sm font-normal font-['Roboto'] leading-5">Logout</span>
        </Button>
      </nav>
    </div>
  );
};

export default BottomTabs;



