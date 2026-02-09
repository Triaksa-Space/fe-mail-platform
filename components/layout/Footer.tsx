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
const Footer: React.FC<FooterProps> = ({ links = defaultLinks, className }) => {
  return (
    <footer
      className={cn(
        "self-stretch flex justify-center relative overflow-visible",
        className,
      )}
    >
      <div className="relative w-full text-center justify-center items-center">
        {/* Background glow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[250%] h-20 bg-gradient-to-t from-primary-200 via-primary-100 to-transparent rounded-full blur-2xl opacity-60 pointer-events-none"
          aria-hidden="true"
        />
        <nav className="relative w-full max-w-sm mx-auto flex justify-center items-start gap-6">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-normal text-primary-600 hover:text-primary-600 hover:underline transition-colors leading-5"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-normal text-primary-600 hover:text-primary-600 hover:underline transition-colors leading-5"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
