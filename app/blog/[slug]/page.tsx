import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getPostBySlug as fetchPostBySlug } from "@/lib/supabase";
import { getPostSummaries } from "@/lib/post-summaries";
import MarkdownContent from "@/components/MarkdownContent";
import ShareBar from "@/components/ShareBar";
import RelatedPosts from "@/components/RelatedPosts";
import { getRelatedPosts } from "@/lib/related";
import SmartImage from "@/components/SmartImage";
import AuthorAvatar from "@/components/AuthorAvatar";
import Kicker from "@/components/blog/Kicker";
import AuthorBox from "@/components/blog/AuthorBox";
import TocRail from "@/components/blog/TocRail";
import AdSlot, { adSlotEnabled } from "@/components/ads/AdSlot";
import { formatDate } from "@/lib/format";
import type { BlogPostSummary } from "@/types/blog";
import Breadcrumbs from "@/components/Breadcrumbs";
import { postTitleTag } from "@/lib/title-tag";
import { categorySlug } from "@/lib/blog-index";
import { absoluteUrl, authorName, authorPagePath } from "@/lib/site";
import { faqJsonLd } from "@/lib/faq";
import { getHubForPost } from "@/lib/hubs";
import { extractHeadings, slugifyHeading, type TocHeading } from "@/lib/toc";
import TableOfContents, { MIN_TOC_SECTIONS } from "@/components/TableOfContents";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";

/** generateMetadata and the page share one database read per request. */
const getPostBySlug = cache(fetchPostBySlug);

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Re-render each article at most once a day (ISR) as a safety net. Publishing
 * or editing through the API refreshes the page immediately (lib/revalidate.ts),
 * so a long window costs nothing in freshness and saves ~240 database reads
 * an hour against the Supabase quota.
 */
export const revalidate = 86400;

