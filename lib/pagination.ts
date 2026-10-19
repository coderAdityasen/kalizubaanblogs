/** Articles per page on /blog and the category pages. */
export const POSTS_PER_PAGE = 12;

/** Posts shown on the homepage: one featured card plus a full grid. */
export const HOMEPAGE_POST_COUNT = POSTS_PER_PAGE + 1;

export interface PageInfo {
  /** 1-based page number. */
  page: number;
  totalPages: number;
  totalItems: number;
  /** URL of page 1, e.g. "/blog" or "/blog/category/tech-ai". */
  basePath: string;
}

export function totalPagesFor(count: number): number {
  return Math.max(1, Math.ceil(count / POSTS_PER_PAGE));
}

/** The slice of items that belongs on a 1-based page. */
export function pageSlice<T>(items: T[], page: number): T[] {
  const start = (page - 1) * POSTS_PER_PAGE;
  return items.slice(start, start + POSTS_PER_PAGE);
}

/**
 * Parse the [page] route segment. Only plain integers count ("2", not "02" or
 * "2x"), so every page has exactly one URL.
 */
export function parsePageParam(raw: string): number | null {
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const page = Number(raw);
  return Number.isSafeInteger(page) ? page : null;
}

/** Page 1 lives at the base path itself; later pages at <base>/page/<n>. */
export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

/** Route params for pages 2..n, used by generateStaticParams. */
export function laterPageParams(count: number): { page: string }[] {
  const pages = totalPagesFor(count);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ page: String(i + 2) }));
}
