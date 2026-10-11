import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalizubaan.com";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kali Zubaan — Bold Thoughts, Engineering & Technology",
    template: "%s | Kali Zubaan",
  },
  description:
    "Kali Zubaan is a modern, unfiltered technical journal exploring software architecture, artificial intelligence, distributed systems, and modern engineering craft.",
  keywords: [
    "Kali Zubaan",
    "kalizubaan",
    "kali zubaan blogs",
    "software engineering blog",
    "tech articles",
    "distributed systems",
    "system architecture",
    "Next.js tutorials",
    "Supabase guides",
    "AI agents",
    "full stack development",
  ],
  authors: [{ name: "Aditya", url: siteUrl }],
  creator: "Aditya",
  publisher: "Kali Zubaan",
  applicationName: "Kali Zubaan",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kali Zubaan — Bold Thoughts, Engineering & Technology",
    description:
      "A modern, unfiltered technical journal exploring software architecture, artificial intelligence, and engineering craft.",
    url: siteUrl,
    siteName: "Kali Zubaan",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kali Zubaan — Technology & Engineering Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kali Zubaan — Bold Thoughts, Engineering & Technology",
    description:
      "A modern, unfiltered technical journal exploring software architecture, AI, and engineering craft.",
    creator: "@kalizubaan",
    images: ["/og-image.png"],
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kali Zubaan",
    url: siteUrl,
    description:
      "A modern, unfiltered technical journal exploring software architecture, artificial intelligence, and engineering craft.",
    publisher: {
      "@type": "Organization",
      name: "Kali Zubaan",
      url: siteUrl,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-rose-500 selection:text-white">
        <Suspense fallback={<div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />}>
          <Navbar />
        </Suspense>
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
