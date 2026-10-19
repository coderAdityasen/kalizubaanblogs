import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts } from "@/lib/supabase";
import { getCategories, toSummaries } from "@/lib/blog-index";
import { pageHref, pageSlice, totalPagesFor } from "@/lib/pagination";
import BlogIndex from "@/components/BlogIndex";
import { absoluteUrl, blogIndexTitle, siteName } from "@/lib/site";

const basePath = "/blog";

const description =
  "The Kali Zubaan blog: every article on personal finance and tax, tech and AI, side hustles and fitness for India, newest first, with the numbers checked.";

/** Metadata for /blog (page 1) and /blog/page/<n>. Each page is its own canonical URL. */
export function blogArchiveMetadata(page: number): Metadata {
  const title = page > 1 ? `${blogIndexTitle} (Page ${page})` : blogIndexTitle;
  const url = absoluteUrl(pageHref(basePath, page));

  return {
    // absolute: skip the "%s | Kali Zubaan Blog" template so the brand isn't repeated.
    title: { absolute: title },
    description: page > 1 ? `Page ${page} of ${description.charAt(0).toLowerCase()}${description.slice(1)}` : description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: blogIndexTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export async function BlogArchive({ page }: { page: number }) {
  const posts = await getPosts(); // published only, newest first
  const totalPages = totalPagesFor(posts.length);

  if (page > totalPages) notFound();

  return (
    <BlogIndex
      title="Kali Zubaan Blog"
      intro="Every article on money and tax, health, side hustles and tech, newest first."
      posts={toSummaries(pageSlice(posts, page))}
      pageInfo={{ page, totalPages, totalItems: posts.length, basePath }}
      categories={getCategories(posts)}
    />
  );
}
