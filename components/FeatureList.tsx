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
  columns?: 2 | 4;
}

const defaultFeatures: FeatureItem[] = [
  { icon: Inbox, text: "Unlimited inbox" },
  { icon: Shield, text: "Protected access" },
  { icon: Ban, text: "No ads. No noise" },
  { icon: CreditCard, text: "Pay once" },
];

/**
 * FeatureList - Displays a grid of features with icons
 *
 * Features:
 * - Configurable title
 * - Customizable features list
 * - Responsive grid (2 columns on mobile, configurable)
 */
const FeatureList: React.FC<FeatureListProps> = ({
  title = "Why Mailria?",
  features = defaultFeatures,
  className,
  columns = 2,
}) => {
  const gridClasses = {
    2: "grid-cols-2",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={cn("w-full max-w-sm text-center", className)}>
      {title && (
        <p className="text-sm font-semibold text-gray-700 mb-4">{title}</p>
      )}
      <div className={cn("grid gap-3", gridClasses[columns])}>
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-2 justify-center p-2 rounded-lg bg-white border border-gray-100 text-xs text-gray-600"
          >
            <feature.icon className="h-4 w-4 text-blue-500" />
            <span>{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureList;
