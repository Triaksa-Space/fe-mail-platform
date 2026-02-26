"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Settings page - redirects to main inbox with settings view
 * This maintains backward compatibility with existing routes
 */
export default function SettingPage() {
  const router = useRouter();
  const storedToken = useAuthStore.getState().getStoredToken();

  useEffect(() => {
    if (!storedToken) {
      router.replace("/");
      return;
    }

    // Redirect to inbox with settings view
    router.replace("/inbox?view=settings");
  }, [router, storedToken]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#F9FAFB]">
      <div className="text-neutral-500">Loading...</div>
    </div>
  );
}
