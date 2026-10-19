import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getPosts } from "@/lib/supabase";
import { getCategories } from "@/lib/blog-index";
import { laterPageParams, parsePageParam } from "@/lib/pagination";
import { CategoryArchive, categoryArchiveMetadata } from "../../archive";

// ISR, 10 minutes. Pages that appear as new posts are published render on first request.
export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string; page: string }>;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return getCategories(posts).flatMap((cat) =>
    laterPageParams(cat.count).map(({ page }) => ({ slug: cat.slug, page }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, page: raw } = await params;
  const page = parsePageParam(raw);
  if (!page) return { title: "Page Not Found", robots: { index: false } };
  return categoryArchiveMetadata(slug, page);
}

export default async function CategoryArchivePage({ params }: PageProps) {
  const { slug, page: raw } = await params;
  const page = parsePageParam(raw);
  if (!page) notFound();
  // Page 1 already lives at /blog/category/<slug>; keep a single URL for it.
  if (page === 1) permanentRedirect(`/blog/category/${slug}`);
  return <CategoryArchive slug={slug} page={page} />;
}
