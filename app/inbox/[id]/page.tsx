"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Email detail page - redirects to main inbox with the email selected
 * This maintains backward compatibility with direct email links
 */
export default function EmailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storedToken = useAuthStore.getState().getStoredToken();

  useEffect(() => {
    if (!storedToken) {
      router.replace("/");
      return;
    }

    // Redirect to inbox with email ID in query params
    // The main inbox page will handle opening this email
    router.replace(`/inbox?email=${params.id}`);
  }, [params.id, router, storedToken]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#F9FAFB]">
      <div className="text-gray-500">Loading email...</div>
    </div>
  );
}
