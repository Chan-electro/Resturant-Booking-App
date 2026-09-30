import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { isClerkConfigured } from "@/lib/auth-mode";

const bodyFont = localFont({
  src: [
    { path: "./fonts/DejaVuSans.ttf", weight: "400" },
    { path: "./fonts/DejaVuSans-Bold.ttf", weight: "700" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const displayFont = localFont({
  src: [
    { path: "./fonts/DejaVuSerif.ttf", weight: "400" },
    { path: "./fonts/DejaVuSerif-Bold.ttf", weight: "700" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MS Brahmin Events — Event Management & Home Catering",
  description:
    "Plan memorable celebrations and order thoughtfully prepared vegetarian catering from MS Brahmin Events.",
  keywords: [
    "vegetarian food",
    "pre-order meals",
    "healthy food delivery",
    "south indian food",
    "tiffin service",
    "Bangalore food delivery",
    "event management",
    "home catering",
    "MS Brahmin Events",
  ],
  authors: [{ name: "MS Brahmin Events" }],
  openGraph: {
    title: "MS Brahmin Events — Event Management & Home Catering",
    description:
      "Warm, dependable event management and vegetarian home catering.",
    type: "website",
    locale: "en_IN",
    siteName: "MS Brahmin Events",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#7B1825",
};

// Force dynamic rendering for all pages – prevents Next.js from serving
// pre-rendered RSC flight payloads (.rsc) as raw text via CDN/proxy caches.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="min-h-screen bg-cream text-maroon font-sans antialiased">
        {isClerkConfigured ? (
          <ClerkProvider>
            <AppProvider>{children}</AppProvider>
          </ClerkProvider>
        ) : (
          <AppProvider>{children}</AppProvider>
        )}
      </body>
    </html>
  );
}
