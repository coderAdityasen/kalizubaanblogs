import Image, { type ImageProps } from "next/image";
import { preload } from "react-dom";
import { canOptimizeImage, isSupabaseStorageImage, supabaseImageSrcSet, supabaseImageUrl } from "@/lib/images";

type SmartImageProps = Omit<ImageProps, "src" | "width" | "height"> & {
  src: string;
  width: number;
  height: number;
};

/**
 * Renders cover images and avatars through next/image when they come from a
 * known host (Supabase Storage / Unsplash), so visitors get a resized
 * AVIF/WebP with a long cache lifetime instead of the original upload.
 * Images from any other host fall back to a plain <img> so nothing breaks.
 */
export default function SmartImage({ src, alt, width, height, sizes, loading, fetchPriority, className, ...rest }: SmartImageProps) {
  // Next's optimizer is off (Vercel image quota), so covers would ship as the
  // full ~1600px upload. Supabase Storage can resize them itself, so give the
  // browser a srcset and let it pick the smallest copy that fits.
  if (isSupabaseStorageImage(src)) {
    const srcSet = supabaseImageSrcSet(src);
    // Without `sizes` (avatars) the image renders at its own width.
    const imgSizes = sizes ?? `${width}px`;
    const fallback = supabaseImageUrl(src, 1200);
    if (fetchPriority === "high") {
      // Same early preload next/image adds for priority images (LCP cover).
      preload(fallback, { as: "image", imageSrcSet: srcSet, imageSizes: imgSizes, fetchPriority: "high" });
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fallback}
        srcSet={srcSet}
        sizes={imgSizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={className}
        style={rest.style}
      />
    );
  }

  if (canOptimizeImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={loading}
        fetchPriority={fetchPriority}
        className={className}
        {...rest}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      className={className}
    />
  );
}
