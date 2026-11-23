"use client";

import Link from "next/link";
import { useRef } from "react";
import type { NavItem } from "./NavLinks";

interface MobileNavProps {
  sections: NavItem[];
  more: NavItem[];
}

/**
 * Phone menu: a native <dialog> sheet, so focus trapping, Esc to close and the
 * backdrop come from the browser instead of JavaScript.
 */
export default function MobileNav({ sections, more }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Open menu"
        aria-haspopup="dialog"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-2 md:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Site menu"
        className="sheet m-0 mt-0 w-full max-w-none max-h-[100dvh] bg-bg p-0 text-text shadow-xl backdrop:bg-transparent"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="container-kz flex h-16 items-center justify-between border-b border-line">
          <span className="kicker text-muted">Menu</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-2"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav aria-label="Sections" className="container-kz py-4">
          <ul className="divide-y divide-line border-b">
            {sections.map((item) => (
              <li key={item.href} data-cat={item.cat}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="flex min-h-14 items-center justify-between text-xl font-semibold text-ink"
                >
                  {item.label}
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-4 grid grid-cols-2 gap-x-4">
            {more.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={close} className="flex min-h-12 items-center text-[0.9375rem] text-muted hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </>
  );
}
