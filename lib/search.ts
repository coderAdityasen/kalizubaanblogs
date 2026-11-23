import type { BlogPostSummary } from "@/types/blog";

/** Lower-case, strip accents and punctuation, split into words. */
function words(text: string): string[] {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}₹%]+/u)
    .filter((w) => w.length > 1);
}

/**
 * Simple ranked search over post titles, tags, excerpts and categories.
 * Every query word must match somewhere; title hits count most. Runs on the
 * server over the cached post list (no search service, no client bundle).
 */
export function searchPosts(posts: BlogPostSummary[], query: string, limit = 30): BlogPostSummary[] {
  const terms = [...new Set(words(query))].slice(0, 8);
  if (terms.length === 0) return [];
  const scored: { post: BlogPostSummary; score: number }[] = [];
  for (const post of posts) {
    const title = words(post.title).join(" ");
    const tags = words((post.tags || []).join(" ")).join(" ");
    const excerpt = words(post.excerpt || "").join(" ");
    const category = words(post.category || "").join(" ");
    let score = 0;
    let all = true;
    for (const t of terms) {
      const s =
        (title.includes(t) ? 6 : 0) + (tags.includes(t) ? 3 : 0) + (category.includes(t) ? 2 : 0) + (excerpt.includes(t) ? 1 : 0);
      if (s === 0) {
        all = false;
        break;
      }
      score += s;
    }
    if (!all) continue;
    if (title.includes(terms.join(" "))) score += 10;
    scored.push({ post, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || b.post.created_at.localeCompare(a.post.created_at))
    .slice(0, limit)
    .map((s) => s.post);
}
