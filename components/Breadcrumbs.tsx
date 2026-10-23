import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  name: string;
  /** Site-relative path, e.g. "/blog". Omit for the current page. */
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  siteUrl: string;
}

/**
 * Visible breadcrumb trail plus matching Schema.org BreadcrumbList JSON-LD,
 * so Google can show "kalizubaan.fun › Blog › Category" in search results.
 */
export default function Breadcrumbs({ items, siteUrl }: BreadcrumbsProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="flex items-center gap-1 min-w-0">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="font-semibold text-zinc-600 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span aria-current="page" className="truncate max-w-[16rem] sm:max-w-md">
                    {item.name}
                  </span>
                )}
                {!isLast && <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
