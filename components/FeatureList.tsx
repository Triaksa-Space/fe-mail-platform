"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShieldCheckIcon, InboxStackIcon } from "@heroicons/react/solid";
import Icon from "@mdi/react";
import { mdiAdvertisementsOff } from "@mdi/js";
import { CardPayFill } from '@mingcute/react';

// Wrapper component for MDI icons to match the interface
const MdiAdsOff = ({ className }: { className?: string }) => (
  <Icon path={mdiAdvertisementsOff} className={className} />
);

interface FeatureItem {
  icon: LucideIcon | React.FC<{ className?: string }>;
  text: string;
}

interface FeatureListProps {
  title?: string;
  features?: FeatureItem[];
  className?: string;
}

const defaultFeatures: FeatureItem[] = [
  { icon: InboxStackIcon, text: "Unlimited inbox" },
  { icon: MdiAdsOff, text: "No ads. No noise" },
  { icon: ShieldCheckIcon, text: "Protected access system" },
  { icon: CardPayFill, text: "Pay once. No subscription" },
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
    <div className={cn("w-full max-w-sm flex flex-col items-center gap-2 md:gap-3", className)}>
      {title && (
        <p className="text-sm font-normal text-neutral-600 text-center w-full">{title}</p>
      )}
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {features.map((feature, index) => {
          const isRightColumn = index % 2 === 0;
          return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-1",
              isRightColumn ? "justify-self-end text-right" : "justify-self-start text-left"
            )}
          >
            <feature.icon className="h-3 w-3 text-primary-500 " color="[#027AEA]" />
            <span className="text-xs font-normal text-neutral-600">{feature.text}</span>
          </div>
        )})}
      </div>
    </div>
  );
};

export default FeatureList;

