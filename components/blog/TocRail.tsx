"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/toc";

/**
 * Desktop table of contents in the left rail. Server HTML is a plain list of
 * #anchors; once hydrated it highlights the section being read.
 */
export default function TocRail({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="In this article" className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2">
      <p className="kicker text-muted">In this article</p>
      <ol className="mt-3 space-y-0.5 border-l border-line">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1.5 pl-3 text-[0.8125rem] leading-snug transition-colors ${
                active === h.id ? "border-brand font-medium text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
