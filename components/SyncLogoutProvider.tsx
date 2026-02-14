"use client";

import { useSyncLogout } from "@/hooks/use-sync-logout";

export default function SyncLogoutProvider() {
  useSyncLogout();
  return null;
}
