"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { searchFaqs, countFaqResults } from "@/lib/faqData";
import { FaqSearch, FaqSection, FaqEmptyState } from "@/components/faq";
import { Footer, ScrollToTopButton } from "@/components/layout";
import { ChevronLeftIcon } from "@heroicons/react/24/outline"

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
            <div className="self-stretch md:px-44 flex flex-col justify-start items-start gap-4 md:gap-5">
              {/* Header Card with Title and Search */}
              <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-center gap-4">
                <h1 className="text-gray-800 text-2xl md:text-3xl font-medium leading-8 md:leading-9">FAQs</h1>
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
                <div className="self-stretch flex flex-col justify-start items-start gap-4 md:gap-5">
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
        </div>
      </div>

      {/* Scroll to Top Button - Fixed position outside scroll container */}
      {showScrollTop && (
        <div>
        <div className="fixed bottom-4 right-4 md:right-8 z-20">
          <ScrollToTopButton onClick={scrollToTop} />
        </div>
        <div className="p-4 md:p-8 pt-4 md:pt-8">
          <Footer />
        </div>
        </div>
      )}
    </div>
  );
};

export default FaqPage;
