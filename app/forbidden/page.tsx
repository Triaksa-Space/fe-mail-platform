"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin/AdminLayout";
import { LockClosedIcon } from "@heroicons/react/24/outline";

export default function ForbiddenPage() {
  return (
    <AdminLayout>
      <div className="flex flex-1 flex-col items-center justify-center w-full h-full py-20 gap-6">
        <div className="p-4 bg-primary-50 rounded-full">
          <LockClosedIcon className="w-12 h-12 text-primary-500" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-7xl font-bold text-neutral-900 font-['Roboto']">
            403
          </h1>
          <h2 className="text-2xl font-semibold text-neutral-800 font-['Roboto']">
            Access Forbidden
          </h2>
          <p className="text-neutral-600 text-sm font-['Roboto'] max-w-sm">
            You don&apos;t have permission to access this page. Contact your
            administrator if you think this is a mistake.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    </AdminLayout>
  );
}
