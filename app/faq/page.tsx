"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { searchFaqs, countFaqResults } from "@/lib/faqData";
import { FaqSearch, FaqSection, FaqEmptyState } from "@/components/faq";
import { Footer } from "@/components/layout";
import { ChevronLeftIcon, ArrowUpIcon } from "@heroicons/react/24/outline"

const FaqPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set page title
  useEffect(() => {
    document.title = "FAQ - Mailria";
  }, []);

  // Handle scroll to show/hide scroll-to-top button
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button when scrolled down more than 200px
      setShowScrollTop(scrollTop > 200);
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

  // Filter FAQs based on search query
  const filteredCategories = useMemo(() => {
    return searchFaqs(searchQuery);
  }, [searchQuery]);

  // Count results
  const resultCount = useMemo(() => {
    return countFaqResults(filteredCategories);
  }, [filteredCategories]);

  const hasResults = filteredCategories.length > 0;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="h-screen w-full relative bg-gray-50 flex flex-col overflow-hidden">
      {/* Background decorative blur */}
      <div className="w-[5000px] h-[5000px] left-[-2305px] top-[2802px] absolute bg-blue-100 rounded-full blur-[32px]" />

      {/* Scrollable Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="flex flex-col justify-start items-start gap-4">
          {/* Back Button */}
          <div className="inline-flex justify-start items-center gap-4">
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

          {/* Header Card with Title and Search */}
          <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-center gap-4">
            <h1 className="text-gray-800 text-2xl font-medium leading-8">FAQs</h1>
            <FaqSearch
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={resultCount}
            />
          </div>

          {/* FAQ Content */}
          {isSearching && !hasResults ? (
            <FaqEmptyState searchQuery={searchQuery} />
          ) : (
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              {filteredCategories.map((category) => (
                <FaqSection
                  key={category.key}
                  category={category}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-14 right-4 z-20",
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

      {/* Fixed Footer */}
      <Footer className="p-4 relative z-10" />
    </div>
  );
};

export default FaqPage;
