import Link from "next/link";
import AuthorAvatar from "@/components/AuthorAvatar";
import { author } from "@/lib/author";

/** End-of-article author card (E-E-A-T): who wrote it and where to read more. */
export default function AuthorBox({ name, avatar }: { name: string; avatar?: string | null }) {
  return (
    <section aria-label="About the author" className="flex gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6">
      <AuthorAvatar
        name={name}
        avatar={avatar || author.photo || undefined}
        size={56}
        className="h-14 w-14 shrink-0 rounded-full bg-brand-soft text-brand"
        textClassName="text-base"
      />
      <div className="min-w-0">
        <p className="kicker text-muted">Written by</p>
        <p className="mt-1 text-lg font-semibold text-ink">
          <Link href={author.path} rel="author" className="hover:text-brand">
            {name}
          </Link>
        </p>
        <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">{author.shortBio}</p>
        <Link href={author.path} className="arrow-nudge mt-3 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-brand">
          More about {name.split(" ")[0]} and how articles are checked <span className="arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
