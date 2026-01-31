"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { LayoutDashboard, UserPlus, UsersRound, Settings } from "lucide-react";

const AdminMobileNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { roleId } = useAuthStore();

  const isAdminActive = pathname === "/admin" || pathname.startsWith("/admin/user");

  const allowedPathsForRole2 = [
    "/admin",
    "/admin/create-single-email",
    "/admin/create-bulk-email",
  ];

  const handleNavigation = (path: string) => {
    if (roleId === 2) {
      if (allowedPathsForRole2.includes(path)) {
        router.push(path);
      } else {
        router.push("/admin/settings/account");
      }
    } else {
      router.push(path);
    }
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
      isActive: isAdminActive,
    },
    {
      id: "create-single",
      label: "Create Single",
      icon: UserPlus,
      path: "/admin/create-single-email",
      isActive: pathname === "/admin/create-single-email",
    },
    {
      id: "create-bulk",
      label: "Create Bulk",
      icon: UsersRound,
      path: "/admin/create-bulk-email",
      isActive: pathname === "/admin/create-bulk-email",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/admin/settings",
      isActive: pathname === "/admin/settings" || pathname === "/admin/settings/account",
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white lg:hidden z-50">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 transition-colors",
                item.isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              )}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

export default AdminMobileNav;