export async function generateStaticParams() {
  const posts = await getPostSummaries();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate rich SEO metadata for Google & social sharing
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  const articleUrl = `${siteUrl}/blog/${post.slug}`;
  const ogImage = post.cover_image || `${siteUrl}/og-image.png`;

  return {
    // Long headlines drop or shorten the brand suffix so the headline is not cut off in search results.
    title: postTitleTag(post.title),
    description: post.excerpt || `${post.title} — Read on Kali Zubaan.`,
    keywords: [
      ...post.tags,
      post.category,
      "Kali Zubaan",
      "kalizubaan",
    ],
    authors: [{ name: post.author_name || "Aditya" }],
    creator: post.author_name || "Aditya",
    publisher: "Kali Zubaan",
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: articleUrl,
      siteName: "Kali Zubaan",
      // A page-level openGraph replaces the layout one, so the locale is repeated here.
      locale: "en_IN",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: [post.author_name || "Aditya"],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          // Pipeline covers are 1600x900 (16:9); the fallback og-image is 1200x630.
          width: post.cover_image ? 1600 : 1200,
          height: post.cover_image ? 900 : 630,
          alt: post.excerpt ? `${post.title}: ${post.excerpt}`.slice(0, 200) : post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
      creator: "@kalizubaan",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getPostSummaries()]);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post, allPosts, 3);

  const modifiedAt = post.updated_at || post.created_at;
  // Show "Updated" only when the edit is on a later day than publishing.
  const showUpdated = formatDate(modifiedAt, "long") !== formatDate(post.created_at, "long");
  const hub = getHubForPost(post.slug);

  const articleUrl = `${siteUrl}/blog/${post.slug}`;

  // Posts by the site's own author link to the author page, which carries the
  // author bio. Google uses author.url to tell who wrote the article.
  const isSiteAuthor = !post.author_name || [authorName, "Aditya"].includes(post.author_name);

  // Google Rich Snippets / Structured Data (Schema.org BlogPosting)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    inLanguage: "en-IN",
    // ImageObject with real dimensions so Google can use the cover for Discover / Top stories (needs >= 1200px wide).
    image: post.cover_image
      ? [{ "@type": "ImageObject", url: post.cover_image, width: 1600, height: 900, caption: post.title }]
      : [{ "@type": "ImageObject", url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
    thumbnailUrl: post.cover_image || `${siteUrl}/og-image.png`,
    datePublished: post.created_at,
    dateModified: modifiedAt,
    author: {
      "@type": "Person",
      name: post.author_name || "Aditya",
      ...(isSiteAuthor
        ? { "@id": `${absoluteUrl(authorPagePath)}#person`, url: absoluteUrl(authorPagePath) }
        : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "Kali Zubaan",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
        width: 600,
        height: 240,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    timeRequired: `PT${post.reading_time || 3}M`,
  };

  // FAQPage structured data, built from the "## FAQs" section of the post.
  const faqLd = faqJsonLd(post.content, articleUrl);

  const headings = extractHeadings(post.content);
  const sections = headings.filter((h) => h.depth === 2);
  const hasToc = sections.length >= MIN_TOC_SECTIONS;
  const [bodyStart, bodyRest] = splitForInArticleAd(post.content, headings);
  const { newer, older } = neighboursInCategory(post.slug, post.category, allPosts);
  const catSlug = post.category ? categorySlug(post.category) : undefined;

  return (
    <>
      {/* Schema.org Article Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Reading progress: pure CSS (scroll-driven animation), hidden where unsupported. */}
      <div className="reading-progress" aria-hidden="true" />

      <main data-cat={catSlug}>
        <article className="pb-16">
          <header className="container-kz pt-6 sm:pt-8">
            <div className="mx-auto max-w-[46rem]">
              {/* Breadcrumbs (also emitted as BreadcrumbList structured data) */}
              <Breadcrumbs
                siteUrl={siteUrl}
                items={[
                  { name: "Home", href: "/" },
                  { name: "Blog", href: "/blog" },
                  ...(post.category
                    ? [{ name: post.category, href: `/blog/category/${categorySlug(post.category)}` }]
                    : []),
                  { name: post.title },
                ]}
              />

              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
                <Kicker category={post.category} />
                {/* Topic guide this post belongs to (pillar-cluster internal link) */}
                {hub && (
                  <Link href={`/blog/topics/${hub.slug}`} className="kicker text-muted hover:text-ink">
                    · Part of the guide: <span className="underline underline-offset-2">{hub.name}</span>
                  </Link>
                )}
              </div>

              <h1 className="text-display mt-3 text-balance text-ink">{post.title}</h1>

              {post.excerpt && (
                <p className="mt-4 text-pretty text-lg leading-relaxed text-muted sm:text-xl">{post.excerpt}</p>
              )}

              {/* Byline */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
                <div className="flex items-center gap-3">
                  <AuthorAvatar
                    name={post.author_name}
                    avatar={post.author_avatar}
                    size={40}
                    className="h-10 w-10 rounded-full bg-brand-soft text-brand"
                    textClassName="text-sm"
                  />
                  <div className="text-sm leading-snug">
                    <p className="font-semibold text-ink">
                      By{" "}
                      {isSiteAuthor ? (
                        <Link href={authorPagePath} rel="author" className="hover:text-brand">
                          {post.author_name}
                        </Link>
                      ) : (
                        post.author_name
                      )}
                    </p>
                    <p className="text-muted">
                      <time dateTime={post.created_at}>{formatDate(post.created_at, "long")}</time>
                      {showUpdated && (
                        <>
                          {" · Updated "}
                          <time dateTime={modifiedAt}>{formatDate(modifiedAt, "long")}</time>
                        </>
                      )}
                      {" · "}
                      {post.reading_time} min read
                    </p>
                  </div>
                </div>
                <ShareBar title={post.title} url={articleUrl} />
              </div>
            </div>

            {/* Cover image: wider than the text column, shares a View Transition name with its card. */}
            {post.cover_image && (
              <figure className="mx-auto mt-8 max-w-[68rem]">
                <div
                  className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] bg-surface-2"
                  style={{ viewTransitionName: `cover-${post.slug}` }}
                >
                  <SmartImage
                    src={post.cover_image}
                    alt={post.title}
                    width={1600}
                    height={900}
                    sizes="(min-width: 1120px) 1088px, 100vw"
                    loading="eager"
                    fetchPriority="high"
                    className="h-full w-full object-cover"
                  />
                </div>
              </figure>
            )}
          </header>

          <div className="container-kz mt-10 grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)_13rem] xl:gap-14">
            {/* Left rail: contents (desktop) */}
            <div className="hidden lg:block">{hasToc && <TocRail headings={sections} />}</div>

            <div className="mx-auto w-full min-w-0 max-w-[var(--measure)]">
              {/* Jump links for phones/tablets (renders nothing for short posts) */}
              <TableOfContents headings={headings} className="no-print mb-8 lg:hidden" />

              <MarkdownContent content={bodyStart} />
              {bodyRest && (
                <>
                  <AdSlot placement="in_article" />
                  <MarkdownContent content={bodyRest} />
                </>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 border-t border-line pt-6">
                  <h2 className="kicker text-muted">Tagged</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <li key={tag} className="chip">
                        #{tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-10">
                <AuthorBox name={post.author_name || authorName} avatar={post.author_avatar} />
              </div>

              {hub && (
                <Link
                  href={`/blog/topics/${hub.slug}`}
                  className="arrow-nudge mt-6 flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-line p-5 hover:border-muted"
                >
                  <span>
                    <span className="kicker block text-accent">Topic guide</span>
                    <span className="mt-1 block font-semibold text-ink">{hub.name}: read the whole series in order</span>
                  </span>
                  <span className="arrow text-xl text-muted" aria-hidden="true">
                    →
                  </span>
                </Link>
              )}

              <AdSlot placement="article_end" />
            </div>

            {/* Right rail: share (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-3">
                <p className="kicker text-muted">Share</p>
                <ShareBar title={post.title} url={articleUrl} layout="stack" />
              </div>
            </div>
          </div>
        </article>

        <div className="container-kz">
          {/* Related articles: next step for readers, internal links for search engines */}
          <RelatedPosts posts={relatedPosts} />

          {(newer || older) && post.category && (
            <nav aria-label={`More in ${post.category}`} className="mt-14 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
              {older ? (
                <NeighbourLink post={older} label={`Previous in ${post.category}`} />
              ) : (
                <span />
              )}
              {newer && <NeighbourLink post={newer} label={`Next in ${post.category}`} align="right" />}
            </nav>
          )}
        </div>
      </main>
    </>
  );
}

function NeighbourLink({ post, label, align = "left" }: { post: BlogPostSummary; label: string; align?: "left" | "right" }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group block rounded-[var(--radius-lg)] p-4 hover:bg-surface ${align === "right" ? "sm:text-right" : ""}`}
    >
      <span className="kicker block text-muted">
        {align === "right" ? `${label} →` : `← ${label}`}
      </span>
      <span className="mt-1.5 block font-semibold leading-snug text-ink group-hover:text-brand">{post.title}</span>
    </Link>
  );
}

/** The posts just before and after this one in the same category (by date). */
function neighboursInCategory(slug: string, category: string, all: BlogPostSummary[]) {
  const same = all
    .filter((p) => p.category === category)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const i = same.findIndex((p) => p.slug === slug);
  if (i === -1) return { newer: undefined, older: undefined };
  return { newer: same[i - 1], older: same[i + 1] };
}

/**
 * Split the body before its third section so one in-article ad can sit
 * between sections. Only when that ad is configured, and only when every
 * heading id is unique (rendering two halves restarts id de-duplication).
 */
function splitForInArticleAd(content: string, headings: TocHeading[]): [string, string | null] {
  if (!adSlotEnabled("in_article")) return [content, null];
  const h2s = headings.filter((h) => h.depth === 2);
  if (h2s.length < 4) return [content, null];
  if (headings.some((h) => h.id !== slugifyHeading(h.text))) return [content, null];
  const lines = content.split(/\r?\n/);
  const at = h2s[2].line - 1;
  return [lines.slice(0, at).join("\n"), lines.slice(at).join("\n")];
}
