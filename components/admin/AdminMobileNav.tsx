"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore, PermissionKey } from "@/stores/useAuthStore";
import { LayoutDashboard, Users, UserPlus, Settings, Lock } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  permission?: PermissionKey;
  superAdminOnly?: boolean;
}

const AdminMobileNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { roleId, permissions, _hasHydrated } = useAuthStore();

  const isUserListActive = pathname === "/admin" || pathname.startsWith("/admin/user");
  const isRolesActive = pathname === "/admin/roles" || pathname.startsWith("/admin/roles/");

  // Check permission - SuperAdmin (roleId=0) has all permissions
  const checkPermission = (permission: PermissionKey): boolean => {
    if (roleId === 0) return true;
    return permissions.includes(permission);
  };

  const handleNavigation = (item: NavItem) => {
    if (item.superAdminOnly && roleId !== 0) {
      return;
    }
    if (item.permission && !checkPermission(item.permission)) {
      return;
    }
    router.push(item.path);
  };

  // Define all nav items with permissions
  const allNavItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/overview",
      permission: "overview",
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      path: "/admin",
      permission: "user_list",
    },
    {
      id: "create",
      label: "Create",
      icon: UserPlus,
      path: "/admin/create-single-email",
      permission: "create_single",
    },
    {
      id: "roles",
      label: "Roles",
      icon: Lock,
      path: "/admin/roles",
      permission: "roles_permissions",
      superAdminOnly: true,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/admin/settings",
      // Settings is always visible to all admins
    },
  ];

  // Filter nav items based on permissions
  const navItems = allNavItems.filter((item) => {
    // If store hasn't hydrated yet, show all non-superAdmin items
    if (!_hasHydrated || roleId === null) {
      return !item.superAdminOnly;
    }

    if (item.superAdminOnly && roleId !== 0) {
      return false;
    }

    // SuperAdmin sees everything
    if (roleId === 0) {
      return true;
    }

    if (item.permission) {
      return checkPermission(item.permission);
    }
    return true;
  });

  // Determine active state for each item
  const getIsActive = (item: NavItem): boolean => {
    if (item.id === "users") {
      return isUserListActive;
    }
    if (item.id === "roles") {
      return isRolesActive;
    }
    if (item.id === "settings") {
      return pathname === "/admin/settings" || pathname === "/admin/settings/account";
    }
    return pathname === item.path || pathname.startsWith(item.path + "/");
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white lg:hidden z-50">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item);
          return (
            <button
              key={item.id}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 transition-colors",
                isActive
                  ? "bg-blue-50 text-primary-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              )}
              onClick={() => handleNavigation(item)}
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
