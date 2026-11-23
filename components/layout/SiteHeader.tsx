import Link from "next/link";
import { HeaderBrand } from "@/components/BrandLogo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NavLinks from "./NavLinks";
import MobileNav from "./MobileNav";
import { moreNav, sectionNav } from "./nav";

/**
 * Sticky site header: logo, the four sections, search, theme and one call to
 * action. It's a server component; only the active-link highlight, the theme
 * switch and the phone menu hydrate.
 */
export default function SiteHeader() {
  return (
    <header className="site-header header-scroll sticky top-0 z-50 border-b border-transparent bg-bg/90 backdrop-blur-md supports-[backdrop-filter]:bg-bg/80">
      <a
        href="#content"
        className="sr-only-focusable absolute left-4 top-3 z-50 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-on-brand"
      >
        Skip to content
      </a>
      <div className="container-kz flex h-16 items-center gap-2 md:gap-6">
        <Link href="/" aria-label="Kali Zubaan home" className="shrink-0 rounded-sm">
          <HeaderBrand />
        </Link>

        <nav aria-label="Sections" className="hidden md:block">
          <NavLinks items={sectionNav} />
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search articles"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-2 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Link>
          <ThemeToggle />
          <Link href="/start-here" className="btn btn-primary ml-2 hidden min-h-9 px-4 text-sm sm:inline-flex">
            Start here
          </Link>
          <MobileNav sections={sectionNav} more={moreNav} />
        </div>
      </div>
    </header>
  );
}
