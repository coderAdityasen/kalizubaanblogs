import type { Metadata } from "next";
import { getPosts } from "@/lib/supabase";
import { getCategories, toSummaries } from "@/lib/blog-index";
import BlogIndex from "@/components/BlogIndex";
import { absoluteUrl, blogIndexTitle, siteName } from "@/lib/site";

// ISR: serve a cached page, rebuild it in the background at most every 10 minutes.
export const revalidate = 600;

const description =
  "The Kali Zubaan blog: every article on personal finance and tax, tech and AI, side hustles and fitness for India, newest first, with the numbers checked.";

export const metadata: Metadata = {
  // absolute: skip the "%s | Kali Zubaan Blog" template so the brand isn't repeated.
  title: { absolute: blogIndexTitle },
  description,
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    type: "website",
    title: blogIndexTitle,
    description,
    url: absoluteUrl("/blog"),
    siteName,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: blogIndexTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: blogIndexTitle,
    description,
    images: ["/og-image.png"],
  },
};

export default async function BlogPage() {
  const posts = await getPosts(); // published only, newest first

  return (
    <BlogIndex
      title="Kali Zubaan Blog"
      intro="Every article on money and tax, health, side hustles and tech, newest first."
      posts={toSummaries(posts)}
      categories={getCategories(posts)}
    />
  );
}
