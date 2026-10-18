import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import "./globals.css";
import {
  siteTitle,
  siteDescription,
  siteShortDescription,
  siteKeywords,
  siteName,
  siteAlternateNames,
  blogName,
} from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";

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
    default: siteTitle,
    template: "%s | Kali Zubaan Blog",
  },
  description: siteDescription,
  keywords: siteKeywords,
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
    title: siteTitle,
    description: siteShortDescription,
    url: siteUrl,
    siteName: "Kali Zubaan",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kali Zubaan — money, health, side hustles and tech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteShortDescription,
    creator: "@kalizubaan",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // One WebSite + one Organization for the whole site. alternateName tells
  // Google the brand searches ("kalizubaan blogs") belong to this site.
  // No SearchAction: the homepage search filters in the browser, there is no
  // search-results URL for Google to send people to.
  // sameAs (social profiles) is left out until there are profiles to list.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        alternateName: siteAlternateNames,
        url: siteUrl,
        description: siteDescription,
        inLanguage: "en-IN",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        alternateName: blogName,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
        },
      },
    ],
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
        {/* Umami Analytics */}
        <Script
          defer
          src="https://umami-nu-eosin.vercel.app/script.js"
          data-website-id="42eaba06-6a90-4b1d-a504-785ddf302757"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-rose-500 selection:text-white">
        <Suspense
          fallback={
            <div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />
          }
        >
          <Navbar />
        </Suspense>
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
