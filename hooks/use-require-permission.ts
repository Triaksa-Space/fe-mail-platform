"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, PermissionKey } from "@/stores/useAuthStore";
import { toast } from "@/hooks/use-toast";

/** Returns the first page the current admin is allowed to access. */
function getDefaultAdminRoute(permissions: string[]): string {
  if (permissions.includes("overview")) return "/admin/overview";
  if (permissions.includes("user_list")) return "/admin";
  if (permissions.includes("all_inbox")) return "/admin/manage-email";
  if (permissions.includes("all_sent")) return "/admin/all-sent";
  if (permissions.includes("create_single")) return "/admin/create-single-email";
  if (permissions.includes("create_bulk")) return "/admin/create-bulk-email";
  if (permissions.includes("roles_permissions")) return "/admin/roles";
  if (permissions.includes("terms_of_services")) return "/admin/terms";
  if (permissions.includes("privacy_policy")) return "/admin/privacy";
  return "/admin";
}

/**
 * Hook that checks if the current admin has the required permission for a page.
 * Redirects to the first accessible page (based on permissions) if denied.
 */
export function useRequirePermission(permission: PermissionKey): { allowed: boolean } {
  const router = useRouter();
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const permissions = useAuthStore((state) => state.permissions);
  const roleId = useAuthStore((state) => state.roleId);
  const token = useAuthStore((state) => state.token);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;

    // User is logging out — skip permission check entirely
    if (!token) return;

    // SuperAdmin always has access
    if (roleId === 0) {
      setAllowed(true);
      return;
    }

    if (!hasPermission(permission)) {
      toast({
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      router.replace(getDefaultAdminRoute(permissions));
    } else {
      setAllowed(true);
    }
  }, [_hasHydrated, token, hasPermission, permissions, permission, roleId, router]);

  return { allowed };
}
