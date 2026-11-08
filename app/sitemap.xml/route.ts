import { getPosts } from "@/lib/supabase";
import { absoluteUrl, authorPagePath, staticPages } from "@/lib/site";
import { getCategories } from "@/lib/blog-index";
import { TOPIC_HUBS } from "@/lib/hubs";

// Cached like /feed.xml: rebuilt at most every 10 minutes, and refreshed right
// away when a post is published or edited (the posts API revalidates /sitemap.xml).
// A route handler is used instead of app/sitemap.ts because Next's metadata
// sitemap was generated once at deploy and ignored both `export const revalidate`
// and revalidatePath("/sitemap.xml"), so new posts stayed hidden from crawlers
// until the next deploy.
export const revalidate = 600;

type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
  images?: string[];
};

function postImages(post: { cover_image?: string | null; content?: string | null }): string[] {
  const urls = new Set<string>();
  if (post.cover_image) urls.add(post.cover_image);
  for (const m of (post.content || "").matchAll(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g)) urls.add(m[1]);
  return [...urls].slice(0, 10);
}

async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";
  const posts = await getPosts();

  const postsUrls = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
    // Image sitemap entries: cover plus any images embedded in the post body.
    images: postImages(post),
  }));

  const latestPostDate = posts[0]
    ? new Date(posts[0].updated_at || posts[0].created_at)
    : new Date();

  const categoryUrls = getCategories(posts).map((cat) => {
    const newest = posts.find((post) => post.category === cat.name);
    return {
      url: absoluteUrl(`/blog/category/${cat.slug}`),
      lastModified: newest ? new Date(newest.updated_at || newest.created_at) : latestPostDate,
      changeFrequency: "daily" as const,
      priority: 0.7,
    };
  });

  return [
    {
      // The homepage only changes when a post does, so report that date rather
      // than "now" (a lastmod that always moves gets ignored by Google).
      url: siteUrl,
      lastModified: latestPostDate,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: latestPostDate,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...categoryUrls,
    // Topic hubs (pillar-cluster pages), only when at least one of their posts is live.
    ...TOPIC_HUBS.flatMap((hub) => {
      const hubPosts = posts.filter(
        (post) => post.slug === hub.pillarSlug || hub.postSlugs.includes(post.slug)
      );
      if (hubPosts.length === 0) return [];
      const newest = hubPosts.reduce((a, b) =>
        (a.updated_at || a.created_at) > (b.updated_at || b.created_at) ? a : b
      );
      return [
        {
          url: absoluteUrl(`/blog/topics/${hub.slug}`),
          lastModified: new Date(newest.updated_at || newest.created_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        },
      ];
    }),
    {
      url: absoluteUrl(authorPagePath),
      lastModified: latestPostDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...staticPages.map((page) => ({
      url: absoluteUrl(page.href),
      lastModified: new Date("2026-10-13"),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...postsUrls,
  ];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const images = (entry.images || [])
        .map(
          (src) =>
            `    <image:image>\n      <image:loc>${escapeXml(src)}</image:loc>\n    </image:image>`
        )
        .join("\n");
      return [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        images,
        `    <lastmod>${entry.lastModified.toISOString()}</lastmod>`,
        `    <changefreq>${entry.changeFrequency}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}

export async function GET() {
  const xml = toXml(await getSitemapEntries());
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
