"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer, ScrollToTopButton } from "@/components/layout";
import axios from "axios";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

interface PrivacyResponse {
  content: string;
  effective_date: string;
}

// DOMPurify config for safe HTML rendering
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "ul",
    "ol",
    "li",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "a",
    "span",
    "div",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "blockquote",
    "pre",
    "code",
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set page title
  useEffect(() => {
    document.title = "Privacy Policy - Mailria";
  }, []);

  // Handle scroll to show/hide scroll-to-top button
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
    const fetchPrivacy = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<PrivacyResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/content/privacy`,
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
    <div className="h-screen w-full relative bg-neutral-50 flex flex-col overflow-hidden">
      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative z-10"
      >
        {/* Main Content with padding */}
        <div className="p-4 md:p-8 pb-0 md:pb-0">
          <div className="flex flex-col justify-start items-start gap-4 md:gap-8">
            {/* Back Button */}
            <div className="self-stretch inline-flex justify-start items-center gap-2.5">
              <div className="flex justify-start items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push("/")}
                  className={cn(
                    "w-10 h-10 bg-white rounded-lg",
                    "shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]",
                    "outline-neutral-200",
                    "text-neutral-800 hover:bg-neutral-50",
                  )}
                  aria-label="Go back"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="self-stretch md:px-44 flex flex-col justify-start items-start gap-4 md:gap-5">
              {/* Privacy Card */}
              <div className="self-stretch p-4 lg:p-6 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col justify-start items-center gap-4">
                {/* Title */}
                <h1 className="text-neutral-800 text-2xl font-medium leading-8 text-left w-full">
                  Mailria Privacy Policy
                </h1>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12 w-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12 w-full">
                    <p className="text-red-500">{error}</p>
                    <Button
                      variant="link"
                      onClick={() => window.location.reload()}
                      className="mt-4 text-primary-500 hover:underline"
                    >
                      Try again
                    </Button>
                  </div>
                ) : (
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 md:gap-5">
                    {/* Effective Date */}
                    {effectiveDate && (
                      <p className="self-stretch text-neutral-800 text-base font-semibold leading-6">
                        Effective Date: {effectiveDate}
                      </p>
                    )}

                    {/* Rendered HTML Content */}
                    <div
                      className="self-stretch bg-white max-w-full mx-auto font-['Roboto'] text-[14px] leading-5 text-[#4B5563]
                        [&_h2]:text-[#1F2937] [&_h2]:text-[16px] [&_h2]:font-semibold [&_h2]:leading-6 [&_h2]:mt-6 [&_h2]:mb-2.5 [&_h2]:pt-2
                        [&_h2:first-of-type]:border-t-0 [&_h2:first-of-type]:pt-0 [&_h2:first-of-type]:mt-3
                        [&_p]:text-[#4B5563] [&_p]:text-[14px] [&_p]:font-normal [&_p]:leading-5 [&_p]:my-2
                        [&_strong]:text-[#1F2937] [&_strong]:font-semibold
                        [&_ul]:my-2 [&_ul]:mb-3 [&_ul]:pl-[18px] [&_ul]:list-disc
                        [&_ol]:my-2 [&_ol]:mb-3 [&_ol]:pl-[18px] [&_ol]:list-decimal
                        [&_li]:my-1.5
                        [&_li_p]:m-0
                        [&_a]:text-[#1F2937] [&_a]:underline [&_a]:underline-offset-0 hover:[&_a]:decoration-2"
                      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Scroll to Top Button - Fixed position outside scroll container */}
          {showScrollTop && (
            <div>
              <div className="mb-4 lg:mb-8">
                <div className="fixed bottom-4 right-4 md:right-8 z-20">
                  <ScrollToTopButton onClick={scrollToTop} />
                </div>
              </div>
            </div>
          )}

          <div className="relative pb-4 pt-4 md:p-8 pt-4 md:pt-8">
            <div
              className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[140%] h-16 rounded-full bg-[var(--primary-50)] blur-[32px] pointer-events-none z-0"
              aria-hidden="true"
            />
            <Footer showGlow={false} className="relative z-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
