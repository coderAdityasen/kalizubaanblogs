import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ThemeScript from "@/components/ui/ThemeScript";
import Script from "next/script";
import { adsenseClient } from "@/components/ads/AdSlot";
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

// Mono is only used for small labels, table headers and code blocks, never
// for above-the-fold body text or the LCP element. Preloading it on every page
// made a ~23 KB font compete at high priority with the cover image (the LCP),
// so let the browser fetch it only when a mono glyph is actually rendered.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

// Article body serif (see lib/design.ts ARTICLE_BODY_FONT). Not preloaded:
// the first screen of every page is sans, so it never competes with the LCP
// cover; the metric-matched Georgia fallback keeps the swap from shifting text.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  // Upright only: the italic file is another ~50 KB for the odd disclaimer or
  // emphasis, which the browser can slant itself.
  style: ["normal"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c10" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.webmanifest",
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
    // Also on the generic robots tag so Bing and others show large image previews, not just Googlebot.
    "max-image-preview": "large",
    "max-snippet": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: siteTitle,
    description: siteShortDescription,
    url: siteUrl,
    siteName: "Kali Zubaan",
    // Indian English, matching inLanguage "en-IN" in the JSON-LD and the RSS feed.
    locale: "en_IN",
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
  // SearchAction points at the server-rendered /search?q= results page.
  // sameAs (social profiles) is left out until there are profiles to list.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        alternateName: siteAlternateNames,
        url: `${siteUrl}/`,
        description: siteDescription,
        inLanguage: "en-IN",
        publisher: { "@id": `${siteUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        alternateName: blogName,
        url: `${siteUrl}/`,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
          width: 600,
          height: 240,
        },
      },
    ],
  };

  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
      // The theme script sets data-theme before hydration.
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        {/* Lets feed readers and browsers discover the RSS feed from any page. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${blogName} RSS feed`}
          href="/feed.xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Umami: lazyOnload so analytics does not preload in <head> beside the LCP image. */}
        <Script
          defer
          src="https://umami-nu-eosin.vercel.app/script.js"
          data-website-id="42eaba06-6a90-4b1d-a504-785ddf302757"
          strategy="lazyOnload"
        />
        {/* AdSense loads only once a publisher id is configured, after the page is idle. */}
        {adsenseClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text font-sans">
        <SiteHeader />
        <div id="content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
