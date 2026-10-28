import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/supabase";
import { getCategories } from "@/lib/blog-index";
import { author, authorSameAs } from "@/lib/author";
import { absoluteUrl, authorName, contactEmail, siteName } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";
const pageUrl = absoluteUrl(author.path);
const description = `${authorName}: ${author.jobTitle.toLowerCase()} in ${author.location} who writes Kali Zubaan's explainers on personal finance, health, side hustles and tech. Bio, how articles are checked, and contact.`;

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${authorName}, Author`,
  description,
  alternates: { canonical: pageUrl },
  openGraph: { type: "profile", title: `${authorName} | ${siteName}`, description, url: pageUrl },
};

/** Visible only in `npm run dev`: shows Aditya what still needs filling in. Hidden in production. */
function Placeholder({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <p className="rounded-lg border border-dashed border-amber-500 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
      [TO BE FILLED BY ADITYA: {children}] (edit lib/author.ts; this box never shows on the live site)
    </p>
  );
}

const linkClass = "text-rose-600 dark:text-rose-400 underline underline-offset-2";

export default async function AuthorPage() {
  const posts = (await getPosts()).filter(
    (post) => !post.author_name || [authorName, "Aditya"].includes(post.author_name)
  );
  const categories = getCategories(posts);
  const recent = posts.slice(0, 10);

  const personLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: pageUrl,
    mainEntity: {
      "@type": "Person",
      "@id": `${pageUrl}#person`,
      name: authorName,
      url: pageUrl,
      jobTitle: author.jobTitle,
      description: author.shortBio,
      homeLocation: { "@type": "Place", name: author.location },
      email: `mailto:${contactEmail}`,
      ...(author.photo ? { image: absoluteUrl(author.photo) } : {}),
      ...(author.credentials.length
        ? {
            hasCredential: author.credentials.map((c) => ({
              "@type": "EducationalOccupationalCredential",
              name: c,
            })),
          }
        : {}),
      knowsAbout: categories.map((c) => c.name),
      sameAs: authorSameAs,
    },
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <div className="mb-8">
        <Breadcrumbs siteUrl={siteUrl} items={[{ name: "Home", href: "/" }, { name: authorName }]} />
      </div>

      <header className="mb-10 border-b border-zinc-200 dark:border-zinc-800 pb-8 flex items-start gap-5">
        {author.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.photo} alt={authorName} width={96} height={96} className="w-24 h-24 rounded-full object-cover" />
        )}
        <div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl tracking-tight text-zinc-900 dark:text-zinc-50">
            {authorName}
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {author.jobTitle} · {author.location} · Writes {siteName}
          </p>
          <p className="mt-3 flex flex-wrap gap-4 text-sm">
            <a href={author.githubUrl} rel="me noopener" target="_blank" className={linkClass}>GitHub</a>
            {author.linkedinUrl && (
              <a href={author.linkedinUrl} rel="me noopener" target="_blank" className={linkClass}>LinkedIn</a>
            )}
            {author.xUrl && (
              <a href={author.xUrl} rel="me noopener" target="_blank" className={linkClass}>X</a>
            )}
            <a href={`mailto:${contactEmail}`} className={linkClass}>Email</a>
          </p>
        </div>
      </header>
      {!author.photo && <Placeholder>a real photo of you (author.photo)</Placeholder>}
      {(!author.linkedinUrl || !author.xUrl) && (
        <Placeholder>your LinkedIn and X profile URLs (author.linkedinUrl, author.xUrl)</Placeholder>
      )}

      <div className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-xl [&_h2]:text-zinc-900 dark:[&_h2]:text-zinc-100 [&_h2]:pt-4">
        <h2>About me</h2>
        <p>
          Hi, I&apos;m Aditya Sen, a software developer based in Indore, India. I build web
          applications with JavaScript, Node.js and the MERN stack, and I work with AI tools every
          day. I started Kali Zubaan to write the kind of explainers I wanted to read myself: plain
          answers to everyday money, health, side-hustle and tech questions, with the numbers
          checked against their sources.
        </p>
        {author.experience ? <p>{author.experience}</p> : <Placeholder>your first-hand experience with these topics (author.experience)</Placeholder>}

        <h2>Credentials</h2>
        {author.credentials.length > 0 ? (
          <ul className="list-disc pl-6 space-y-1">
            {author.credentials.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : (
          <>
            <p>
              Articles on money and health are general education, not personal advice. For
              decisions about your own money, speak to a SEBI-registered investment adviser; for
              health questions, a qualified doctor.
            </p>
            <Placeholder>real, checkable credentials (author.credentials), or a plain statement of your registration status (e.g. whether you hold any SEBI/NISM registration)</Placeholder>
          </>
        )}

        <h2>How articles are researched and checked</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Every figure in an article (rates, prices, dates, percentages) comes from a source listed at the end of that article, and is checked against it before publishing.</li>
          <li>Rules and official numbers are taken from primary sources first, such as SEBI, RBI, NSE, BSE and the Income Tax Department, and from established news outlets after that.</li>
          <li>Finance and health articles carry an in-article note that they are education, not advice. See the <Link href="/disclaimer" className={linkClass}>Disclaimer</Link>.</li>
          <li>When a rule or number changes, the article is updated and its &ldquo;Last updated&rdquo; date changes with it. Spotted an error? <Link href="/contact" className={linkClass}>Tell me</Link>.</li>
        </ul>
        {author.financeReviewer ? (
          <p>
            Finance articles are reviewed by{" "}
            {author.financeReviewer.url ? (
              <a href={author.financeReviewer.url} className={linkClass}>{author.financeReviewer.name}</a>
            ) : (
              author.financeReviewer.name
            )}
            , {author.financeReviewer.credential}.
          </p>
        ) : (
          <Placeholder>a named expert reviewer for finance posts, if someone has agreed (author.financeReviewer)</Placeholder>
        )}

        {categories.length > 0 && (
          <>
            <h2>What I write about</h2>
            <ul className="list-disc pl-6 space-y-1">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/blog/category/${c.slug}`} className={linkClass}>{c.name}</Link> ({c.count}{" "}
                  {c.count === 1 ? "article" : "articles"})
                </li>
              ))}
            </ul>
          </>
        )}

        {recent.length > 0 && (
          <>
            <h2>Latest articles</h2>
            <ul className="list-disc pl-6 space-y-1">
              {recent.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className={linkClass}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
