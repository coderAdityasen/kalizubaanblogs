import type { Metadata } from "next";
import Link from "next/link";
import { checkSupabaseStatus } from "@/lib/supabase";
import { getPostSummaries } from "@/lib/post-summaries";
import AdminSetupBanner from "@/components/AdminSetupBanner";
import PostCard from "@/components/blog/PostCard";
import SectionHeader from "@/components/blog/SectionHeader";
import NewsletterForm from "@/components/blog/NewsletterForm";
import AdSlot from "@/components/ads/AdSlot";
import { CATEGORIES } from "@/lib/design";
import { categorySlug } from "@/lib/blog-index";
import { TOPIC_HUBS } from "@/lib/hubs";
import { getStartHere } from "@/lib/start-here";
import { blogName, siteShortDescription } from "@/lib/site";
import type { BlogPostSummary } from "@/types/blog";

// ISR: served from the CDN cache and rebuilt in the background at most every
// 10 minutes (publishing through the API refreshes it immediately).
export const revalidate = 600;

// The homepage's canonical lives here rather than in the root layout, so pages
// without their own (the 404 page) don't point Google at the homepage.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const RIVER_COUNT = 6;
const PER_SECTION = 4;

export default async function HomePage() {
  const [posts, supabaseStatus] = await Promise.all([getPostSummaries(), checkSupabaseStatus()]);

  // Each post appears once on the page: lead, then the Latest river, then
  // the newest remaining posts of each section.
  const shown = new Set<string>();
  const take = (list: BlogPostSummary[], n: number) => {
    const picked = list.filter((p) => !shown.has(p.slug)).slice(0, n);
    picked.forEach((p) => shown.add(p.slug));
    return picked;
  };

  const [lead] = take(posts, 1);
  const river = take(posts, RIVER_COUNT);
  const sections = CATEGORIES.map((cat) => ({
    ...cat,
    count: posts.filter((p) => categorySlug(p.category) === cat.slug).length,
    posts: take(
      posts.filter((p) => categorySlug(p.category) === cat.slug),
      PER_SECTION
    ),
  })).filter((s) => s.posts.length > 0);

  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const hubs = TOPIC_HUBS.map((hub) => ({
    hub,
    pillar: hub.pillarSlug ? bySlug.get(hub.pillarSlug) : undefined,
    posts: hub.postSlugs.flatMap((s) => (bySlug.get(s) ? [bySlug.get(s)!] : [])).slice(0, 3),
  })).filter((h) => h.pillar || h.posts.length);

  const startHere = getStartHere(posts, 1).map((s) => ({ section: s, post: s.posts[0] }));

  return (
    <main>
      <AdminSetupBanner status={supabaseStatus} />

      {/* Masthead */}
      <section className="container-kz pt-8 pb-6 sm:pt-10">
        <div className="flex flex-col gap-2 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-h1 text-ink">{blogName}</h1>
          <p className="max-w-md text-[0.9375rem] text-muted sm:text-right">{siteShortDescription}</p>
        </div>
      </section>

      {/* Lead story + Latest river */}
      {lead ? (
        <section aria-label="Top stories" className="container-kz">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] lg:gap-12">
            <PostCard post={lead} variant="lead" stacked priority headingLevel="h2" transitionName />
            <div className="lg:border-l lg:border-line lg:pl-10">
              <h2 id="latest" className="kicker flex items-center gap-2 text-ink">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-brand opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                </span>
                Latest
              </h2>
              <div className="mt-2 divide-y divide-line">
                {river.map((post) => (
                  <PostCard key={post.slug} post={post} variant="row" />
                ))}
              </div>
              <Link href="/blog" className="arrow-nudge mt-4 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-brand">
                All {posts.length} articles <span className="arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <p className="container-kz py-20 text-center text-muted">No articles published yet.</p>
      )}

      <AdSlot placement="home" className="container-kz" />

      {/* One block per section */}
      <div className="container-kz mt-16 space-y-16 sm:mt-20 sm:space-y-20">
        {sections.map((section) => (
          <section key={section.slug} aria-labelledby={`sec-${section.slug}`} className="reveal cv-auto">
            <SectionHeader
              id={`sec-${section.slug}`}
              title={section.name}
              description={section.tagline}
              href={`/blog/category/${section.slug}`}
              linkLabel={`All ${section.count}`}
              cat={section.slug}
            />
            <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10">
              <PostCard post={section.posts[0]} transitionName />
              {section.posts.length > 1 && (
                <div className="divide-y divide-line md:-mt-4">
                  {section.posts.slice(1).map((post) => (
                    <PostCard key={post.slug} post={post} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Topic guides */}
      {hubs.map(({ hub, pillar, posts: hubPosts }) => (
        <section key={hub.slug} aria-labelledby={`hub-${hub.slug}`} className="reveal cv-auto mt-20 bg-surface-2 py-14">
          <div className="container-kz grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <div>
              <p className="kicker text-brand">Topic guide</p>
              <h2 id={`hub-${hub.slug}`} className="text-h1 mt-2 text-ink">
                {hub.name}
              </h2>
              <p className="mt-3 max-w-lg text-[1.0625rem] leading-relaxed text-muted">{hub.description}</p>
              <Link href={`/blog/topics/${hub.slug}`} className="btn btn-primary mt-6">
                Read the guide <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ol className="space-y-3">
              {[...(pillar ? [pillar] : []), ...hubPosts].map((post, i) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="card-surface card-lift group flex items-start gap-4 p-4 sm:p-5">
                    <span className="text-sm font-bold text-brand tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold leading-snug text-ink group-hover:text-brand transition-colors">{post.title}</span>
                      <span className="kicker mt-1 block text-muted">
                        {i === 0 && pillar ? "Complete guide · " : ""}
                        {post.reading_time} min read
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}

      {/* Start here + newsletter */}
      <section aria-labelledby="start-here-heading" className="reveal cv-auto container-kz mt-20">
        <SectionHeader id="start-here-heading" title="New here? Start with these" href="/start-here" linkLabel="Start here" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {startHere.map(({ section, post }) => (
            <div key={section.slug} data-cat={section.slug}>
              <p className="kicker mb-3 text-accent">{section.name}</p>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="newsletter-heading" className="reveal cv-auto container-kz mt-20">
        <div className="grid gap-8 rounded-[var(--radius-lg)] border border-line bg-surface p-6 sm:p-10 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="kicker text-brand">Newsletter</p>
            <h2 id="newsletter-heading" className="text-h2 mt-2 text-ink">
              One email when something is worth your time
            </h2>
            <p className="mt-2 text-[0.9375rem] text-muted">New guides on money, health, side hustles and tech in India. No spam, unsubscribe any time.</p>
          </div>
          <NewsletterForm source="home" />
        </div>
      </section>
    </main>
  );
}
