import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  id?: string;
  href?: string;
  linkLabel?: string;
  description?: string;
  cat?: string;
  as?: "h2" | "h3";
}

/** Section title with a short accent rule and an optional "See all →" link. */
export default function SectionHeader({ title, id, href, linkLabel = "See all", description, cat, as: Heading = "h2" }: SectionHeaderProps) {
  return (
    <div data-cat={cat} className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t-2 border-ink pt-3">
      <div className="min-w-0">
        <Heading id={id} className="text-h2 text-ink">
          <span aria-hidden="true" className="mr-2.5 inline-block h-3 w-3 rounded-full bg-accent align-middle" />
          {title}
        </Heading>
        {description && <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-muted">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="arrow-nudge inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-brand">
          {linkLabel} <span className="arrow" aria-hidden="true">→</span>
          <span className="sr-only"> {title}</span>
        </Link>
      )}
    </div>
  );
}
