import type { Metadata, Viewport } from "next";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import SyncLogoutProvider from "@/components/SyncLogoutProvider";

export const metadata: Metadata = {
  title: "Mailria: Nothing Extra. Just What Matters.",
  description: "Experience the premium email platform with no monthly fees. Pay once for a secure, simple, and distraction-free inbox.",
  robots: "noindex, nofollow", // Private app - don't index
};

// Optimize viewport
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <SyncLogoutProvider />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
