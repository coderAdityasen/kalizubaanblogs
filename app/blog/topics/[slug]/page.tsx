import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostSummaries } from "@/lib/post-summaries";
import { toSummaries } from "@/lib/blog-index";
import { getHub, TOPIC_HUBS } from "@/lib/hubs";
import PostCard from "@/components/blog/PostCard";
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
      locale: "en_IN",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${hub.name} on ${blogName}` }],
    },
  };
}

export default async function TopicHubPage({ params }: PageProps) {
  const { slug } = await params;
  const hub = getHub(slug);
  if (!hub) notFound();

  const posts = await getPostSummaries();
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
    inLanguage: "en-IN",
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
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="bg-surface-2">
        <div className="container-kz py-10 sm:py-14">
          <Breadcrumbs
            siteUrl={siteUrl}
            items={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: hub.name }]}
          />
          <p className="kicker mt-8 text-brand">Topic guide · {listed.length} articles</p>
          <h1 className="text-display mt-2 max-w-4xl text-ink">{hub.name}</h1>
          <p className="mt-4 max-w-3xl text-[1.0625rem] leading-relaxed text-muted sm:text-lg">{hub.description}</p>
        </div>
      </section>

      <div className="container-kz py-12 sm:py-14">
        {pillar && (
          <section aria-labelledby="pillar-heading" className="mb-16">
            <h2 id="pillar-heading" className="kicker mb-5 text-muted">
              Start here: the complete guide
            </h2>
            <PostCard post={toSummaries([pillar])[0]} variant="lead" priority headingLevel="h3" transitionName />
          </section>
        )}
        {clusterPosts.length > 0 && (
          <section aria-labelledby="path-heading">
            <h2 id="path-heading" className="text-h2 mb-2 text-ink">
              {pillar ? "Then read, in order" : `In ${hub.name}`}
            </h2>
            <p className="mb-6 text-[0.9375rem] text-muted">Short, focused posts that build on the guide, in reading order.</p>
            <ol className="divide-y divide-line border-y border-line">
              {toSummaries(clusterPosts).map((post, index) => (
                <li key={post.slug} className="flex items-start gap-5">
                  <span aria-hidden="true" className="pt-5 font-mono text-sm font-semibold text-brand tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <PostCard post={post} variant="compact" priority={!pillar && index === 0} />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}
