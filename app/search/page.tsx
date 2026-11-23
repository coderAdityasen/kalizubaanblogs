import type { Metadata } from "next";
import Link from "next/link";
import { getPostSummaries } from "@/lib/post-summaries";
import { searchPosts } from "@/lib/search";
import PostCard from "@/components/blog/PostCard";
import SearchForm from "@/components/search/SearchForm";
import { CATEGORIES } from "@/lib/design";
import { absoluteUrl } from "@/lib/site";

interface PageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

// Result pages are thin, query-dependent copies of the archive: keep them out
// of the index but let crawlers follow the article links.
export const metadata: Metadata = {
  title: "Search",
  description: "Search Kali Zubaan's explainers on personal finance, tech and AI, side hustles and health.",
  alternates: { canonical: absoluteUrl("/search") },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default async function SearchPage({ searchParams }: PageProps) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw || "").trim().slice(0, 100);
  const posts = await getPostSummaries();
  const results = q ? searchPosts(posts, q) : [];

  return (
    <main className="container-kz py-10 sm:py-14">
      <p className="kicker text-brand">Search</p>
      <h1 className="text-h1 mt-3 text-ink">{q ? <>Results for &ldquo;{q}&rdquo;</> : "Search the blog"}</h1>
      <div className="mt-6">
        <SearchForm defaultValue={q} autoFocus={!q} />
      </div>

      {q && (
        <p className="mt-6 text-sm text-muted" role="status">
          {results.length === 0
            ? "No articles matched. Try a shorter or different word."
            : `${results.length}${results.length === 30 ? "+" : ""} article${results.length === 1 ? "" : "s"} found`}
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-6 max-w-3xl divide-y divide-line border-y border-line">
          {results.map((post) => (
            <li key={post.slug} className="py-5">
              <PostCard post={post} variant="compact" />
            </li>
          ))}
        </ul>
      )}

      {(!q || results.length === 0) && (
        <section aria-labelledby="browse-heading" className="mt-12">
          <h2 id="browse-heading" className="kicker text-muted">
            Or browse a section
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <li key={c.slug} data-cat={c.slug}>
                <Link href={`/blog/category/${c.slug}`} className="chip min-h-10 hover:border-muted">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/start-here" className="chip min-h-10 hover:border-muted">
                Start here
              </Link>
            </li>
          </ul>
        </section>
      )}
    </main>
  );
}
