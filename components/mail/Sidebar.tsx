"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Inbox,
  Send,
  Settings,
  LogOut,
  PenSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewType } from "./types";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onCompose: () => void;
  onLogout: () => void;
  userEmail?: string;
  sentCount?: number;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onCompose,
  onLogout,
  userEmail,
  sentCount = 0,
  className,
}) => {
  const navItems = [
    { id: "inbox" as ViewType, label: "Inbox", icon: Inbox },
    { id: "sent" as ViewType, label: "Sent", icon: Send, badge: `${sentCount}/3` },
    { id: "settings" as ViewType, label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200",
        "w-[260px] lg:w-[280px]",
        className
      )}
    >
      {/* User Email Header */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-900 truncate">
          {userEmail || "user@mailria.com"}
        </p>
      </div>

      {/* Compose Button */}
      <div className="p-4">
        <Button
          onClick={onCompose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-medium shadow-sm"
        >
          <PenSquare className="w-4 h-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
