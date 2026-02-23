"use client";

import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FaqCategory, FaqItem } from "@/lib/faqData";

interface FaqSectionProps {
  category: FaqCategory;
  className?: string;
}

interface FaqAccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}

const renderQuestionWithHangingIndent = (question: string) => {
  const match = question.match(/^(\d+\.\s+)(.*)$/);
  if (!match) {
    return (
      <span className="block w-full min-w-0 break-words whitespace-pre-line text-left text-neutral-900 text-base font-medium leading-6">
        {question}
      </span>
    );
  }

  const [, prefix, content] = match;
  return (
    <span className="flex w-full min-w-0 items-start text-neutral-900 text-base font-medium leading-6">
      <span className="shrink-0">{prefix}</span>
      <span className="min-w-0 flex-1 break-words whitespace-pre-line text-left">
        {content}
      </span>
    </span>
  );
};

const renderAnswerWithLinks = (text: string) => {
  const linkRegex = /(https?:\/\/[^\s]+|(?:www\.)?gamemarket\.gg(?:\/[^\s]*)?)/gi;
  const parts = text.split(linkRegex);

  return parts.map((part, index) => {
    if (!part || !linkRegex.test(part)) {
      linkRegex.lastIndex = 0;
      return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
    }
    linkRegex.lastIndex = 0;

    let url = part;
    let trailing = "";
    while (/[),.!?;:]$/.test(url)) {
      trailing = url.slice(-1) + trailing;
      url = url.slice(0, -1);
    }

    const href = /^https?:\/\//i.test(url)
      ? url
      : `https://${url.replace(/^www\./i, "")}`;

    return (
      <React.Fragment key={`link-${index}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-500 underline underline-offset-2"
        >
          {url}
        </a>
        {trailing}
      </React.Fragment>
    );
  });
};

const FaqAccordionItem: React.FC<FaqAccordionItemProps> = ({
  item,
  isOpen,
  onToggle,
  isLast,
}) => {
  return (
    <div
      className={cn(
        "self-stretch flex flex-col justify-start items-start",
        !isLast && "border-b border-neutral-200"
      )}
    >
      <Button
        variant="ghost"
        onClick={onToggle}
        className={cn(
          "self-stretch h-auto min-h-0 pt-4 lg:px-0 justify-start items-start gap-3 w-full text-left hover:bg-transparent",
          isOpen ? "pb-3" : "pb-4"
        )}
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1 flex justify-start items-start">
          {renderQuestionWithHangingIndent(item.question)}
        </div>
        <div className="flex justify-end items-center gap-2">
          <ChevronDownIcon
            className={cn(
              "w-5 h-5 text-neutral-500 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </Button>

      {/* Answer - Expanded State */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out w-full",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="self-stretch pl-8 lg:pl-4 pr-4 pb-4 flex items-start">
          <p className="flex-1 whitespace-pre-line text-neutral-500 text-sm font-normal leading-5">
            {renderAnswerWithLinks(item.answer)}
          </p>
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
        "self-stretch p-0 md:p-4 bg-white rounded-xl shadow-[0px_2px_6px_0px_rgba(16,24,40,0.06)] outline outline-1 outline-offset-[-1px] outline-neutral-200 overflow-hidden flex flex-col justify-start items-start",
        className
      )}
    >
      {/* Category Header */}
      <div className="self-stretch px-4 pt-4 md:px-0 md:pt-0 flex justify-start items-start gap-2.5">
        <h3 className="block w-full min-w-0 break-words whitespace-pre-line text-left text-neutral-800 text-lg font-semibold leading-6">
          {category.title}
        </h3>
      </div>

      {/* FAQ Items */}
      <div className="self-stretch md:mt-6 flex flex-col justify-start items-start">
        {category.items.map((item, idx) => (
          <FaqAccordionItem
            key={item.id}
            item={item}
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
