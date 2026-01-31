"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";
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
            <h1 className="text-lg font-semibold text-gray-900">FAQs</h1>

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
                <HelpCircle className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              How can we help you?
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto">
              Find answers to frequently asked questions about Mailria
            </p>
          </div>

          {/* Search */}
          <FaqSearch
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={resultCount}
          />

          {/* FAQ Content */}
          {isSearching && !hasResults ? (
            <FaqEmptyState searchQuery={searchQuery} />
          ) : (
            <div className="flex flex-col gap-4 md:gap-5">
              {filteredCategories.map((category) => (
                <FaqSection key={category.key} category={category} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation - Same as Login Page */}
      <Footer />
    </div>
  );
};

export default FaqPage;
