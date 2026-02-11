"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Inbox, Settings, LogOut } from "lucide-react";
import { ViewType } from "./types";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"

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
        className="flex items-center justify-start px-4 py-2 gap-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.12)]"
      >
        {/* Inbox tab */}
        <button
          onClick={() => onViewChange("inbox")}
          className={cn(
            "w-14 flex flex-col items-center justify-center gap-0.5 relative",
            currentView === "inbox"
              ? "text-primary-500"
              : "text-gray-600 hover:text-gray-700"
          )}
        >
          <Inbox className="w-5 h-5" />
          <span className={cn(
            "w-14 text-center text-sm font-['Roboto'] leading-5",
            currentView === "inbox" ? "font-semibold" : "font-normal"
          )}>Inbox</span>
        </button>

        {/* Sent tab */}
        <button
          onClick={() => onViewChange("sent")}
          className={cn(
            "w-14 flex flex-col items-center justify-center gap-0.5",
            currentView === "sent"
              ? "text-primary-500"
              : "text-gray-600 hover:text-gray-700"
          )}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          <span className={cn(
            "w-14 text-center text-sm font-['Roboto'] leading-5",
            currentView === "sent" ? "font-semibold" : "font-normal"
          )}>Sent</span>
        </button>

        {/* Settings tab */}
        <button
          onClick={() => onViewChange("settings")}
          className={cn(
            "w-14 flex flex-col items-center justify-center gap-0.5",
            currentView === "settings"
              ? "text-primary-500"
              : "text-gray-600 hover:text-gray-700"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className={cn(
            "w-14 text-center text-sm font-['Roboto'] leading-5",
            currentView === "settings" ? "font-semibold" : "font-normal"
          )}>Settings</span>
        </button>

        {/* Logout tab */}
        <button
          onClick={onLogout}
          className="w-14 flex flex-col items-center justify-center gap-0.5 text-gray-600 hover:text-gray-700"
        >
          <LogOut className="w-5 h-5" />
          <span className="w-14 text-center text-sm font-normal font-['Roboto'] leading-5">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default BottomTabs;



