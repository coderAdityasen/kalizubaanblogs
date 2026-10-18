import type { BlogPost, BlogPostSummary } from "@/types/blog";
import { slugify } from "@/lib/supabase";

export interface BlogCategory {
  name: string;
  slug: string;
  count: number;
}

/** URL slug for a category: "Tech & AI" -> "tech-ai", "Health & Fitness" -> "health-fitness". */
export function categorySlug(category: string): string {
  return slugify(category);
}

/** Categories in use, most posts first. */
export function getCategories(posts: Pick<BlogPost, "category">[]): BlogCategory[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (post.category) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => ({ name, slug: categorySlug(name), count })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

/** Drop the Markdown body so list pages only carry card data. */
export function toSummaries(posts: BlogPost[]): BlogPostSummary[] {
  return posts.map((post) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content, ...summary } = post;
    return summary;
  });
}
