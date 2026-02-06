"use client";

import React from "react";
import { LucideIcon, Inbox, Shield, Ban, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureItem {
  icon: LucideIcon;
  text: string;
}

interface FeatureListProps {
  title?: string;
  features?: FeatureItem[];
  className?: string;
}

const defaultFeatures: FeatureItem[] = [
  { icon: Inbox, text: "Unlimited inbox" },
  { icon: Ban, text: "No ads. No noise" },
  { icon: Shield, text: "Protected access system" },
  { icon: CreditCard, text: "Pay once. No subscription" },
];

/**
 * FeatureList - Displays features with icons in a flex wrap layout
 *
 * Features:
 * - Configurable title
 * - Customizable features list
 * - Responsive flex wrap layout
 */
const FeatureList: React.FC<FeatureListProps> = ({
  title = "Why Mailria?",
  features = defaultFeatures,
  className,
}) => {
  return (
    <div className={cn("w-full max-w-sm flex flex-col gap-3", className)}>
      {title && (
        <p className="text-sm font-normal text-gray-600 text-center">{title}</p>
      )}
      <div className="flex flex-wrap justify-center items-center gap-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-1"
          >
            <feature.icon className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-normal text-gray-600">{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureList;
