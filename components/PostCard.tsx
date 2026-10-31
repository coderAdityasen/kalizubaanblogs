import Link from "next/link";
import { Clock, Calendar, ArrowUpRight } from "lucide-react";
import { BlogPostSummary } from "@/types/blog";
import SmartImage from "@/components/SmartImage";
import AuthorAvatar from "@/components/AuthorAvatar";

interface PostCardProps {
  post: BlogPostSummary;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (featured) {
    return (
      <article className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Featured Image */}
        <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto min-h-[300px] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {post.cover_image ? (
            <SmartImage
              src={post.cover_image}
              alt={post.title}
              width={1200}
              height={675}
              sizes="(min-width: 1024px) 680px, 100vw"
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/20 text-indigo-400">
              No Cover Image
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md text-indigo-600 dark:text-indigo-400 shadow-sm border border-white/20">
              {post.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-900/80 text-white backdrop-blur-md shadow-sm">
              Featured
            </span>
          </div>
        </div>

        {/* Featured Content */}
        <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.reading_time} min read
              </span>
            </div>

            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-3">
                {post.title}
              </h2>
            </Link>

            <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Tags */}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author and Read More */}
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AuthorAvatar
                name={post.author_name}
                avatar={post.author_avatar}
                size={36}
                className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                textClassName="text-xs"
              />
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {post.author_name}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Author</p>
              </div>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform"
            >
              Read Article <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Regular grid card
  return (
    <article className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
      <div>
        {/* Card Cover Image */}
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {post.cover_image ? (
            <SmartImage
              src={post.cover_image}
              alt={post.title}
              width={640}
              height={360}
              sizes="(min-width: 1024px) 370px, (min-width: 768px) 50vw, 100vw"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
              No Cover
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md text-indigo-600 dark:text-indigo-400 shadow-sm border border-white/20">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-2.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time} min
            </span>
          </div>

          <Link href={`/blog/${post.slug}`}>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          <p className="mt-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Author and footer */}
      <div className="p-5 pt-0 mt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AuthorAvatar
            name={post.author_name}
            avatar={post.author_avatar}
            size={28}
            className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
            textClassName="text-[10px]"
          />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {post.author_name}
          </span>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
        >
          Read <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
