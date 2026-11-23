/**
 * Redesign switches that Aditya may change. Each one is a single edit here.
 */

/**
 * Colour theme before the reader picks one with the header toggle.
 * "system" follows the device setting; "light"/"dark" force a default.
 */
export const DEFAULT_THEME: "system" | "light" | "dark" = "system";

/** Article body typeface: "serif" (Source Serif 4, Medium/Substack style) or "sans" (Geist). */
export const ARTICLE_BODY_FONT: "serif" | "sans" = "serif";

/** localStorage key the theme toggle writes. */
export const THEME_STORAGE_KEY = "kz-theme";

export interface CategoryMeta {
  slug: string;
  name: string;
  /** Short label for the header nav. */
  navLabel: string;
  /** One line shown on category pages and home sections. */
  tagline: string;
}

/**
 * The four sections, in nav order. Slugs match categorySlug(category) of the
 * category names posts are published under. Categories not listed here still
 * work everywhere (they just aren't in the header) and use the brand colour.
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "personal-finance",
    name: "Personal Finance",
    navLabel: "Money",
    tagline: "Tax, IPOs, SIPs, FDs and loans for Indian households, with the maths shown.",
  },
  {
    slug: "tech-ai",
    name: "Tech & AI",
    navLabel: "Tech & AI",
    tagline: "AI tools, phones and tech news, priced in rupees and tested on Indian networks.",
  },
  {
    slug: "side-hustles",
    name: "Side Hustles",
    navLabel: "Side Hustles",
    tagline: "Real income stories and side businesses from India, with the numbers behind them.",
  },
  {
    slug: "health-fitness",
    name: "Health & Fitness",
    navLabel: "Health",
    tagline: "Diet, protein, fitness and health research, explained for Indian kitchens and budgets.",
  },
];

export function getCategoryMeta(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
