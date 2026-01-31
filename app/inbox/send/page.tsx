"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Send page - redirects to main inbox with compose modal open
 * This maintains backward compatibility with existing routes
 */
export default function SendPage() {
  const router = useRouter();
  const storedToken = useAuthStore.getState().getStoredToken();

  useEffect(() => {
    if (!storedToken) {
      router.replace("/");
      return;
    }

    // Redirect to inbox with compose modal open
    router.replace("/inbox?compose=true");
  }, [router, storedToken]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#F9FAFB]">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
