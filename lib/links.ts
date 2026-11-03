import { siteUrl } from "@/lib/site";

// Hosts that count as "this site". Article bodies often link to other posts
// with absolute URLs (https://www.kalizubaan.fun/blog/...) or the apex domain,
// which would otherwise be treated like external links.
const SITE_HOSTS = new Set(
  [
    "kalizubaan.fun",
    "www.kalizubaan.fun",
    (() => {
      try {
        return new URL(siteUrl).host;
      } catch {
        return "";
      }
    })(),
  ].filter(Boolean)
);

/**
 * If `href` points to this site, return it as a root-relative path
 * ("/blog/slug#section") so it can be rendered with next/link; otherwise
 * return null (external, mailto:, tel:, etc.).
 */
export function toInternalPath(href: string | undefined): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (trimmed.startsWith("#")) return trimmed;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  try {
    const url = new URL(trimmed, siteUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // Relative paths like "blog/slug" resolve against siteUrl and stay internal.
    if (!/^[a-z][a-z0-9+.-]*:|^\/\//i.test(trimmed) || SITE_HOSTS.has(url.host)) {
      return `${url.pathname}${url.search}${url.hash}` || "/";
    }
  } catch {
    return null;
  }
  return null;
}
