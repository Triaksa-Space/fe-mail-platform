"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout";
import axios from "axios";
import { ChevronLeftIcon, ArrowUpIcon } from "@heroicons/react/24/outline"

interface TermsResponse {
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

const TermsPage: React.FC = () => {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [effectiveDate, setEffectiveDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sanitizedContent, setSanitizedContent] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set page title
  useEffect(() => {
    document.title = "Terms of Service - Mailria";
  }, []);

  // Handle scroll to show/hide scroll-to-top button (mobile only)
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowScrollTop(container.scrollTop > 200);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<TermsResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/content/terms`
        );
        setContent(response.data.content);
        setEffectiveDate(response.data.effective_date);
      } catch (err) {
        console.error("Failed to fetch terms:", err);
        setError("Failed to load Terms of Services. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
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
    <div className="h-screen md:h-auto md:min-h-screen w-full relative bg-gray-50 flex flex-col overflow-hidden">
      {/* Background decorative blur */}
      <div className="w-[5000px] h-[5000px] left-[-2305px] top-[2802px] absolute bg-blue-100 rounded-full blur-[32px]" />

      {/* Scrollable Content (mobile) / Normal Content (desktop) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10"
      >
        <div className="flex flex-col justify-start items-start gap-4 md:gap-8">
          {/* Back Button */}
          <div className="self-stretch inline-flex justify-start items-center gap-2.5">
            <div className="flex justify-start items-center gap-4">
              <button
                onClick={() => router.back()}
                className={cn(
                  "w-10 h-10 bg-white rounded-lg",
                  "shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]",
                  "outline outline-1 outline-offset-[-1px] outline-gray-200",
                  "flex justify-center items-center",
                  "text-gray-800 hover:bg-gray-50 transition-colors"
                )}
                aria-label="Go back"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="self-stretch md:px-44 flex flex-col justify-start items-start gap-4 md:gap-8">
            {/* Terms Card */}
            <div className="self-stretch p-4 md:p-6 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-4 md:gap-6">
              {/* Title */}
              <h1 className="text-gray-800 text-2xl md:text-2xl font-medium leading-8">
                Mailria Terms of Services
              </h1>

              {isLoading ? (
                <div className="flex items-center justify-center py-12 w-full">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : error ? (
                <div className="text-center py-12 w-full">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  {/* Effective Date */}
                  {effectiveDate && (
                    <p className="self-stretch text-gray-800 text-base font-semibold leading-6">
                      Effective Date: {effectiveDate}
                    </p>
                  )}

                  {/* Rendered HTML Content */}
                  <div
                    className="self-stretch text-gray-600 text-sm font-normal leading-5
                      [&_h1]:text-gray-800 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:leading-6 [&_h1]:mt-4
                      [&_h2]:text-gray-800 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:leading-6 [&_h2]:mt-4
                      [&_h3]:text-gray-800 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:leading-6 [&_h3]:mt-3
                      [&_p]:text-gray-600 [&_p]:text-sm [&_p]:font-normal [&_p]:leading-5
                      [&_a]:text-blue-600 [&_a]:underline
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                      [&_li]:text-gray-600 [&_li]:text-sm [&_li]:font-normal [&_li]:leading-5"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button - Mobile Only */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-14 right-4 z-20 md:hidden",
            "w-10 h-10 bg-blue-100 rounded-lg",
            "shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)]",
            "outline outline-1 outline-offset-[-1px] outline-blue-100",
            "flex justify-center items-center",
            "hover:bg-blue-200 transition-colors"
          )}
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="h-5 w-5 text-blue-600" />
        </button>
      )}

      {/* Footer */}
      <Footer className="p-4 relative z-10" />
    </div>
  );
};

export default TermsPage;
