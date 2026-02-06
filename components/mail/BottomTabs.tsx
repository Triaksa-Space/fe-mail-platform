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
        "fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center py-2",
        "lg:hidden", // Hide on desktop
        className
      )}
    >
      {/* Background decorative blur - positioned behind the menu */}
      <div className="absolute w-[5000px] h-[100px] left-[-2305px] bottom-0 bg-blue-100 rounded-full blur-[32px] pointer-events-none -z-10" />

      <nav
        className="flex items-center justify-start bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 px-4 py-2 gap-4"
        style={{
          boxShadow: "0 2px 6px rgba(16, 24, 40, 0.06)",
        }}
      >
        {/* Inbox tab */}
        <button
          onClick={() => onViewChange("inbox")}
          className={cn(
            "w-14 flex flex-col items-center justify-center gap-0.5 relative",
            currentView === "inbox"
              ? "text-blue-600"
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
              ? "text-blue-600"
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
              ? "text-blue-600"
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
