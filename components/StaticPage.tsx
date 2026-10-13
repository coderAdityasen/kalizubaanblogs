import type { ReactNode } from "react";

interface StaticPageProps {
  title: string;
  intro?: ReactNode;
  lastUpdated?: string;
  children: ReactNode;
}

/** Shared layout for About, Contact and legal pages. */
export default function StaticPage({ title, intro, lastUpdated, children }: StaticPageProps) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="mb-10 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">{intro}</p>
        )}
        {lastUpdated && (
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">Last updated: {lastUpdated}</p>
        )}
      </header>
      <div className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-xl [&_h2]:text-zinc-900 dark:[&_h2]:text-zinc-100 [&_h2]:pt-4 [&_a]:text-rose-600 dark:[&_a]:text-rose-400 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">
        {children}
      </div>
    </main>
  );
}
