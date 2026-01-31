"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { termsData, termsIntro, termsEffectiveDate } from "@/lib/termsData";
import { Footer } from "@/components/layout";

const TermsPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className={cn(
                "flex h-10 w-10 items-center justify-center",
                "rounded-xl border border-gray-200 bg-white",
                "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                "transition-colors"
              )}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Title */}
            <h1 className="text-lg font-semibold text-gray-900">
              Terms of Services
            </h1>

            {/* Placeholder for alignment */}
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 md:px-6 py-6">
        <div className="flex flex-col gap-4 md:gap-5">
          {/* Hero Section */}
          <div className="text-center py-6 md:py-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Mailria Terms of Services
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">
              Effective Date: {termsEffectiveDate}
            </p>
          </div>

          {/* Terms Content Card */}
          <div
            className={cn(
              "rounded-xl bg-white p-4 md:p-6 border border-gray-100",
              "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]"
            )}
          >
            {/* Introduction */}
            <div className="space-y-3 text-gray-600 text-sm leading-relaxed mb-8">
              {termsIntro.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="space-y-8">
              {termsData.map((section) => (
                <section key={section.id} className="space-y-3">
                  {/* Section Title */}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.id}. {section.title}
                  </h3>

                  {/* Section Content */}
                  <div className="space-y-2 text-gray-600 text-sm leading-relaxed">
                    {section.content.map((paragraph, index) => {
                      // Check if paragraph is a bullet point
                      if (paragraph.startsWith("•")) {
                        return (
                          <p key={index} className="pl-4">
                            {paragraph}
                          </p>
                        );
                      }

                      // Check if paragraph contains email link
                      if (paragraph.includes("support@mailria.com")) {
                        const parts = paragraph.split("support@mailria.com");
                        return (
                          <p key={index}>
                            {parts[0]}
                            <a
                              href="mailto:support@mailria.com"
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              support@mailria.com
                            </a>
                            {parts[1]}
                          </p>
                        );
                      }

                      return <p key={index}>{paragraph}</p>;
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer Note */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                By using Mailria, you acknowledge that you have read, understood,
                and agree to be bound by these Terms of Services.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
};

export default TermsPage;
