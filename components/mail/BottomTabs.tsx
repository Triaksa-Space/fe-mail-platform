"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Inbox, Send, Settings, LogOut } from "lucide-react";
import { ViewType } from "./types";

interface BottomTabsProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onCompose: () => void;
  onLogout: () => void;
  className?: string;
}

const BottomTabs: React.FC<BottomTabsProps> = ({
  currentView,
  onViewChange,
  onCompose,
  onLogout,
  className,
}) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2",
        "lg:hidden", // Hide on desktop
        className
      )}
    >
      <nav
        className="flex items-center justify-around bg-white rounded-xl border border-gray-200 px-2 py-2"
        style={{
          boxShadow: "0 2px 6px rgba(16, 24, 40, 0.06)",
        }}
      >
        {/* Inbox tab */}
        <button
          onClick={() => onViewChange("inbox")}
          className={cn(
            "flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors",
            currentView === "inbox"
              ? "bg-blue-50 text-blue-600"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          )}
        >
          <Inbox className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">Inbox</span>
        </button>

        {/* Send tab - opens compose modal */}
        <button
          onClick={onCompose}
          className={cn(
            "flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors",
            "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          )}
        >
          <Send className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">Send</span>
        </button>

        {/* Settings tab */}
        <button
          onClick={() => onViewChange("settings")}
          className={cn(
            "flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors",
            currentView === "settings"
              ? "bg-blue-50 text-blue-600"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">Settings</span>
        </button>

        {/* Logout tab */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center py-2 px-4 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs mt-1 font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default BottomTabs;
