"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const roleId = useAuthStore((state) => state.roleId);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  useSessionTimeout();

  // Check auth on popstate (back button) to prevent cached page access
  useEffect(() => {
    const handlePopState = () => {
      const storedToken = useAuthStore.getState().getStoredToken();
      if (!storedToken) {
        window.location.replace("/");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;

    const storedToken = useAuthStore.getState().getStoredToken();
    if (!storedToken) {
      router.replace("/");
      return;
    }

    // Role 1 = regular user, not allowed in admin
    if (roleId === 1) {
      router.replace("/not-found");
    }
  }, [_hasHydrated, roleId, router]);

  // Only show loading on initial hydration, not on page navigation
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (roleId === 1) {
    return null;
  }

  return (
    <div className="h-screen min-h-dvh bg-neutral-50 flex flex-col overflow-hidden">
      {/* Scrollable wrapper — horizontal on small screens */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="min-w-[900px] max-w-[1440px] mx-auto h-full py-5 px-4 lg:px-5 flex justify-start items-start gap-5">
          {/* Sidebar */}
          <div className="flex flex-col h-full w-[240px] flex-shrink-0">
            <AdminSidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0 h-full flex flex-col justify-start items-start overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
