"use client";

import dynamic from "next/dynamic";

// Disable SSR to avoid hydration mismatch
const ForgotPasswordClient = dynamic(
  () => import("@/components/ForgotPasswordClient"),
  { ssr: false }
);

export default function Page() {
  return <ForgotPasswordClient />;
}
