import type { TocHeading } from "@/lib/toc";

/** Only long articles get a contents box; short posts don't need one. */
const MIN_SECTIONS = 3;

/**
 * "In this article" jump links for long posts. Server-rendered and JS-free:
 * a native <details> element lets phone readers collapse it. The links are
 * plain #anchors to the heading ids added by remarkHeadingIds, which also
 * lets Google show "Jump to" links to sections in search results.
 */
export default function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const sections = headings.filter((heading) => heading.depth === 2);
  if (sections.length < MIN_SECTIONS) return null;

  return (
    <nav
      aria-labelledby="toc-heading"
      className="mt-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
    >
      <details open className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
          <h2
            id="toc-heading"
            className="text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
          >
            In this article
          </h2>
          <span
            aria-hidden="true"
            className="text-zinc-500 transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <ol className="list-decimal space-y-1 px-5 pb-4 pl-10 text-sm sm:text-base marker:text-zinc-500">
          {sections.map((heading) => (
            <li key={heading.id}>
              {/* block + py-1.5 gives each link a full-width tap area of at
                  least 32px, so a thumb doesn't hit the wrong section or
                  collapse the box (Lighthouse "target-size"). */}
              <a
                href={`#${heading.id}`}
                className="block py-1.5 text-zinc-700 dark:text-zinc-300 underline-offset-4 hover:text-indigo-700 hover:underline dark:hover:text-indigo-300"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
