import type { BlogPostSummary } from "@/types/blog";
import { categorySlug } from "@/lib/blog-index";
import { CATEGORIES } from "@/lib/design";

/**
 * Hand-picked "Start here" guides per section (post slugs, in order).
 * Leave a list empty to fall back to that section's most in-depth recent
 * posts (longest reading time among the latest 40), so the page never goes
 * stale or lists a slug that isn't published.
 */
export const START_HERE_PICKS: Record<string, string[]> = {
  "personal-finance": ["how-to-invest-in-ipo-in-india-allotment-gmp-listing-tax"],
  "tech-ai": [],
  "side-hustles": [],
  "health-fitness": [],
};

export interface StartHereSection {
  slug: string;
  name: string;
  tagline: string;
  posts: BlogPostSummary[];
}

export function getStartHere(posts: BlogPostSummary[], perSection = 4): StartHereSection[] {
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  return CATEGORIES.map((cat) => {
    const picked = (START_HERE_PICKS[cat.slug] ?? []).flatMap((s) => {
      const p = bySlug.get(s);
      return p ? [p] : [];
    });
    const inCat = posts.filter((p) => categorySlug(p.category) === cat.slug && !picked.includes(p));
    const deep = inCat
      .slice(0, 40)
      .sort((a, b) => (b.reading_time || 0) - (a.reading_time || 0) || b.created_at.localeCompare(a.created_at));
    return { slug: cat.slug, name: cat.name, tagline: cat.tagline, posts: [...picked, ...deep].slice(0, perSection) };
  }).filter((s) => s.posts.length > 0);
}
