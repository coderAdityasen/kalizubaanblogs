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

const SUPABASE_RENDER_PATH = "/storage/v1/render/image/public/";

/** Widths offered in a cover's srcset (covers are uploaded at ~1600px; small sizes cover avatars). */
export const SUPABASE_IMAGE_WIDTHS = [128, 256, 384, 640, 828, 1200, 1600] as const;

/** True for a public Supabase Storage object that can be resized on the fly. */
export function isSupabaseStorageImage(src: string): boolean {
  if (!canOptimizeImage(src)) return false;
  const url = new URL(src);
  return url.hostname === getSupabaseStorageHost() && url.pathname.startsWith(SUPABASE_PUBLIC_STORAGE_PATH);
}

/**
 * Supabase Storage image transformations: the `render/image` endpoint returns
 * a resized copy (WebP when the browser accepts it), cached on Supabase's CDN.
 * `resize=contain` keeps the original aspect ratio when only a width is given.
 */
export function supabaseImageUrl(src: string, width: number, quality = 75): string {
  const url = new URL(src);
  url.pathname = url.pathname.replace(SUPABASE_PUBLIC_STORAGE_PATH, SUPABASE_RENDER_PATH);
  url.search = new URLSearchParams({
    width: String(width),
    resize: "contain",
    quality: String(quality),
  }).toString();
  return url.toString();
}

export function supabaseImageSrcSet(src: string): string {
  return SUPABASE_IMAGE_WIDTHS.map((w) => `${supabaseImageUrl(src, w)} ${w}w`).join(", ");
}

/**
 * Images uploaded through the compression pipeline are named
 * `<stem>-kzv1-w<width>.webp` and have `-w320/-w480/-w800/-w1200` copies beside
 * them (lib/image-pipeline.ts). Returns their srcset, or null for any other
 * image (legacy uploads keep using Supabase transforms).
 */
const PIPELINE_RE = /^(.*-kzv1)-w(\d{2,5})\.webp$/;
const PIPELINE_VARIANT_WIDTHS = [320, 480, 800, 1200];

export function pipelineImage(src: string): { srcSet: string; widths: number[]; url: (w: number) => string; mainWidth: number } | null {
  let url: URL;
  try {
    url = new URL(src, "http://local.invalid");
  } catch {
    return null;
  }
  const match = url.pathname.match(PIPELINE_RE);
  if (!match) return null;
  const mainWidth = Number(match[2]);
  const widths = [...PIPELINE_VARIANT_WIDTHS.filter((w) => w < mainWidth), mainWidth];
  const make = (w: number) => {
    const u = new URL(url.toString());
    u.pathname = `${match[1]}-w${w}.webp`;
    return src.startsWith("/") ? u.pathname : u.toString();
  };
  return {
    srcSet: widths.map((w) => `${make(w)} ${w}w`).join(", "),
    widths,
    url: make,
    mainWidth,
  };
}
