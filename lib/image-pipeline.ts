import sharp, { type Metadata, type Stats } from "sharp";

/**
 * Upload-time image compression for POST /api/upload.
 *
 * Every raster image is re-encoded to WebP (visually lossless settings),
 * EXIF-rotated, stripped of metadata (incl. GPS), capped in size and written
 * with smaller responsive copies. The stored main image is never above
 * MAX_BYTES.
 *
 * File naming: `<stem>-kzv1-w<width>.webp`. The `-kzv1-` marker tells the
 * site (lib/images.ts) that `-w320/-w480/-w800/-w1200` copies exist next to it.
 */

/** Hard cap for any stored image. */
export const MAX_BYTES = 1_000_000;
/** Soft goal for photos; quality is only lowered when the cap is exceeded. */
export const TARGET_BYTES = 350_000;
/** Largest width kept (covers are shown at ≤ 1200 CSS px; 1600 covers 2x on most layouts). */
export const MAX_WIDTH = 1600;
/** Tall infographics may be taller than wide. */
export const MAX_HEIGHT = 2400;
/** Responsive copies written alongside the main image (only those smaller than it). */
export const VARIANT_WIDTHS = [320, 480, 800, 1200] as const;
export const VARIANT_MARKER = "-kzv1";

const PHOTO_QUALITY = 82;
const QUALITY_STEPS = [82, 76, 70, 64, 58];

export class ImageRejectedError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ImageRejectedError";
    this.status = status;
  }
}

export interface ProcessedFile {
  /** Width this file is (used in its name and the srcset). */
  width: number;
  height: number;
  buffer: Buffer;
  contentType: string;
  extension: string;
}

export interface ProcessedImage {
  main: ProcessedFile;
  variants: ProcessedFile[];
  originalSize: number;
  originalFormat: string;
  originalWidth: number;
  originalHeight: number;
  /** True when bytes were re-encoded (false when the original was kept as-is). */
  optimized: boolean;
  animated: boolean;
}

const RASTER_FORMATS = new Set(["jpeg", "png", "webp", "gif", "avif", "heif", "tiff"]);

function looksLikeGraphic(format: string, stats: Stats | null, hasAlpha: boolean): boolean {
  // Screenshots, charts and logos: PNG/GIF sources with low entropy or transparency.
  if (format !== "png" && format !== "gif") return false;
  if (hasAlpha) return true;
  return stats !== null && stats.entropy < 5.5;
}

