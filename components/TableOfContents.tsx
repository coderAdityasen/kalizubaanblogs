import type { TocHeading } from "@/lib/toc";

/** Only long articles get a contents box; short posts don't need one. */
export const MIN_TOC_SECTIONS = 3;

/**
 * "In this article" jump links for phones and tablets (desktop uses TocRail).
 * Server-rendered and JS-free: a native <details> lets readers collapse it.
 * The links are plain #anchors to the heading ids added by remarkHeadingIds,
 * which also lets Google show "Jump to" links to sections in search results.
 */
export default function TableOfContents({ headings, className = "" }: { headings: TocHeading[]; className?: string }) {
  const sections = headings.filter((heading) => heading.depth === 2);
  if (sections.length < MIN_TOC_SECTIONS) return null;

  return (
    <nav aria-labelledby="toc-heading" className={`rounded-[var(--radius-lg)] border border-line bg-surface ${className}`}>
      <details className="group">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 [&::-webkit-details-marker]:hidden">
          <h2 id="toc-heading" className="kicker text-ink">
            In this article <span className="text-muted">· {sections.length} sections</span>
          </h2>
          <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <ol className="list-decimal space-y-0.5 px-4 pb-3 pl-9 text-[0.9375rem] marker:text-muted">
          {sections.map((heading) => (
            <li key={heading.id}>
              {/* block + py-1.5 gives each link a full-width tap area of at least 32px. */}
              <a href={`#${heading.id}`} className="block py-1.5 text-text hover:text-brand">
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
