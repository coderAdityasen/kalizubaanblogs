import type { Metadata } from "next";
import Link from "next/link";
import SearchForm from "@/components/search/SearchForm";
import { CATEGORIES } from "@/lib/design";

// Shown for every unknown URL and every notFound() call (old or mistyped post
// links, removed posts, out-of-range archive pages). It still returns HTTP 404,
// and Next.js adds <meta name="robots" content="noindex"> to it automatically.
//
// Kept static on purpose: Next.js embeds this page in every page's payload, so
// fetching recent posts here would add weight to every article. The topic list
// matches the categories linked from the About page.
// Without its own metadata the 404 page inherited the homepage's title,
// description and "index, follow" robots tags from the root layout, so a broken
// link showed the homepage title in the browser tab and in shared previews, and
// the page carried two contradictory robots tags (Next.js's automatic
// "noindex" plus the layout's "index, follow"). Setting robots here replaces the
// layout's tags, leaving one consistent "noindex, follow" so crawlers still
// follow the homepage, blog and topic links below.
export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page doesn't exist on Kali Zubaan. Browse the latest posts or pick a topic: personal finance, tech and AI, health and fitness, or side hustles.",
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function NotFound() {
  return (
    <main className="container-kz py-14 sm:py-20">
      <div className="max-w-2xl">
        <p className="kicker text-brand">Error 404</p>
        <h1 className="text-display mt-3 text-ink">We couldn&apos;t find that page</h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">
          The link may be mistyped, or the post may have moved. Search for it, or pick up from the latest posts or
          one of the sections below.
        </p>

        <div className="mt-8">
          <SearchForm id="q-404" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Go to the homepage
          </Link>
          <Link href="/blog" className="btn btn-ghost">
            Browse the latest posts
          </Link>
        </div>

        <section className="mt-12" aria-labelledby="topics-heading">
          <h2 id="topics-heading" className="kicker text-muted">
            Browse by section
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((topic) => (
              <li key={topic.slug} data-cat={topic.slug}>
                <Link href={`/blog/category/${topic.slug}`} className="chip min-h-10 hover:border-muted">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                  {topic.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
