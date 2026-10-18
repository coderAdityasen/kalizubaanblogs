import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts } from "@/lib/supabase";
import { categorySlug, getCategories, toSummaries } from "@/lib/blog-index";
import BlogIndex from "@/components/BlogIndex";
import { absoluteUrl, blogName, siteName } from "@/lib/site";

// ISR, 10 minutes. Categories that appear later are rendered on first request.
export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return getCategories(posts).map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategories(await getPosts()).find((cat) => cat.slug === slug);

  if (!category) {
    return { title: "Category Not Found", robots: { index: false } };
  }

  const title = `${category.name} Articles`; // -> "Personal Finance Articles | Kali Zubaan Blog"
  const description = `${category.name} articles from the ${blogName}: India-first explainers with the numbers checked.`;
  const url = absoluteUrl(`/blog/category/${slug}`);

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

export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const posts = await getPosts();
  const categories = getCategories(posts);
  const category = categories.find((cat) => cat.slug === slug);

  if (!category) {
    notFound();
  }

  const inCategory = posts.filter((post) => categorySlug(post.category) === slug);

  return (
    <BlogIndex
      title={category.name}
      intro={`${category.count} ${category.name} ${category.count === 1 ? "article" : "articles"} from the Kali Zubaan Blog, newest first.`}
      posts={toSummaries(inCategory)}
      categories={categories}
      activeCategory={slug}
    />
  );
}
