import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getPosts } from "@/lib/supabase";
import { laterPageParams, parsePageParam } from "@/lib/pagination";
import { BlogArchive, blogArchiveMetadata } from "../../archive";

// ISR, 10 minutes. Pages that appear as new posts are published render on first request.
export const revalidate = 600;

interface PageProps {
  params: Promise<{ page: string }>;
}

export async function generateStaticParams() {
  return laterPageParams((await getPosts()).length);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = parsePageParam((await params).page);
  if (!page) return { title: "Page Not Found", robots: { index: false } };
  return blogArchiveMetadata(page);
}

export default async function BlogArchivePage({ params }: PageProps) {
  const page = parsePageParam((await params).page);
  if (!page) notFound();
  // Page 1 already lives at /blog; keep a single URL for it.
  if (page === 1) permanentRedirect("/blog");
  return <BlogArchive page={page} />;
}
