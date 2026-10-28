import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts } from "@/lib/supabase";
import { toSummaries } from "@/lib/blog-index";
import { getHub, TOPIC_HUBS } from "@/lib/hubs";
import PostCard from "@/components/PostCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { absoluteUrl, blogName, siteName } from "@/lib/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export function generateStaticParams() {
  return TOPIC_HUBS.map((hub) => ({ slug: hub.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hub = getHub(slug);
  if (!hub) {
    return { title: "Topic Not Found", robots: { index: false } };
  }
  const url = absoluteUrl(`/blog/topics/${hub.slug}`);
  return {
    title: `${hub.name}: Guide and Articles`,
    description: hub.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${hub.name} | ${blogName}`,
      description: hub.description,
      url,
      siteName,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${hub.name} on ${blogName}` }],
    },
  };
}

export default async function TopicHubPage({ params }: PageProps) {
  const { slug } = await params;
  const hub = getHub(slug);
  if (!hub) notFound();

  const posts = await getPosts();
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const pillar = hub.pillarSlug ? bySlug.get(hub.pillarSlug) : undefined;
  const clusterPosts = hub.postSlugs.flatMap((s) => {
    const post = bySlug.get(s);
    return post ? [post] : [];
  });
  if (!pillar && clusterPosts.length === 0) notFound();

  const listed = [...(pillar ? [pillar] : []), ...clusterPosts];
  const url = absoluteUrl(`/blog/topics/${hub.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.name,
    description: hub.description,
    url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: listed.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/blog/${post.slug}`),
        name: post.title,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/40 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <Breadcrumbs
              siteUrl={siteUrl}
              items={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: hub.name }]}
            />
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl tracking-tight text-zinc-900 dark:text-white">
            {hub.name}
          </h1>
          <p className="mt-4 max-w-3xl text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {hub.description}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {pillar && (
          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Start here: the complete guide
            </h2>
            <PostCard post={toSummaries([pillar])[0]} featured />
          </section>
        )}
        {clusterPosts.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              More in {hub.name}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {toSummaries(clusterPosts).map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
