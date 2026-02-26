"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import FooterNav from "@/components/FooterNav";
import { useAuthStore } from "@/stores/useAuthStore";
import { PageLayout } from "@/components/layout";
import AdminLayout from "@/components/admin/AdminLayout";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  const roleId = useAuthStore((state) => state.roleId);
  const isAdmin = roleId === 2;

  if (isAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-1 flex-col items-center justify-center w-full h-full py-20 gap-6">
          <div className="p-4 bg-primary-50 rounded-full">
            <ExclamationCircleIcon className="w-12 h-12 text-primary-500" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-7xl font-bold text-neutral-900 font-['Roboto']">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-neutral-800 font-['Roboto']">
              Page Not Found
            </h2>
            <p className="text-neutral-600 text-sm font-['Roboto'] max-w-sm">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin">Go to Dashboard</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <PageLayout variant="centered" className="min-h-screen">
      <main className="flex flex-1 flex-col items-center justify-center px-4 space-y-6">
        <h1 className="text-7xl font-bold text-neutral-900">404</h1>
        <h2 className="text-3xl font-semibold text-neutral-800">
          Page Not Found
        </h2>
        <p className="text-center text-neutral-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go back home</Link>
        </Button>
      </main>

      {roleId === 1 && <FooterNav />}
    </PageLayout>
  );
}
