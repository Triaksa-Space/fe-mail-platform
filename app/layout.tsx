import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import SyncLogoutProvider from "@/components/SyncLogoutProvider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

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
      <body className={`${roboto.variable} font-sans antialiased`}>
        <SyncLogoutProvider />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
