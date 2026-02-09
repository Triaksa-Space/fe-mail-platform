"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  EnvelopeIcon as EnvelopeIconSolid,
  PaperAirplaneIcon as PaperAirplaneIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from "@heroicons/react/20/solid";
import { ViewType } from "./types";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  sentCount?: number;
  unreadCount?: number;
  className?: string;
  userEmail?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onLogout,
  unreadCount = 0,
  className,
}) => {
  const navItems = [
    { id: "inbox" as ViewType, label: "Inbox", icon: EnvelopeIcon, iconSolid: EnvelopeIconSolid, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: "sent" as ViewType, label: "Sent", icon: PaperAirplaneIcon, iconSolid: PaperAirplaneIconSolid },
    { id: "settings" as ViewType, label: "Settings", icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
  ];

  return (
    <aside
      className={cn(
        "w-[240px] h-full p-4 bg-white rounded-xl",
        "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
        "outline outline-1 outline-offset-[-1px] outline-gray-200",
        "flex flex-col justify-start items-start gap-5 shrink-0",
        className
      )}
    >
      {/* Logo */}
      <div className="inline-flex justify-start items-center gap-4">
        <Image
          src="/mailria.png"
          alt="Mailria"
          width={112}
          height={40}
          className="h-10 w-28"
          priority
        />
      </div>

      {/* Menu Content */}
      <div className="self-stretch flex-1 flex flex-col justify-between items-start">
        {/* Navigation */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const IconComponent = isActive ? item.iconSolid : item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "self-stretch px-3 py-1 inline-flex justify-between items-center transition-colors",
                  isActive && "bg-blue-100 rounded-xl"
                )}
              >
                <div className="flex-1 flex justify-start items-center gap-5">
                  <IconComponent
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-primary-600" : "text-gray-600"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-['Roboto'] leading-5",
                      isActive
                        ? "text-primary-600 font-semibold"
                        : "text-gray-600 font-normal"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <div className="w-4 h-4 p-0.5 bg-red-500 rounded-[40px] flex justify-center items-center">
                    <span className="text-center text-red-50 text-[10px] font-medium font-['Roboto'] leading-4">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          {/* Logout */}
          <button
            onClick={onLogout}
            className="self-stretch h-9 px-4 py-2.5 bg-white rounded-lg shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-red-200 inline-flex justify-center items-center gap-2 overflow-hidden hover:bg-red-50 transition-colors"
          >
            <span className="text-center text-red-500 text-base font-medium font-['Roboto'] leading-4">
              Log out
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
