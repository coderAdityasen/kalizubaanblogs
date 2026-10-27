import SmartImage from "@/components/SmartImage";
import { UNSPLASH_HOST } from "@/lib/images";

interface AuthorAvatarProps {
  name: string;
  avatar?: string | null;
  /** Rendered size in pixels (the image is requested at this size). */
  size: number;
  /** Tailwind classes for the circle: size, ring, colours. */
  className: string;
  /** Tailwind classes for the initials text size. */
  textClassName?: string;
}

/**
 * Posts created before this change were saved with a stock Unsplash portrait as
 * the default author_avatar, so the byline showed a stranger's face next to
 * the author's name. Stock photos are never a real author photo, so treat them
 * as "no avatar" and show the author's initials instead.
 */
export function isPlaceholderAvatar(avatar?: string | null): boolean {
  if (!avatar) return true;
  try {
    return new URL(avatar).hostname === UNSPLASH_HOST;
  } catch {
    return false;
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}

/**
 * Decorative author picture next to a byline. The author's name is always
 * printed beside it, so the image gets an empty alt to avoid screen readers
 * announcing the name twice.
 */
export default function AuthorAvatar({ name, avatar, size, className, textClassName = "text-xs" }: AuthorAvatarProps) {
  if (avatar && !isPlaceholderAvatar(avatar)) {
    return (
      <SmartImage
        src={avatar}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className={`${className} object-cover`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${className} flex items-center justify-center font-bold ${textClassName}`}
    >
      {initials(name)}
    </div>
  );
}
