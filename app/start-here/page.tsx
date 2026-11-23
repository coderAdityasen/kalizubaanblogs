import type { Metadata } from "next";
import Link from "next/link";
import { getPostSummaries } from "@/lib/post-summaries";
import { getStartHere } from "@/lib/start-here";
import { TOPIC_HUBS } from "@/lib/hubs";
import PostCard from "@/components/blog/PostCard";
import SectionHeader from "@/components/blog/SectionHeader";
import Breadcrumbs from "@/components/Breadcrumbs";
import { absoluteUrl, pageSocialMetadata, siteName } from "@/lib/site";

export const revalidate = 600;

const title = "Start here: the best explainers on Kali Zubaan";
const description =
  "New to Kali Zubaan? Start with these in-depth, plain-English guides to personal finance, tech and AI, side hustles and health in India.";

export const metadata: Metadata = {
  title: "Start here",
  description,
  ...pageSocialMetadata({ title: `Start here | ${siteName}`, description, path: "/start-here" }),
};

export default async function StartHerePage() {
  const posts = await getPostSummaries();
  const sections = getStartHere(posts, 4);
  const live = new Set(posts.map((p) => p.slug));
  const hubs = TOPIC_HUBS.filter((h) => (h.pillarSlug && live.has(h.pillarSlug)) || h.postSlugs.some((s) => live.has(s)));
  const siteUrl = absoluteUrl("/");

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: sections
      .flatMap((s) => s.posts)
      .map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/blog/${p.slug}`) })),
  };

  return (
    <main className="container-kz py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <Breadcrumbs siteUrl={siteUrl.replace(/\/$/, "")} items={[{ name: "Home", href: "/" }, { name: "Start here" }]} />
      <header className="mt-6 max-w-3xl">
        <p className="kicker text-brand">Start here</p>
        <h1 className="text-display mt-3 text-ink">New here? Read these first.</h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">
          {siteName} explains money, tech, side income and health for readers in India, with every number checked
          against its source. These are the most complete guides in each section.
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.slug} aria-labelledby={`sh-${section.slug}`} className="cv-auto mt-14">
          <SectionHeader
            id={`sh-${section.slug}`}
            title={section.name}
            description={section.tagline}
            href={`/blog/category/${section.slug}`}
            linkLabel={`All ${section.name}`}
            cat={section.slug}
          />
          <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {section.posts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} variant="standard" />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {hubs.length > 0 && (
        <section aria-labelledby="sh-guides" className="mt-14">
          <SectionHeader id="sh-guides" title="Step-by-step guides" description="Topic series to read in order." />
          <ul className="grid gap-4 sm:grid-cols-2">
            {hubs.map((hub) => (
              <li key={hub.slug}>
                <Link
                  href={`/blog/topics/${hub.slug}`}
                  className="arrow-nudge flex h-full items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-line p-5 hover:border-muted"
                >
                  <span>
                    <span className="block font-semibold text-ink">{hub.name}</span>
                    <span className="mt-1 block text-sm text-muted">{hub.description}</span>
                  </span>
                  <span className="arrow text-xl text-muted" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
