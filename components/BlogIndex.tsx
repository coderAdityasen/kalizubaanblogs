import Link from "next/link";
import type { BlogPostSummary } from "@/types/blog";
import type { BlogCategory } from "@/lib/blog-index";
import PostCard from "@/components/PostCard";

interface BlogIndexProps {
  title: string;
  intro: string;
  posts: BlogPostSummary[];
  categories: BlogCategory[];
  /** Slug of the category being shown; undefined on /blog. */
  activeCategory?: string;
}

/**
 * Server-rendered article list for /blog and /blog/category/[slug]. Unlike the
 * homepage BlogList, the filters here are real links, so every category has its
 * own crawlable URL.
 */
export default function BlogIndex({ title, intro, posts, categories, activeCategory }: BlogIndexProps) {
  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950">
      <section className="border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/40 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            {activeCategory ? (
              <Link
                href="/blog"
                className="text-xs font-semibold tracking-wider uppercase text-rose-600 dark:text-rose-400 mb-2 block font-mono hover:underline"
              >
                Kali Zubaan Blog
              </Link>
            ) : (
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
              {cat.name} <span className="opacity-70">({cat.count})</span>
            </Link>
          ))}
        </nav>

        {posts.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">No articles here yet.</p>
        ) : (
          <>
            <p className="mb-6 text-xs font-medium text-zinc-400">
              Showing {posts.length} {posts.length === 1 ? "article" : "articles"}, newest first
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id || post.slug} post={post} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
