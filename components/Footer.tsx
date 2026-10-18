"use client";

import Link from "next/link";
import { staticPages } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
              Kali Zubaan Blog
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Unfiltered takes on money, health, side hustles and tech in India.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/blog" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              All Articles
            </Link>
            <Link href="/#latest" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Latest Stories
            </Link>
            <Link href="/#subscribe" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Newsletter
            </Link>
          </div>
        </div>

        <nav aria-label="Site information" className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
          {staticPages.map((page) => (
            <Link key={page.href} href={page.href} className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              {page.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
          <span>© 2026 Kali Zubaan. All rights reserved.</span>
          <span>Designed for readers. Built with Next.js &amp; Supabase.</span>
        </div>
      </div>
    </footer>
  );
}
