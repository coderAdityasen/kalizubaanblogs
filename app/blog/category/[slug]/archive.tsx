import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts } from "@/lib/supabase";
import { categorySlug, getCategories, toSummaries } from "@/lib/blog-index";
import { pageHref, pageSlice, totalPagesFor } from "@/lib/pagination";
import BlogIndex from "@/components/BlogIndex";
import { absoluteUrl, blogName, siteName } from "@/lib/site";

const basePathFor = (slug: string) => `/blog/category/${slug}`;

/** Metadata for /blog/category/<slug> (page 1) and its /page/<n> pages. */
export async function categoryArchiveMetadata(slug: string, page: number): Promise<Metadata> {
  const category = getCategories(await getPosts()).find((cat) => cat.slug === slug);

  if (!category) {
    return { title: "Category Not Found", robots: { index: false } };
  }

  const pageSuffix = page > 1 ? ` (Page ${page})` : "";
  const title = `${category.name} Articles${pageSuffix}`; // -> "Personal Finance Articles | Kali Zubaan Blog"
  const description = `${category.name} articles from the ${blogName}: India-first explainers with the numbers checked.${page > 1 ? ` Page ${page}.` : ""}`;
  const url = absoluteUrl(pageHref(basePathFor(slug), page));

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${title} | ${blogName}`,
      description,
      url,
      siteName,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${category.name} on ${blogName}` }],
    },
  };
}

export async function CategoryArchive({ slug, page }: { slug: string; page: number }) {
  const posts = await getPosts();
  const categories = getCategories(posts);
  const category = categories.find((cat) => cat.slug === slug);

  if (!category) {
    notFound();
  }

  const inCategory = posts.filter((post) => categorySlug(post.category) === slug);
  const totalPages = totalPagesFor(inCategory.length);

  if (page > totalPages) {
    notFound();
  }

  return (
    <BlogIndex
      title={category.name}
      intro={`${category.count} ${category.name} ${category.count === 1 ? "article" : "articles"} from the Kali Zubaan Blog, newest first.`}
      posts={toSummaries(pageSlice(inCategory, page))}
      pageInfo={{ page, totalPages, totalItems: inCategory.length, basePath: basePathFor(slug) }}
      categories={categories}
      activeCategory={slug}
    />
  );
}
