"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Inbox,
  Send,
  Settings,
  LogOut,
} from "lucide-react";
import { ViewType } from "./types";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  sentCount?: number;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onLogout,
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
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200">
        <Image
          src="/mailria.png"
          alt="Mailria"
          width={140}
          height={36}
          className="h-9 w-auto"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-3 space-y-1">
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
