"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import AdminSidebar from "./AdminSidebar";
import AdminMobileNav from "./AdminMobileNav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const roleId = useAuthStore((state) => state.roleId);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

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
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop Layout */}
      <div className="w-full min-h-screen flex justify-center">
        <div className="w-full max-w-[1440px] py-5 px-4 lg:px-5 flex justify-start items-start gap-5">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:flex lg:flex-col h-[calc(100vh-40px)] sticky top-5 w-[240px] flex-shrink-0">
            <AdminSidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-0 flex flex-col justify-start items-start">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Navigation - Hidden on desktop */}
      <AdminMobileNav />
    </div>
  );
};

export default AdminLayout;
