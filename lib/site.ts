export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";

export const siteName = "Kali Zubaan";

/**
 * What the blog actually covers. Keep these in sync with the categories posts
 * are published under (Personal Finance, Health, Side Hustles, Tech) so the
 * homepage title, meta description and structured data describe real content.
 */
export const siteTitle =
  "Kali Zubaan — Money, Health, Side Hustles & Tech in India";

export const siteDescription =
  "Independent Indian blog on personal finance and tax, health research, real side-hustle income stories and tech news, with the numbers checked.";

export const siteShortDescription =
  "Personal finance, health, side hustles and tech for India, explained plainly with the numbers checked.";

export const siteKeywords = [
  "Kali Zubaan",
  "kalizubaan",
  "kali zubaan blogs",
  "personal finance India",
  "income tax India",
  "investing and SIP",
  "health and nutrition",
  "protein and diet India",
  "side hustle ideas India",
  "small business income stories",
  "tech news India",
  "AI tools",
];

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
