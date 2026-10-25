"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo - Kali Zubaan */}
        <Link href="/" className="flex items-center gap-3 group">
          <div aria-hidden="true" className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-serif font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
            KZ
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-zinc-50">
              Kali Zubaan
            </span>
          </div>
        </Link>

        {/* Clean Publication Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium">
          <Link
            href="/blog"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/blog" || pathname.startsWith("/blog/")
                ? "text-zinc-950 dark:text-white font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Articles
          </Link>

          <Link
            href="/#latest"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors hidden sm:inline-block"
          >
            Latest Stories
          </Link>

          <Link
            href="/#subscribe"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors hidden sm:inline-block"
          >
            Newsletter
          </Link>
          <Link
            href="/about"
            className={`transition-colors ${pathname === "/about" ? "text-zinc-950 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            About
          </Link>

          <Link
            href="/contact"
            className={`transition-colors ${pathname === "/contact" ? "text-zinc-950 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"}`}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
