"use client";

import dynamic from "next/dynamic";

// Disable SSR to avoid hydration mismatch
const LoginPageClient = dynamic(() => import("@/components/LoginPageClient"), {
  ssr: false,
});

export default function Page() {
  return <LoginPageClient />;
}
