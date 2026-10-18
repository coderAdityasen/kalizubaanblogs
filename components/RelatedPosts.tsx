import Link from "next/link";
import { Clock } from "lucide-react";
import type { BlogPostSummary } from "@/types/blog";
import SmartImage from "@/components/SmartImage";

interface RelatedPostsProps {
  posts: BlogPostSummary[];
}

/**
 * "Keep reading" block shown at the end of an article. Gives readers a next
 * step and gives search engines crawlable links between articles.
 */
export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16">
      <h2
        id="related-heading"
        className="font-serif font-bold text-2xl text-zinc-900 dark:text-white"
      >
        Keep reading
      </h2>
      <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex sm:flex-col gap-4 sm:gap-0 h-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 transition-shadow"
            >
              <div className="w-28 sm:w-full shrink-0 aspect-square sm:aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                {post.cover_image ? (
                  <SmartImage
                    src={post.cover_image}
                    alt=""
                    width={480}
                    height={270}
                    sizes="(min-width: 640px) 240px, 112px"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : null}
              </div>
              <div className="py-3 pr-3 sm:p-4 flex flex-col gap-1.5 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  {post.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold leading-snug text-zinc-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-3">
                  {post.title}
                </h3>
                <span className="mt-auto flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-3 h-3" aria-hidden="true" /> {post.reading_time} min read
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
