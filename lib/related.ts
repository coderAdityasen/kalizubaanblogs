import type { BlogPost, BlogPostSummary } from "@/types/blog";

/**
 * Pick the posts most worth reading after `current`.
 *
 * Posts in the same category score highest, each shared tag adds a little,
 * and ties go to the newest post. If there aren't enough related posts, the
 * list is topped up with the latest articles so readers always get somewhere
 * to go next. Bodies are stripped so only card data reaches the page.
 */
export function getRelatedPosts(
  current: Pick<BlogPost, "slug" | "category" | "tags">,
  allPosts: BlogPost[],
  limit = 3
): BlogPostSummary[] {
  const currentCategory = (current.category || "").trim().toLowerCase();
  const currentTags = new Set((current.tags || []).map((t) => t.trim().toLowerCase()));

  const scored = allPosts
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      let score = 0;
      if (currentCategory && (p.category || "").trim().toLowerCase() === currentCategory) {
        score += 3;
      }
      for (const tag of p.tags || []) {
        if (currentTags.has(tag.trim().toLowerCase())) score += 1;
      }
      return { post: p, score, time: new Date(p.created_at).getTime() || 0 };
    })
    .sort((a, b) => b.score - a.score || b.time - a.time);

  return scored.slice(0, limit).map(({ post }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content, ...summary } = post;
    return summary;
  });
}
