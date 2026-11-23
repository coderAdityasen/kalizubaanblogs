import Link from "next/link";
import { BrandSymbol } from "@/components/BrandLogo";
import NewsletterForm from "@/components/blog/NewsletterForm";
import { CATEGORIES } from "@/lib/design";
import { TOPIC_HUBS } from "@/lib/hubs";
import { authorName, authorPagePath, staticPages } from "@/lib/site";

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="kicker text-muted">{title}</h2>
      <ul className="mt-3 space-y-1">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-flex min-h-8 items-center text-[0.9375rem] text-text hover:text-ink">
        <span className="link-grow">{children}</span>
      </Link>
    </li>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-kz grid gap-12 py-14 lg:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Kali Zubaan home">
            <BrandSymbol />
            <span className="text-lg font-bold tracking-tight text-ink">Kali Zubaan</span>
          </Link>
          <p className="mt-3 text-[0.9375rem] text-muted">
            Plain-spoken guides on money, health, side hustles and tech for India, with the numbers checked.
          </p>
          <div id="subscribe" className="mt-6 scroll-mt-24">
            <p className="mb-2 text-sm font-semibold text-ink">Get new posts by email</p>
            <NewsletterForm source="footer" compact />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <FooterColumn title="Sections">
            {CATEGORIES.map((c) => (
              <FooterLink key={c.slug} href={`/blog/category/${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
          </FooterColumn>
          <FooterColumn title="Explore">
            <FooterLink href="/start-here">Start here</FooterLink>
            <FooterLink href="/blog">All articles</FooterLink>
            {TOPIC_HUBS.map((hub) => (
              <FooterLink key={hub.slug} href={`/blog/topics/${hub.slug}`}>
                {hub.name}
              </FooterLink>
            ))}
            <FooterLink href="/search">Search</FooterLink>
            <li>
              <a href="/feed.xml" className="inline-flex min-h-8 items-center text-[0.9375rem] text-text hover:text-ink">
                <span className="link-grow">RSS feed</span>
              </a>
            </li>
          </FooterColumn>
          <FooterColumn title="About">
            <FooterLink href={authorPagePath}>{authorName}</FooterLink>
            {staticPages.map((page) => (
              <FooterLink key={page.href} href={page.href}>
                {page.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-kz flex flex-col gap-1 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Kali Zubaan. All rights reserved.</span>
          <span>Written in India for Indian readers.</span>
        </div>
      </div>
    </footer>
  );
}
