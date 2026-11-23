"use client";

import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/design";

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Light/dark switch. Both icons are rendered and CSS shows the right one, so
 * the server HTML never disagrees with the client (no hydration flash).
 * Picking the same theme as the device clears the override, so the site goes
 * back to following the system setting.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const current = (root.getAttribute("data-theme") as "light" | "dark" | null) ?? systemTheme();
    const next = current === "dark" ? "light" : "dark";
    try {
      if (DEFAULT_THEME === "system" && next === systemTheme()) {
        root.removeAttribute("data-theme");
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        root.setAttribute("data-theme", next);
        localStorage.setItem(THEME_STORAGE_KEY, next);
      }
    } catch {
      root.setAttribute("data-theme", next);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Light / dark theme"
      className={`theme-toggle inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-2 transition-colors ${className}`}
    >
      {/* Moon in light mode, sun in dark mode */}
      <svg className="theme-icon h-[18px] w-[18px] dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      <svg className="theme-icon hidden h-[18px] w-[18px] dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
