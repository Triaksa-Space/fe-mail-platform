"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, PermissionKey } from "@/stores/useAuthStore";
import { toast } from "@/hooks/use-toast";

/**
 * Hook that checks if the current admin has the required permission for a page.
 * Redirects to /admin with a toast if the permission is denied.
 */
export function useRequirePermission(permission: PermissionKey): { allowed: boolean } {
  const router = useRouter();
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const token = useAuthStore((state) => state.token);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;

    // User is logging out — skip permission check entirely
    if (!token) return;

    if (!hasPermission(permission)) {
      toast({
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      router.replace("/admin");
    } else {
      setAllowed(true);
    }
  }, [_hasHydrated, token, hasPermission, permission, router]);

  return { allowed };
}
