import Image, { type ImageProps } from "next/image";
import { canOptimizeImage } from "@/lib/images";

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
