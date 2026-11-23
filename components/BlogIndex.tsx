import Link from "next/link";
import type { BlogPostSummary } from "@/types/blog";
import type { BlogCategory } from "@/lib/blog-index";
import PostCard from "@/components/blog/PostCard";
import { getCategoryMeta } from "@/lib/design";
import AdSlot from "@/components/ads/AdSlot";
import Pagination from "@/components/Pagination";
import Breadcrumbs, { type Crumb } from "@/components/Breadcrumbs";
import { POSTS_PER_PAGE, pageHref, type PageInfo } from "@/lib/pagination";
import { absoluteUrl, siteUrl } from "@/lib/site";

interface BlogIndexProps {
  title: string;
  intro: string;
  /** Only the posts for the current page. */
  posts: BlogPostSummary[];
  pageInfo: PageInfo;
  categories: BlogCategory[];
  /** Slug of the category being shown; undefined on /blog. */
  activeCategory?: string;
}

/**
 * Server-rendered article list for /blog and /blog/category/[slug]. The
 * category tabs are real links, so every category has its own crawlable URL.
 */
export default function BlogIndex({ title, intro, posts, pageInfo, categories, activeCategory }: BlogIndexProps) {
  const first = (pageInfo.page - 1) * POSTS_PER_PAGE + 1;
  const last = first + posts.length - 1;
  const isLaterPage = pageInfo.page > 1;

  // Home › Blog › Category › Page n. The current page is the last crumb and
  // has no link; everything above it links back up the archive.
  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Blog", href: activeCategory || isLaterPage ? "/blog" : undefined },
    ...(activeCategory ? [{ name: title, href: isLaterPage ? pageInfo.basePath : undefined }] : []),
    ...(isLaterPage ? [{ name: `Page ${pageInfo.page}` }] : []),
  ];

  // Same CollectionPage + ItemList shape as the topic hubs, so Google can read
  // /blog and each category as a list of articles rather than a bare page.
  const pageUrl = absoluteUrl(pageHref(pageInfo.basePath, pageInfo.page));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection`,
    url: pageUrl,
    name: isLaterPage ? `${title} (Page ${pageInfo.page})` : title,
    description: intro,
    inLanguage: "en-IN",
    isPartOf: { "@id": `${absoluteUrl("/")}#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: first + index,
        url: absoluteUrl(`/blog/${post.slug}`),
        name: post.title,
      })),
    },
  };

  const meta = activeCategory ? getCategoryMeta(activeCategory) : undefined;
  // Category page 1 opens with its newest post as a wide feature.
  const featured = activeCategory && !isLaterPage ? posts[0] : undefined;
  const gridPosts = featured ? posts.slice(1) : posts;

  const tab = (active: boolean) =>
    `relative inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap px-1 text-[0.9375rem] transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-accent after:transition-transform after:origin-left ${
      active ? "font-semibold text-ink after:scale-x-100" : "text-muted hover:text-ink after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <main data-cat={activeCategory}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="container-kz pt-8 sm:pt-10">
        <Breadcrumbs siteUrl={siteUrl} items={crumbs} />
        <div className="mt-6 max-w-3xl">
          <p className="kicker text-accent">{activeCategory ? "Section" : "Money · Health · Side Hustles · Tech"}</p>
          <h1 className="text-display mt-2 text-ink">{title}</h1>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted sm:text-lg">{meta?.tagline ? `${meta.tagline} ${intro}` : intro}</p>
        </div>

        <nav aria-label="Blog categories" className="mt-8 border-b border-line">
          <ul className="-mb-px flex gap-6 overflow-x-auto [scrollbar-width:none]">
            <li>
              <Link href="/blog" aria-current={!activeCategory ? "page" : undefined} className={tab(!activeCategory)}>
                All
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug} data-cat={cat.slug}>
                <Link href={`/blog/category/${cat.slug}`} aria-current={activeCategory === cat.slug ? "page" : undefined} className={tab(activeCategory === cat.slug)}>
                  {cat.name} <span className="font-mono text-xs text-muted">{cat.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <div className="container-kz py-10 sm:py-12">
        {posts.length === 0 ? (
          <p className="py-16 text-center text-muted">No articles here yet.</p>
        ) : (
          <>
            {/* Cards use <h3>; this keeps the outline h1 → h2 → h3 for screen readers. */}
            <h2 className="sr-only">{activeCategory ? `${title} articles` : "All articles"}</h2>
            <p className="kicker mb-8 text-muted">
              {pageInfo.totalPages > 1
                ? `Showing ${first}–${last} of ${pageInfo.totalItems} articles, newest first (page ${pageInfo.page} of ${pageInfo.totalPages})`
                : `Showing ${posts.length} ${posts.length === 1 ? "article" : "articles"}, newest first`}
            </p>
            {featured && (
              <div className="mb-14 border-b border-line pb-14">
                <PostCard post={featured} variant="lead" priority transitionName />
              </div>
            )}
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post, index) => (
                <PostCard key={post.id || post.slug} post={post} priority={!featured && index === 0} transitionName />
              ))}
            </div>
            <AdSlot placement="listing" />
            <Pagination {...pageInfo} />
          </>
        )}
      </div>
    </main>
  );
}
