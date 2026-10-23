import { MetadataRoute } from "next";
import { getPosts } from "@/lib/supabase";
import { absoluteUrl, staticPages } from "@/lib/site";
import { getCategories } from "@/lib/blog-index";

// Cached like the pages it lists: regenerated at most every 10 minutes instead
// of querying Supabase on every crawler hit.
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";
  const posts = await getPosts();

  const postsUrls = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
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
    ...staticPages.map((page) => ({
      url: absoluteUrl(page.href),
      lastModified: new Date("2026-10-13"),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...postsUrls,
  ];
}
