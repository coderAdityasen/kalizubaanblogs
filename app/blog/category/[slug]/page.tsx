import type { Metadata } from "next";
import { getPostSummaries } from "@/lib/post-summaries";
import { getCategories } from "@/lib/blog-index";
import { CategoryArchive, categoryArchiveMetadata } from "./archive";
import { paramsOrNone } from "@/lib/build-safe";

// ISR, 10 minutes. Categories that appear later are rendered on first request.
export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return paramsOrNone("/blog/category/[slug] params", async () =>
    getCategories(await getPostSummaries()).map((cat) => ({ slug: cat.slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return categoryArchiveMetadata(slug, 1);
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  return <CategoryArchive slug={slug} page={1} />;
}
