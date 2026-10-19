import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { pageHref, type PageInfo } from "@/lib/pagination";

/** Page numbers to show: always first and last, plus the current page's neighbours. */
function visiblePages(page: number, totalPages: number): (number | "gap")[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = Array.from(wanted)
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  pages.forEach((n, i) => {
    if (i > 0 && n - pages[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

/**
 * Plain-link pagination, rendered on the server so crawlers can follow every
 * page of the archive without running JavaScript.
 */
export default function Pagination({ page, totalPages, basePath }: PageInfo) {
  if (totalPages <= 1) return null;

  const base =
    "inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-xl text-sm font-semibold transition-colors";
  const idle =
    "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700";
  const disabled = "text-zinc-300 dark:text-zinc-600 border border-zinc-100 dark:border-zinc-800";

  return (
    <nav aria-label="Article pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={pageHref(basePath, page - 1)} rel="prev" className={`${base} ${idle} gap-1`}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Newer
        </Link>
      ) : (
        <span className={`${base} ${disabled} gap-1`} aria-hidden="true">
          <ChevronLeft className="w-4 h-4" />
          Newer
        </span>
      )}

      {visiblePages(page, totalPages).map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-zinc-400" aria-hidden="true">
            …
          </span>
        ) : n === page ? (
          <span key={n} aria-current="page" className={`${base} bg-indigo-600 text-white shadow-sm`}>
            {n}
          </span>
        ) : (
          <Link key={n} href={pageHref(basePath, n)} aria-label={`Page ${n}`} className={`${base} ${idle}`}>
            {n}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={pageHref(basePath, page + 1)} rel="next" className={`${base} ${idle} gap-1`}>
          Older
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={`${base} ${disabled} gap-1`} aria-hidden="true">
          Older
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
