"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FaqCategory, FaqItem } from "@/lib/faqData";

interface FaqSectionProps {
  category: FaqCategory;
  className?: string;
}

interface FaqAccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

const FaqAccordionItem: React.FC<FaqAccordionItemProps> = ({
  item,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-1 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "text-sm font-medium transition-colors pr-4",
            isOpen ? "text-blue-600" : "text-gray-900 group-hover:text-gray-700"
          )}
        >
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 transition-transform duration-200",
            isOpen ? "rotate-180 text-blue-600" : "text-gray-400"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pb-4 px-1">
          <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </div>
  );
};

const FaqSection: React.FC<FaqSectionProps> = ({ category, className }) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-gray-100",
        "shadow-[0_6px_15px_-2px_rgba(16,24,40,0.08)]",
        className
      )}
    >
      {/* Category Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">
          {category.title}
        </h3>
      </div>

      {/* FAQ Items */}
      <div className="px-4">
        {category.items.map((item) => (
          <FaqAccordionItem
            key={item.id}
            item={item}
            isOpen={openItems.has(item.id)}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FaqSection;
