import { CATEGORIES } from "@/lib/design";
import { TOPIC_HUBS } from "@/lib/hubs";
import type { NavItem } from "./NavLinks";

export const sectionNav: NavItem[] = CATEGORIES.map((c) => ({
  href: `/blog/category/${c.slug}`,
  label: c.navLabel,
  cat: c.slug,
}));

export const moreNav: NavItem[] = [
  { href: "/start-here", label: "Start here" },
  { href: "/blog", label: "All articles" },
  ...TOPIC_HUBS.map((hub) => ({ href: `/blog/topics/${hub.slug}`, label: hub.name })),
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
