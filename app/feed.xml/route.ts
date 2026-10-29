import { getPosts } from "@/lib/supabase";
import { absoluteUrl, authorName, blogName, contactEmail, siteDescription } from "@/lib/site";

// Cached like the sitemap: rebuilt at most every 10 minutes, and refreshed right
// away when a post is published or edited (the posts API revalidates /feed.xml).
export const revalidate = 600;

/** How many recent posts the feed lists. Readers only need the latest ones. */
const FEED_LIMIT = 20;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Cover images may be site-relative; feed readers need absolute URLs. */
function absoluteImage(src?: string): string | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) return absoluteUrl(src);
  return null;
}

export async function GET() {
  const posts = (await getPosts()).slice(0, FEED_LIMIT);
  const feedUrl = absoluteUrl("/feed.xml");
  const lastBuild = posts[0]
    ? new Date(posts[0].updated_at || posts[0].created_at)
    : new Date();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const image = absoluteImage(post.cover_image);
      const categories = [post.category, ...(post.tags || [])]
        .filter(Boolean)
        .map((c) => `      <category>${escapeXml(c)}</category>`)
        .join("\n");
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>`,
        `      <dc:creator>${escapeXml(post.author_name || authorName)}</dc:creator>`,
        `      <description>${escapeXml(post.excerpt || "")}</description>`,
        categories,
        image ? `      <media:content url="${escapeXml(image)}" medium="image" />` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(blogName)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en-IN</language>
    <managingEditor>${escapeXml(`${contactEmail} (${authorName})`)}</managingEditor>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
