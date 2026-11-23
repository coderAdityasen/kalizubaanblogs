import Link from "next/link";
import type { BlogPostSummary } from "@/types/blog";
import type { BlogCategory } from "@/lib/blog-index";
import PostCard from "@/components/PostCard";
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
 * Server-rendered article list for /blog and /blog/category/[slug]. Unlike the
 * homepage BlogList, the filters here are real links, so every category has its
 * own crawlable URL.
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

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/40 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="mb-4">
              <Breadcrumbs siteUrl={siteUrl} items={crumbs} />
            </div>
            {!activeCategory && (
              <span className="text-xs font-semibold tracking-wider uppercase text-rose-600 dark:text-rose-400 mb-2 block font-mono">
                Money · Health · Side Hustles · Tech
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
              {title}
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {intro}
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full flex-1">
        <nav
          aria-label="Blog categories"
          className="flex items-center gap-1.5 overflow-x-auto p-2 mb-10 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800"
        >
          <Link href="/blog" className={pill(!activeCategory)}>
            All
          </Link>
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/blog/category/${cat.slug}`} className={pill(activeCategory === cat.slug)}>
              {cat.name} <span className="font-normal">({cat.count})</span>
            </Link>
          ))}
        </nav>

        {posts.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">No articles here yet.</p>
        ) : (
          <>
            {/* Cards use <h3>; this keeps the outline h1 → h2 → h3 for screen readers. */}
            <h2 className="sr-only">{activeCategory ? `${title} articles` : "All articles"}</h2>
            <p className="mb-6 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {pageInfo.totalPages > 1
                ? `Showing ${first}–${last} of ${pageInfo.totalItems} articles, newest first (page ${pageInfo.page} of ${pageInfo.totalPages})`
                : `Showing ${posts.length} ${posts.length === 1 ? "article" : "articles"}, newest first`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <PostCard key={post.id || post.slug} post={post} priority={index === 0} />
              ))}
            </div>
            <Pagination {...pageInfo} />
          </>
        )}
      </main>
    </div>
  );
}
