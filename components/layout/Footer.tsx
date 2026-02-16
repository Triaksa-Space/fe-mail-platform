"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterProps {
  links?: FooterLink[];
  className?: string;
  showGlow?: boolean;
}

const defaultLinks: FooterLink[] = [
  { label: "Buy email", href: "/buy" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms of services", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];

/**
 * Footer - Simple footer with navigation links
 *
 * Features:
 * - Configurable links
 * - External link support
 * - Responsive layout with justify-between
 * - Subtle sky gradient background glow
 */
const Footer: React.FC<FooterProps> = ({
  links = defaultLinks,
  className,
  showGlow = true,
}) => {
  return (
    <footer
      className={cn(
        "self-stretch flex justify-center relative overflow-visible",
        className,
      )}
    >
      <div className="relative w-full text-center justify-center items-center">
        <nav className="relative w-full max-w-sm mx-auto flex justify-center items-start gap-6">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 text-sm font-normal text-primary-500 hover:text-primary-500 hover:underline transition-colors leading-5"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="relative z-10 text-sm font-normal text-primary-500 hover:text-primary-500 hover:underline transition-colors leading-5"
              >
                {link.label}
              </Link>
            ),
          )}
          {showGlow && (
            <div
              className="absolute left-[calc(50%-2500px)] bottom-[-4916px] w-[5000px] h-[5000px] rounded-[5000px] bg-[var(--primary-50)] blur-[32px] pointer-events-none z-0"
              aria-hidden="true"
            />
          )}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
