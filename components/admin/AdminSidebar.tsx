"use client";

import React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore, PermissionKey } from "@/stores/useAuthStore";
import {
  UserGroupIcon as UserGroupOutlineIcon,
  FolderPlusIcon as FolderPlusOutlineIcon,
  PaperAirplaneIcon as PaperAirplaneOutlineIcon,
  RectangleGroupIcon as RectangleGroupOutlineIcon,
  DocumentPlusIcon as DocumentPlusOutlineIcon,
  InboxArrowDownIcon as InboxArrowDownOutlineIcon,
  DocumentCheckIcon as DocumentCheckOutlineIcon,
  DocumentTextIcon as DocumentTextOutlineIcon,
  KeyIcon as KeyOutlineIcon,
  Cog6ToothIcon as Cog6ToothOutlineIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/outline";
import {
  UserGroupIcon as UserGroupSolidIcon,
  FolderPlusIcon as FolderPlusSolidIcon,
  PaperAirplaneIcon as PaperAirplaneSolidIcon,
  RectangleGroupIcon as RectangleGroupSolidIcon,
  DocumentPlusIcon as DocumentPlusSolidIcon,
  InboxArrowDownIcon as InboxArrowDownSolidIcon,
  DocumentCheckIcon as DocumentCheckSolidIcon,
  DocumentTextIcon as DocumentTextSolidIcon,
  KeyIcon as KeySolidIcon,
  Cog6ToothIcon as Cog6ToothSolidIcon,
} from "@heroicons/react/20/solid";

interface MenuItem {
  id: string;
  label: string;
  iconOutline: React.ElementType;
  iconSolid: React.ElementType;
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
        iconOutline: RectangleGroupOutlineIcon,
        iconSolid: RectangleGroupSolidIcon,
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
        iconOutline: UserGroupOutlineIcon,
        iconSolid: UserGroupSolidIcon,
        href: "/admin",
        permission: "user_list",
      },
      {
        id: "create-single",
        label: "Create single",
        iconOutline: DocumentPlusOutlineIcon,
        iconSolid: DocumentPlusSolidIcon,
        href: "/admin/create-single-email",
        permission: "create_single",
      },
      {
        id: "create-bulk",
        label: "Create bulk",
        iconOutline: FolderPlusOutlineIcon,
        iconSolid: FolderPlusSolidIcon,
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
        iconOutline: InboxArrowDownOutlineIcon,
        iconSolid: InboxArrowDownSolidIcon,
        href: "/admin/manage-email",
        permission: "all_inbox",
      },
      {
        id: "all-sent",
        label: "All sent",
        iconOutline: PaperAirplaneOutlineIcon,
        iconSolid: PaperAirplaneSolidIcon,
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
        iconOutline: DocumentCheckOutlineIcon,
        iconSolid: DocumentCheckSolidIcon,
        href: "/admin/terms",
        permission: "terms_of_services",
      },
      {
        id: "privacy",
        label: "Privacy policy",
        iconOutline: DocumentTextOutlineIcon,
        iconSolid: DocumentTextSolidIcon,
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
        iconOutline: KeyOutlineIcon,
        iconSolid: KeySolidIcon,
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

  const isSettingsActive = pathname.startsWith("/admin/settings");
  const SettingsIcon = isSettingsActive
    ? Cog6ToothSolidIcon
    : Cog6ToothOutlineIcon;

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
        "w-full h-full p-4 bg-white rounded-xl",
        "shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)]",
        "outline outline-1 outline-offset-[-1px] outline-gray-200",
        "flex flex-col justify-start items-start gap-5"
      )}
    >
      {/* Logo */}
      <div className="inline-flex justify-start items-center gap-4">
        <Image
          src="/mailria.png"
          alt="Mailria"
          width={112}
          height={40}
          className="w-28 h-10"
          priority
        />
      </div>

      {/* Menu Content */}
      <div className="self-stretch flex-1 flex flex-col justify-between items-start">
        {/* Menu Groups */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          {filteredGroups.map((group) => (
            <React.Fragment key={group.title}>
              {/* Group Title */}
              <div className="justify-center text-gray-400 text-xs font-normal font-['Roboto'] leading-5">
                {group.title}
              </div>
              {/* Group Items */}
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = active ? item.iconSolid : item.iconOutline;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={cn(
                      "self-stretch px-3 py-1 inline-flex justify-between items-center",
                      active && "bg-blue-100 rounded-xl"
                    )}
                  >
                    <div className="flex-1 flex justify-start items-center gap-5">
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          active ? "text-primary-600" : "text-gray-600"
                        )}
                      />
                      <div
                        className={cn(
                          "justify-center text-sm font-['Roboto'] leading-5",
                          active
                            ? "text-primary-600 font-semibold"
                            : "text-gray-600 font-normal"
                        )}
                      >
                        {item.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          {/* Settings */}
          <button
            onClick={() => router.push("/admin/settings")}
            className={cn(
              "self-stretch px-3 py-1 inline-flex justify-between items-center",
              isSettingsActive && "bg-blue-100 rounded-xl"
            )}
          >
            <div className="flex-1 flex justify-start items-center gap-5">
              <SettingsIcon
                className={cn(
                  "w-5 h-5",
                  isSettingsActive ? "text-primary-600" : "text-gray-600"
                )}
              />
              <div
                className={cn(
                  "justify-center text-sm font-['Roboto'] leading-5",
                  isSettingsActive
                    ? "text-primary-600 font-semibold"
                    : "text-gray-600 font-normal"
                )}
              >
                Settings
              </div>
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="self-stretch px-3 py-1 inline-flex justify-between items-center"
          >
            <div className="flex-1 flex justify-start items-center gap-5">
              <ArrowRightStartOnRectangleIcon className="w-5 h-5 text-gray-600" />
              <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-5">
                Log out
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-300" />

          {/* User Info */}
          <div className="self-stretch px-3 py-1 bg-gray-100 rounded-xl inline-flex justify-center items-center gap-2.5">
            <div className="justify-center text-gray-800 text-base font-semibold font-['Roboto'] leading-6 truncate">
              {email || "Admin"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

