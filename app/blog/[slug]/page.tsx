import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { getPostBySlug, getPosts } from "@/lib/supabase";
import MarkdownContent from "@/components/MarkdownContent";
import ShareBar from "@/components/ShareBar";
import RelatedPosts from "@/components/RelatedPosts";
import { getRelatedPosts } from "@/lib/related";
import SmartImage from "@/components/SmartImage";
import Breadcrumbs from "@/components/Breadcrumbs";
import { categorySlug } from "@/lib/blog-index";
import { absoluteUrl, authorName, authorPagePath } from "@/lib/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kalizubaan.fun";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Re-render each article at most once an hour (ISR). Without this, article
 * pages are built once per deploy and served from cache forever, so edits to
 * a post, its "Keep reading" links and dateModified never reach readers or
 * Google until the next deploy. The publish API also revalidates on demand.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate rich SEO metadata for Google & social sharing
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  const articleUrl = `${siteUrl}/blog/${post.slug}`;
  const ogImage = post.cover_image || `${siteUrl}/og-image.png`;

  return {
    title: post.title,
    description: post.excerpt || `${post.title} — Read on Kali Zubaan.`,
    keywords: [
      ...post.tags,
      post.category,
      "Kali Zubaan",
      "kalizubaan",
    ],
    authors: [{ name: post.author_name || "Aditya" }],
    creator: post.author_name || "Aditya",
    publisher: "Kali Zubaan",
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: articleUrl,
      siteName: "Kali Zubaan",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: [post.author_name || "Aditya"],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
      creator: "@kalizubaan",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getPosts()]);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post, allPosts, 3);

  const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const articleUrl = `${siteUrl}/blog/${post.slug}`;

  // Posts by the site's own author link to the About page, which carries the
  // author bio. Google uses author.url to tell who wrote the article.
  const isSiteAuthor = !post.author_name || [authorName, "Aditya"].includes(post.author_name);

  // Google Rich Snippets / Structured Data (Schema.org BlogPosting)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ? [post.cover_image] : [`${siteUrl}/og-image.png`],
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      "@type": "Person",
      name: post.author_name || "Aditya",
      ...(isSiteAuthor ? { url: absoluteUrl(authorPagePath) } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "Kali Zubaan",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
    timeRequired: `PT${post.reading_time || 3}M`,
  };

  return (
    <>
      {/* Schema.org Article Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="min-h-screen py-10 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Breadcrumbs (also emitted as BreadcrumbList structured data) */}
          <div className="mb-8">
            <Breadcrumbs
              siteUrl={siteUrl}
              items={[
                { name: "Home", href: "/" },
                { name: "Blog", href: "/blog" },
                ...(post.category
                  ? [{ name: post.category, href: `/blog/category/${categorySlug(post.category)}` }]
                  : []),
                { name: post.title },
              ]}
            />
          </div>

          {/* Post Title */}
          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              {post.excerpt}
            </p>
          )}

          {/* Author & Metadata Row */}
          <div className="mt-8 py-5 border-y border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {post.author_avatar ? (
                <SmartImage
                  src={post.author_avatar}
                  alt={post.author_name}
                  width={40}
                  height={40}
                  loading="lazy"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center font-bold text-sm">
                  {post.author_name[0]}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {isSiteAuthor ? (
                    <Link href={authorPagePath} rel="author" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                      {post.author_name}
                    </Link>
                  ) : (
                    post.author_name
                  )}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formattedDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.reading_time} min read
                  </span>
                </div>
              </div>
            </div>

            <ShareBar title={post.title} />
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="mt-8 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg bg-zinc-100 dark:bg-zinc-800 aspect-video relative">
              <SmartImage
                src={post.cover_image}
                alt={post.title}
                width={1200}
                height={675}
                sizes="(min-width: 768px) 720px, 100vw"
                loading="eager"
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rich Markdown Article Body */}
          <div className="mt-10 sm:mt-12">
            <MarkdownContent content={post.content} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                Tagged Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related articles: next step for readers, internal links for search engines */}
          <RelatedPosts posts={relatedPosts} />

          {/* Bottom Navigation */}
          <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-white">
                Thanks for reading Kali Zubaan
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Explore more articles in{" "}
                <Link
                  href={`/blog/category/${categorySlug(post.category)}`}
                  className="font-semibold text-zinc-700 dark:text-zinc-300 underline decoration-rose-500/40 underline-offset-2 hover:text-rose-500 dark:hover:text-rose-400"
                >
                  {post.category}
                </Link>{" "}
                or return to the main publication feed.
              </p>
            </div>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shrink-0 shadow-sm"
            >
              ← Back to All Stories
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
