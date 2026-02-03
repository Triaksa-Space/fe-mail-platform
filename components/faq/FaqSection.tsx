"use client";

import React, { useState } from "react";
import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FaqCategory, FaqItem } from "@/lib/faqData";

interface FaqSectionProps {
  category: FaqCategory;
  startIndex: number;
  className?: string;
}

interface FaqAccordionItemProps {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}

const FaqAccordionItem: React.FC<FaqAccordionItemProps> = ({
  item,
  index,
  isOpen,
  onToggle,
  isLast,
}) => {
  return (
    <div
      className={cn(
        "self-stretch p-4 flex flex-col justify-start items-start gap-3",
        !isLast && "border-b border-gray-200"
      )}
    >
      <button
        onClick={onToggle}
        className="self-stretch inline-flex justify-start items-center gap-3 overflow-hidden w-full text-left"
        aria-expanded={isOpen}
      >
        <div className="flex-1 flex justify-start items-center gap-3">
          <span className="flex-1 text-gray-900 text-base font-medium leading-6">
            {index}. {item.question}
          </span>
        </div>
        <div className="flex justify-end items-center gap-2">
          <Minus
            className={cn(
              "w-5 h-5 text-gray-500 transition-transform duration-200",
              isOpen && "rotate-0"
            )}
          />
        </div>
      </button>

      {/* Answer - Expanded State */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out w-full",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="self-stretch pl-6 inline-flex justify-center items-start gap-2.5">
          <p className="flex-1 text-gray-500 text-sm font-normal leading-5">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const FaqSection: React.FC<FaqSectionProps> = ({ category, startIndex, className }) => {
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
        "self-stretch bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start",
        className
      )}
    >
      {/* Category Header */}
      <div className="self-stretch px-4 pt-4 inline-flex justify-start items-center gap-2.5">
        <h3 className="text-gray-800 text-lg font-semibold leading-6">
          {category.title}
        </h3>
      </div>

      {/* FAQ Items */}
      <div className="self-stretch flex flex-col justify-start items-start">
        {category.items.map((item, idx) => (
          <FaqAccordionItem
            key={item.id}
            item={item}
            index={startIndex + idx}
            isOpen={openItems.has(item.id)}
            onToggle={() => toggleItem(item.id)}
            isLast={idx === category.items.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default FaqSection;
