import Link from "next/link";
import { categorySlug } from "@/lib/blog-index";
import { formatDate } from "@/lib/format";

interface KickerProps {
  category?: string;
  readingTime?: number;
  date?: string;
  /** Link the category to its section page (off inside links). */
  linkCategory?: boolean;
  className?: string;
}

/** CATEGORY · 6 MIN · 23 NOV 2026 — small mono metadata line. */
export default function Kicker({ category, readingTime, date, linkCategory = true, className = "" }: KickerProps) {
  const slug = category ? categorySlug(category) : undefined;
  const parts: React.ReactNode[] = [];
  if (category) {
    parts.push(
      linkCategory ? (
        <Link key="c" href={`/blog/category/${slug}`} className="relative z-10 font-semibold text-accent hover:underline underline-offset-2">
          {category}
        </Link>
      ) : (
        <span key="c" className="font-semibold text-accent">
          {category}
        </span>
      )
    );
  }
  if (readingTime) parts.push(<span key="r">{readingTime} min read</span>);
  if (date)
    parts.push(
      <time key="d" dateTime={date}>
        {formatDate(date)}
      </time>
    );

  return (
    <p data-cat={slug} className={`kicker flex flex-wrap items-center gap-x-2 gap-y-1 text-muted ${className}`}>
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          {i > 0 && <span aria-hidden="true">·</span>}
          {part}
        </span>
      ))}
    </p>
  );
}
