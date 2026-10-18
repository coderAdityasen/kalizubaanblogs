/**
 * Remote image hosts that Next.js is allowed to resize and re-encode
 * (AVIF/WebP) through `/_next/image`. Keep this in sync with
 * `images.remotePatterns` in next.config.ts — both read from here.
 */
export function getSupabaseStorageHost(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export const SUPABASE_PUBLIC_STORAGE_PATH = "/storage/v1/object/public/";
export const UNSPLASH_HOST = "images.unsplash.com";

/** True when `src` points at a host listed in `images.remotePatterns`. */
export function canOptimizeImage(src: string | undefined | null): src is string {
  if (!src) return false;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.pathname.toLowerCase().endsWith(".svg") || url.pathname.toLowerCase().endsWith(".gif")) {
    return false;
  }
  if (url.hostname === UNSPLASH_HOST) return true;
  const supabaseHost = getSupabaseStorageHost();
  return (
    supabaseHost !== null &&
    url.hostname === supabaseHost &&
    url.pathname.startsWith(SUPABASE_PUBLIC_STORAGE_PATH) &&
    url.search === ""
  );
}
