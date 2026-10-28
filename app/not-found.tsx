import Link from "next/link";
import { Home, Newspaper } from "lucide-react";

// Shown for every unknown URL and every notFound() call (old or mistyped post
// links, removed posts, out-of-range archive pages). It still returns HTTP 404,
// and Next.js adds <meta name="robots" content="noindex"> to it automatically.
//
// Kept static on purpose: Next.js embeds this page in every page's payload, so
// fetching recent posts here would add weight to every article. The topic list
// matches the categories linked from the About page.
const topics = [
  { name: "Personal finance", href: "/blog/category/personal-finance" },
  { name: "Tech & AI", href: "/blog/category/tech-ai" },
  { name: "Health & fitness", href: "/blog/category/health-fitness" },
  { name: "Side hustles", href: "/blog/category/side-hustles" },
];

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <p className="text-sm font-semibold tracking-wide uppercase text-rose-700 dark:text-rose-400">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        The link may be mistyped, or the post may have moved. Pick up from the latest posts or one
        of our topics below.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Go to the homepage
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          <Newspaper className="h-4 w-4" aria-hidden="true" />
          Browse the latest posts
        </Link>
      </div>

      <section className="mt-12" aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="text-xl font-bold">
          Browse by topic
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <li key={topic.href}>
              <Link
                href={topic.href}
                className="inline-block rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:border-rose-500 hover:text-rose-700 dark:border-zinc-700 dark:hover:text-rose-400"
              >
                {topic.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
