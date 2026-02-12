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
          {/* Background glow */}
          <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 w-[600%] h-16 pointer-events-none z-0">
            <div
              className={cn(
                "w-full h-full rounded-full",
                "bg-[radial-gradient(ellipse_at_center,_theme(colors.primary.200/0.45)_0%,_theme(colors.primary.200/0.25)_35%,_theme(colors.primary.100/0.12)_55%,_transparent_75%)]",
                "blur-2xl opacity-70",
              )}
              aria-hidden="true"
            />
          </div>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
