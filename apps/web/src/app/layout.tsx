import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brahma Kalasha — Premium Vegetarian Pre-Order Platform",
  description:
    "Order freshly prepared wholesome vegetarian meals for next-day delivery. South Indian tiffins, veg lunches, healthy specials and more. Pre-order before 9 PM tonight for tomorrow's delivery.",
  keywords: [
    "vegetarian food",
    "pre-order meals",
    "healthy food delivery",
    "south indian food",
    "tiffin service",
    "Bangalore food delivery",
    "Brahma Kalasha",
  ],
  authors: [{ name: "Brahma Kalasha" }],
  openGraph: {
    title: "Brahma Kalasha — Premium Vegetarian Pre-Order Platform",
    description:
      "Order freshly prepared wholesome vegetarian meals for next-day delivery.",
    type: "website",
    locale: "en_IN",
    siteName: "Brahma Kalasha",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4B0F16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-cream text-maroon font-sans antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
