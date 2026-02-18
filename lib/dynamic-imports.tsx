import dynamic from "next/dynamic";
import React, { ComponentType } from "react";

// Loading skeleton for modals
const ModalSkeleton = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" />
    <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 animate-pulse">
      <div className="h-6 w-32 bg-neutral-200 rounded mb-4" />
      <div className="space-y-3">
        <div className="h-10 bg-neutral-100 rounded-xl" />
        <div className="h-10 bg-neutral-100 rounded-xl" />
        <div className="h-32 bg-neutral-100 rounded-xl" />
      </div>
      <div className="flex gap-3 mt-6">
        <div className="h-10 flex-1 bg-neutral-200 rounded-xl" />
        <div className="h-10 flex-1 bg-primary-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// Dynamically import ComposeModal - only loaded when needed
export const DynamicComposeModal = dynamic(
  () => import("@/components/mail/ComposeModal"),
  {
    loading: ModalSkeleton,
    ssr: false, // Don't render on server
  }
);

// Dynamically import Settings Panel - less frequently used
export const DynamicSettingsPanel = dynamic(
  () => import("@/components/mail/SettingsPanel"),
  {
    loading: () => (
      <div className="flex-1 p-6 animate-pulse">
        <div className="bg-white rounded-2xl p-6">
          <div className="h-8 w-32 bg-neutral-200 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Dynamically import Preview - loaded after email selection
export const DynamicPreview = dynamic(
  () => import("@/components/mail/Preview"),
  {
    loading: () => (
      <div className="flex-1 p-4 animate-pulse">
        <div className="bg-white rounded-2xl p-6">
          <div className="h-6 w-3/4 bg-neutral-200 rounded mb-4" />
          <div className="h-4 w-1/2 bg-neutral-100 rounded mb-6" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-neutral-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Helper to create dynamic imports with custom loading
export function createDynamicImport<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent?: () => React.ReactNode
) {
  return dynamic(importFn, {
    loading: LoadingComponent,
    ssr: false,
  });
}
