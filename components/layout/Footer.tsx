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
}) => {
  return (
    <footer className={cn("w-full max-w-sm relative overflow-visible", className)}>
      {/* Subtle background glow */}
      <div
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-sky-100 rounded-full blur-3xl opacity-50 pointer-events-none"
        aria-hidden="true"
      />
      <nav className="relative flex justify-between items-start">
        {links.map((link) =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-normal text-sky-600 hover:text-sky-700 hover:underline transition-colors"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-normal text-sky-600 hover:text-sky-700 hover:underline transition-colors"
            >
              {link.label}
            </Link>
          )
        )}
      </nav>
    </footer>
  );
};

export default Footer;
