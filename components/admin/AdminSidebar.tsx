"use client";

import React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore, PermissionKey } from "@/stores/useAuthStore";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UsersRound,
  Inbox,
  Send,
  FileText,
  Shield,
  Settings,
  LogOut,
  Lock,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  permission?: PermissionKey; // Required permission to see this menu item
  superAdminOnly?: boolean;   // Only SuperAdmin can see (e.g., roles_permissions)
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

// Menu configuration with permission mapping
const menuGroups: MenuGroup[] = [
  {
    title: "Dashboard",
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        href: "/admin/overview",
        permission: "overview",
      },
    ],
  },
  {
    title: "User Management",
    items: [
      {
        id: "users",
        label: "User list",
        icon: Users,
        href: "/admin",
        permission: "user_list",
      },
      {
        id: "create-single",
        label: "Create single",
        icon: UserPlus,
        href: "/admin/create-single-email",
        permission: "create_single",
      },
      {
        id: "create-bulk",
        label: "Create bulk",
        icon: UsersRound,
        href: "/admin/create-bulk-email",
        permission: "create_bulk",
      },
    ],
  },
  {
    title: "Email Analytics",
    items: [
      {
        id: "all-inbox",
        label: "All inbox",
        icon: Inbox,
        href: "/admin/manage-email",
        permission: "all_inbox",
      },
      {
        id: "all-sent",
        label: "All sent",
        icon: Send,
        href: "/admin/all-sent",
        permission: "all_sent",
      },
    ],
  },
  {
    title: "Legal & Policies",
    items: [
      {
        id: "terms",
        label: "Terms of services",
        icon: FileText,
        href: "/admin/terms",
        permission: "terms_of_services",
      },
      {
        id: "privacy",
        label: "Privacy policy",
        icon: Shield,
        href: "/admin/privacy",
        permission: "privacy_policy",
      },
    ],
  },
  {
    title: "Admin Management",
    items: [
      {
        id: "roles",
        label: "Roles & permissions",
        icon: Lock,
        href: "/admin/roles",
        permission: "roles_permissions",
        superAdminOnly: true, // Only SuperAdmin can access
      },
    ],
  },
];

const AdminSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { roleId, email, permissions, logout, _hasHydrated } = useAuthStore();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname.startsWith("/admin/user");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Check permission - SuperAdmin (roleId=0) has all permissions
  const checkPermission = (permission: PermissionKey): boolean => {
    // SuperAdmin bypasses all permission checks
    if (roleId === 0) return true;
    // Check if permission exists in array
    return permissions.includes(permission);
  };

  const handleNavigation = (item: MenuItem) => {
    // Check permission before navigation
    if (item.superAdminOnly && roleId !== 0) {
      return;
    }
    if (item.permission && !checkPermission(item.permission)) {
      return;
    }
    router.push(item.href);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Filter menu groups based on permissions
  // If not hydrated yet or roleId is null, show all menus for SuperAdmin/Admin
  const filteredGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // If store hasn't hydrated yet, show all non-superAdmin items
        if (!_hasHydrated || roleId === null) {
          return !item.superAdminOnly;
        }

        // SuperAdmin-only items
        if (item.superAdminOnly && roleId !== 0) {
          return false;
        }

        // SuperAdmin sees everything
        if (roleId === 0) {
          return true;
        }

        // Check permission for regular admins
        if (item.permission) {
          return checkPermission(item.permission);
        }

        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "flex h-full flex-col items-start gap-5",
        "rounded-xl border border-gray-200 bg-white p-4",
        "shadow-[0_2px_6px_0_rgba(16,24,40,0.06)]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 py-3">
        <Image
          src="/mailria.png"
          alt="Mailria"
          width={140}
          height={36}
          className="h-9 w-auto"
          priority
        />
      </div>

      {/* Menu Groups */}
      <nav className="flex-1 w-full space-y-5 overflow-y-auto">
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {/* Group Title */}
            <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {group.title}
            </p>
            {/* Group Items */}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="w-full border-t border-gray-100 pt-4 space-y-1">
        {/* Settings */}
        <button
          onClick={() => router.push("/admin/settings")}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/admin/settings")
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </button>

        {/* User Display */}
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-semibold text-blue-600">
              {email?.charAt(0)?.toUpperCase() || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {email || "Admin"}
            </p>
            <p className="text-xs text-gray-500">
              {roleId === 0 ? "Super Admin" : "Admin"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
