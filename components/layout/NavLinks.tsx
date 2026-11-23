"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  /** Category slug: drives the accent colour of the active underline. */
  cat?: string;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop section links with an accent underline on the current section. */
export default function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname() ?? "/";
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href} data-cat={item.cat}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative inline-flex h-10 items-center px-3 text-[0.9375rem] font-medium transition-colors after:absolute after:inset-x-3 after:bottom-1.5 after:h-[2px] after:rounded-full after:bg-accent after:transition-transform after:duration-200 after:origin-left ${
                active ? "text-ink after:scale-x-100" : "text-muted hover:text-ink after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
