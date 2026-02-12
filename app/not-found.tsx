"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import FooterNav from "@/components/FooterNav";
import FooterAdminNav from "@/components/FooterAdminNav";
import { useAuthStore } from "@/stores/useAuthStore";
import { PageLayout } from "@/components/layout";

export default function NotFound() {
  const roleId = useAuthStore((state) => state.roleId);

  return (
    <PageLayout variant="centered" className="min-h-screen">
      <main className="flex flex-1 flex-col items-center justify-center px-4 space-y-6">
        <h1 className="text-7xl font-bold text-neutral-900">404</h1>
        <h2 className="text-3xl font-semibold text-neutral-800">Page Not Found</h2>
        <p className="text-center text-neutral-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go Back Home</Link>
        </Button>
      </main>

      {/* Footer */}
      {roleId === 1 ? (
        <FooterNav />
      ) : roleId === 0 || roleId === 2 ? (
        <FooterAdminNav />
      ) : null}
    </PageLayout>
  );
}
