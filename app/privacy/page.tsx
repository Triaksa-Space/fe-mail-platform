"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout";
import axios from "axios";

interface PrivacyResponse {
  content: string;
  effective_date: string;
}

// DOMPurify config for safe HTML rendering
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "strong", "b", "em", "i", "u", "s", "strike",
    "a", "span", "div",
    "table", "thead", "tbody", "tr", "th", "td",
    "blockquote", "pre", "code"
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "style"],
  ALLOW_DATA_ATTR: false,
};

const PrivacyPage: React.FC = () => {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sanitizedContent, setSanitizedContent] = useState<string>("");

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<PrivacyResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/content/privacy`
        );
        setContent(response.data.content);
        setEffectiveDate(response.data.effective_date);
      } catch (err) {
        console.error("Failed to fetch privacy policy:", err);
        setError("Failed to load Privacy Policy. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacy();
  }, []);

  // Sanitize HTML content on client side only
  useEffect(() => {
    if (typeof window !== "undefined" && content) {
      import("dompurify").then((DOMPurify) => {
        const clean = DOMPurify.default.sanitize(content, DOMPURIFY_CONFIG);
        setSanitizedContent(clean);
      });
    }
  }, [content]);

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
              Privacy Policy
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
                <Shield className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Mailria Privacy Policy
            </h2>
            {effectiveDate && (
              <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">
                Effective Date: {effectiveDate}
              </p>
            )}
          </div>

          {/* Privacy Content Card */}
          <div
            className={cn(
              "rounded-xl bg-white p-4 md:p-6 border border-gray-100",
              "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                {/* Rendered HTML Content */}
                <div
                  className="prose prose-sm max-w-none text-gray-600 leading-relaxed
                    prose-headings:text-gray-900 prose-headings:font-semibold
                    prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                    prose-p:mb-3 prose-ul:my-2 prose-ol:my-2
                    prose-li:my-1 prose-a:text-blue-600 prose-a:hover:text-blue-700
                    prose-strong:text-gray-900 prose-blockquote:border-l-blue-500
                    prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                {/* Footer Note */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    By using Mailria, you acknowledge that you have read and
                    understood this Privacy Policy.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
};

export default PrivacyPage;
