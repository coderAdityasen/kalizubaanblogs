import type { ReactNode } from "react";

interface StaticPageProps {
  title: string;
  intro?: ReactNode;
  lastUpdated?: string;
  /** Small label above the title (defaults to the site name). */
  kicker?: string;
  children: ReactNode;
}

/** Shared layout for About, Contact and legal pages. */
export default function StaticPage({ title, intro, lastUpdated, kicker = "Kali Zubaan", children }: StaticPageProps) {
  return (
    <main className="container-kz py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--measure)]">
        <header className="mb-10 border-b border-line pb-8">
          <p className="kicker text-brand">{kicker}</p>
          <h1 className="text-h1 mt-3 text-ink">{title}</h1>
          {intro && <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">{intro}</p>}
          {lastUpdated && <p className="mt-3 text-xs text-muted">Last updated: {lastUpdated}</p>}
        </header>
        <div className="prose-kz prose-static">{children}</div>
      </div>
    </main>
  );
}
