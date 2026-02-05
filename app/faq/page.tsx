"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchFaqs, countFaqResults } from "@/lib/faqData";
import { FaqSearch, FaqSection, FaqEmptyState } from "@/components/faq";
import { Footer } from "@/components/layout";

const FaqPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="min-h-screen p-8 relative bg-gray-50 inline-flex flex-col justify-start items-center gap-10 overflow-hidden">
      {/* Background decorative blur */}
      <div className="w-[5000px] h-[5000px] left-[-1780px] top-[2808px] absolute bg-sky-100 rounded-full blur-[32px]" />

      {/* Main Content */}
      <div className="self-stretch flex flex-col justify-start items-start gap-8 relative z-10">
        {/* Back Button */}
        <div className="self-stretch inline-flex justify-start items-center gap-2.5">
          <button
            onClick={() => router.back()}
            className={cn(
              "w-12 h-12 px-4 py-2.5 bg-white rounded-lg",
              "shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]",
              "outline outline-1 outline-offset-[-1px] outline-gray-200",
              "flex justify-center items-center gap-2",
              "text-gray-800 hover:bg-gray-50 transition-colors"
            )}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="self-stretch px-4 md:px-20 lg:px-44 flex flex-col justify-start items-start gap-5">
          {/* Header Card with Title and Search */}
          <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-center gap-4">
            <h1 className="text-gray-800 text-3xl font-medium leading-9">FAQs</h1>
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
            <div className="self-stretch flex flex-col justify-start items-start gap-5">
              {filteredCategories.map((category, categoryIndex) => {
                // Calculate start index based on previous categories
                const startIndex = filteredCategories
                  .slice(0, categoryIndex)
                  .reduce((acc, cat) => acc + cat.items.length, 1);
                return (
                  <FaqSection
                    key={category.key}
                    category={category}
                    startIndex={startIndex}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <Footer />
    </div>
  );
};

export default FaqPage;
