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
 * - Responsive layout
 */
const Footer: React.FC<FooterProps> = ({
  links = defaultLinks,
  className,
}) => {
  return (
    <footer className={cn("py-6", className)}>
      <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
        {links.map((link, index) => (
          <React.Fragment key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {link.label}
              </Link>
            )}
            {index < links.length - 1 && (
              <span className="text-gray-300 hidden md:inline">|</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
