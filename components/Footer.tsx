"use client";

import Link from "next/link";
import { Key } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <span className="font-serif font-bold text-base text-zinc-900 dark:text-zinc-100">
              The Chronicle
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Curated stories and technical perspectives. Updated regularly.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/#latest" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Latest Stories
            </Link>
            <Link href="/#subscribe" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
              Newsletter
            </Link>
            <Link
              href="/api-docs"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-1 text-zinc-400"
            >
              <Key className="w-3 h-3" /> Admin API
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
          <span>© 2026 The Chronicle. All rights reserved.</span>
          <span>Designed for readers. Powered by Next.js &amp; Supabase.</span>
        </div>
      </div>
    </footer>
  );
}