async function encodeWebp(
  input: Buffer,
  opts: { width?: number; height?: number; quality: number; nearLossless?: boolean; animated: boolean }
): Promise<{ buffer: Buffer; width: number; height: number }> {
  let pipeline = sharp(input, { animated: opts.animated, limitInputPixels: 100_000_000 }).rotate();
  if (opts.width || opts.height) {
    pipeline = pipeline.resize({
      width: opts.width,
      height: opts.height,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  const { data, info } = await pipeline
    .webp(
      opts.nearLossless
        ? { nearLossless: true, quality: 60, effort: 5 }
        : { quality: opts.quality, effort: 5, smartSubsample: true }
    )
    .toBuffer({ resolveWithObject: true });
  const height = opts.animated && info.pageHeight ? info.pageHeight : info.height;
  return { buffer: data, width: info.width, height };
}

export interface ImageInfo {
  meta: Metadata;
  format: string;
  animated: boolean;
  originalWidth: number;
  originalHeight: number;
}

/** Reads and validates an upload (rejects SVG and non-images) without encoding it. */
export async function inspectImage(input: Buffer): Promise<ImageInfo> {
  let meta: Metadata;
  try {
    meta = await sharp(input, { animated: true }).metadata();
  } catch {
    throw new ImageRejectedError("The file isn't a readable image. Upload a JPEG, PNG, WebP, GIF or AVIF.");
  }

  const format = meta.format ?? "unknown";
  if (format === "svg") {
    throw new ImageRejectedError("SVG uploads are not accepted (they can carry scripts). Upload a PNG or WebP instead.");
  }
  if (!RASTER_FORMATS.has(format)) {
    throw new ImageRejectedError(`Unsupported image format '${format}'. Upload a JPEG, PNG, WebP, GIF or AVIF.`);
  }

  const animated = (meta.pages ?? 1) > 1;
  const autoOriented = (meta.orientation ?? 1) >= 5; // 90° rotations swap width/height
  const originalWidth = (autoOriented ? meta.height : meta.width) ?? 0;
  const rawHeight = animated && meta.pageHeight ? meta.pageHeight : meta.height;
  const originalHeight = (autoOriented ? meta.width : rawHeight) ?? 0;

  return { meta, format, animated, originalWidth, originalHeight };
}

/**
 * Compress an uploaded image. Throws ImageRejectedError for files that aren't
 * a readable raster image (including SVG, which is rejected for safety).
 */
export async function processUpload(input: Buffer): Promise<ProcessedImage> {
  const { meta, format, animated, originalWidth, originalHeight } = await inspectImage(input);

  const stats = animated ? null : await sharp(input).stats().catch(() => null);
  const graphic = looksLikeGraphic(format, stats, Boolean(meta.hasAlpha));

  // 1. Main image: cap dimensions, encode, then step quality/size down until ≤ MAX_BYTES.
  let width: number | undefined = originalWidth > MAX_WIDTH ? MAX_WIDTH : undefined;
  const height: number | undefined = originalHeight > MAX_HEIGHT ? MAX_HEIGHT : undefined;

  let best = await encodeWebp(input, { width, height, quality: PHOTO_QUALITY, animated });
  if (graphic) {
    const crisp = await encodeWebp(input, { width, height, quality: 90, nearLossless: true, animated });
    // Prefer near-lossless for text/line art unless it costs far more bytes.
    if (crisp.buffer.length <= Math.max(best.buffer.length * 1.6, TARGET_BYTES) && crisp.buffer.length <= MAX_BYTES) {
      best = crisp;
    }
  }

  let stepIndex = 1;
  while (best.buffer.length > MAX_BYTES) {
    if (stepIndex < QUALITY_STEPS.length) {
      best = await encodeWebp(input, { width, height, quality: QUALITY_STEPS[stepIndex++], animated });
      continue;
    }
    const currentWidth = best.width;
    if (currentWidth <= 320) {
      throw new ImageRejectedError("This image can't be compressed under 1 MB. Try a smaller or shorter image.", 422);
    }
    width = Math.round(currentWidth * 0.85);
    best = await encodeWebp(input, { width, quality: QUALITY_STEPS[QUALITY_STEPS.length - 1], animated });
  }

  // 2. Keep an already-small WebP untouched if re-encoding didn't help.
  let main: ProcessedFile = { width: best.width, height: best.height, buffer: best.buffer, contentType: "image/webp", extension: ".webp" };
  let optimized = true;
  if (
    format === "webp" &&
    input.length <= best.buffer.length &&
    input.length <= MAX_BYTES &&
    originalWidth <= MAX_WIDTH &&
    originalHeight <= MAX_HEIGHT &&
    (meta.orientation ?? 1) === 1 &&
    !meta.exif
  ) {
    main = { width: originalWidth, height: originalHeight, buffer: input, contentType: "image/webp", extension: ".webp" };
    optimized = false;
  }

  // 3. Responsive copies (still images only; animations keep one file).
  const variants: ProcessedFile[] = [];
  if (!animated) {
    for (const w of VARIANT_WIDTHS) {
      if (w >= main.width) continue;
      const v = await encodeWebp(input, { width: w, quality: graphic ? 88 : 78, animated: false });
      variants.push({ width: v.width, height: v.height, buffer: v.buffer, contentType: "image/webp", extension: ".webp" });
    }
  }

  return {
    main,
    variants,
    originalSize: input.length,
    originalFormat: format,
    originalWidth,
    originalHeight,
    optimized,
    animated,
  };
}

/** `<stem>-kzv1-w<width>.webp` */
export function variantFileName(stem: string, width: number): string {
  return `${stem}${VARIANT_MARKER}-w${width}.webp`;
}
