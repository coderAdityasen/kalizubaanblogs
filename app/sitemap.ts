import { MetadataRoute } from "next";
import { getPosts } from "@/lib/supabase";
import { absoluteUrl, staticPages } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";
  const posts = await getPosts();

  const postsUrls = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
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
