import Link from "next/link";
import type { BlogPostSummary } from "@/types/blog";
import SmartImage from "@/components/SmartImage";
import Kicker from "./Kicker";
import { categorySlug } from "@/lib/blog-index";

export type CardVariant = "lead" | "standard" | "compact" | "row";

interface PostCardProps {
  post: BlogPostSummary;
  variant?: CardVariant;
  /** The LCP card: loads eagerly at high priority. */
  priority?: boolean;
  /** Heading level for the title (keep the page outline h1 → h2 → h3). */
  headingLevel?: "h2" | "h3";
  /** Shared-element name for the View Transition into the article. */
  transitionName?: boolean;
  /** Lead only: image on top instead of side by side. */
  stacked?: boolean;
}

const SIZES: Record<CardVariant, string> = {
  lead: "(min-width: 1280px) 780px, (min-width: 1024px) 62vw, 100vw",
  standard: "(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw",
  compact: "112px",
  row: "96px",
};

function Cover({ post, variant, priority, transitionName }: { post: BlogPostSummary; variant: CardVariant; priority: boolean; transitionName: boolean }) {
  const isThumb = variant === "compact" || variant === "row";
  return (
    <div
      className={`overflow-hidden bg-surface-2 ${isThumb ? "aspect-[16/10] w-24 shrink-0 rounded-[var(--radius-sm)] sm:w-28" : "aspect-video rounded-[var(--radius-lg)]"} ${
        // The Latest river is text-only on phones: six thumbnails there were the
        // biggest thing competing with the lead image on slow connections. A
        // hidden lazy image is never downloaded.
        variant === "row" ? "hidden sm:block" : ""
      }`}
    >
      {post.cover_image ? (
        <SmartImage
          src={post.cover_image}
          alt=""
          width={isThumb ? 224 : 800}
          height={isThumb ? 140 : 450}
          sizes={SIZES[variant]}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="card-img h-full w-full object-cover"
          style={transitionName ? { viewTransitionName: `cover-${post.slug}` } : undefined}
        />
      ) : (
        <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-brand-soft text-brand">
          <span className="kicker">{post.category}</span>
        </div>
      )}
    </div>
  );
}

/**
 * One card anatomy everywhere (image → kicker → title → excerpt → meta).
 * The title link stretches over the whole card, so the card is one tap target
 * while the category kicker stays a separate link above it.
 */
export default function PostCard({ post, variant = "standard", priority = false, headingLevel = "h3", transitionName = false, stacked = false }: PostCardProps) {
  const Heading = headingLevel;
  const href = `/blog/${post.slug}`;
  const cat = categorySlug(post.category || "");
  const titleLink = (
    <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
      {post.title}
    </Link>
  );

  if (variant === "lead" && stacked) {
    return (
      <article data-cat={cat} className="group card-lift relative rounded-[var(--radius-lg)] focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-brand">
        <Cover post={post} variant={variant} priority={priority} transitionName={transitionName} />
        <div className="pt-5">
          <Kicker category={post.category} readingTime={post.reading_time} date={post.created_at} />
          <Heading className="text-display mt-3 text-ink">{titleLink}</Heading>
          {post.excerpt && <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted line-clamp-3">{post.excerpt}</p>}
        </div>
      </article>
    );
  }

  if (variant === "lead") {
    return (
      <article data-cat={cat} className="group card-lift relative grid gap-6 rounded-[var(--radius-lg)] md:grid-cols-[1.35fr_1fr] md:items-center md:gap-10 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-brand">
        <div className="order-2 md:order-1">
          <Cover post={post} variant={variant} priority={priority} transitionName={transitionName} />
        </div>
        <div className="order-1 md:order-2">
          <Kicker category={post.category} readingTime={post.reading_time} />
          <Heading className="text-h1 mt-3 text-ink">{titleLink}</Heading>
          {post.excerpt && <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted line-clamp-3">{post.excerpt}</p>}
          <p className="mt-5 text-sm text-muted">
            By <span className="font-medium text-ink">{post.author_name}</span>
          </p>
        </div>
      </article>
    );
  }

  if (variant === "compact" || variant === "row") {
    return (
      <article data-cat={cat} className="group relative flex items-start gap-4 py-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand rounded-sm">
        <div className="min-w-0 flex-1">
          {variant === "row" ? <Kicker category={post.category} /> : <Kicker readingTime={post.reading_time} date={post.created_at} />}
          <Heading className="mt-1.5 text-[1.0625rem] font-semibold leading-snug tracking-tight text-ink group-hover:text-brand transition-colors">
            {titleLink}
          </Heading>
        </div>
        <Cover post={post} variant={variant} priority={priority} transitionName={false} />
      </article>
    );
  }

  return (
    <article data-cat={cat} className="group card-lift relative flex h-full flex-col rounded-[var(--radius-lg)] focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-brand">
      <Cover post={post} variant={variant} priority={priority} transitionName={transitionName} />
      <div className="flex flex-1 flex-col pt-4">
        <Kicker category={post.category} readingTime={post.reading_time} />
        <Heading className="text-h3 mt-2 text-ink group-hover:text-brand transition-colors">{titleLink}</Heading>
        {post.excerpt && <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted line-clamp-2">{post.excerpt}</p>}
        <p className="mt-auto pt-3 text-xs text-muted">
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
          </time>
        </p>
      </div>
    </article>
  );
}
