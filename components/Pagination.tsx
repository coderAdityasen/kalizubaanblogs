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
    "inline-flex items-center justify-center min-w-11 h-11 px-3 rounded-[var(--radius-sm)] text-sm font-semibold tabular-nums transition-colors";
  const idle = "bg-surface text-ink border border-line hover:border-muted";

  return (
    <nav aria-label="Article pages" className="mt-14 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={pageHref(basePath, page - 1)} rel="prev" className={`${base} ${idle} gap-1`}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Newer
        </Link>
      ) : null}

      {visiblePages(page, totalPages).map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden="true">
            …
          </span>
        ) : n === page ? (
          <span key={n} aria-current="page" className={`${base} bg-ink text-bg`}>
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
      ) : null}
    </nav>
  );
}
