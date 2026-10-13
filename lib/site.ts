export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";

export const siteName = "Kali Zubaan";

/** Build an absolute URL on the site for canonical links and sitemaps. */
export function absoluteUrl(path = "/"): string {
  return `${siteUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Last time the legal pages (privacy, terms, disclaimer) were revised. */
export const legalLastUpdated = "October 13, 2026";

export const staticPages = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
] as const;
