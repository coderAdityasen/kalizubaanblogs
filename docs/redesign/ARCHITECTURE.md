# Kali Zubaan redesign — architecture & plan

**Status:** Phase 0 (research + architecture). No UI has been changed yet.
**Branch:** `grok` (one long-lived branch; every phase lands here as commits on the same draft PR).
**Research:** [RESEARCH.md](./RESEARCH.md) — The Verge, Medium, Stripe Blog, Linear, Lenny's Newsletter (Substack), plus Vercel Blog.

Non-negotiables for every phase:
1. **SEO parity.** No URL, slug, canonical, title, description, JSON-LD, sitemap, feed or robots behaviour gets lost. Checked by an automated parity script in Phase 5 (and spot-checked each phase).
2. **The publishing API keeps working unchanged** for the existing autopilot/scripts (`POST /api/posts`, `PATCH /api/posts/[slug]`, `POST /api/upload`, same secret-key headers, same response fields).
3. **Fast on a cheap Android over 4G.** LCP < 2.5 s, CLS ≈ 0, small JS.
4. **Less Supabase egress than today**, never more.
5. Never touches env files, secrets, or Vercel/deployment settings.

---

## 1. Starting point (what exists today)

- **Stack:** Next.js 16.4.3 (App Router, Turbopack), React 19.3, Tailwind v4, Supabase (Postgres `posts` table + public Storage bucket `blog-images`), Umami analytics, Vercel Hobby.
- **Routes:** `/`, `/blog`, `/blog/page/[page]`, `/blog/[slug]`, `/blog/category/[slug]` (+ `/page/[page]`), `/blog/topics/[slug]` (topic hubs from `lib/hubs.ts`), `/author/aditya-sen`, `/about`, `/contact`, `/privacy-policy`, `/terms`, `/disclaimer`, `not-found`, `/feed.xml`, `/sitemap.xml` (route handler), `/robots.txt`, `/manifest.webmanifest`, icons, `/api/posts`, `/api/posts/[slug]`, `/api/upload`.
- **Content:** ~240 Markdown posts in 4 categories (Personal Finance, Health & Fitness, Side Hustles, Tech & AI), written by an autopilot that publishes through the API.
- **Look:** dark-only (`<html class="dark">` is hard-coded), Geist Sans/Mono, zinc greys, uniform card grid.
- **Folded into `grok` already:** PR #46 (no cached 404s/demo posts on DB errors), PR #47 (post lists without bodies, cached 10 min), PR #48 (hide setup banner in production). All merged cleanly; type-check, lint and build pass.
- **Still open on `main` and to be folded in during Phase 1** (they are small SEO fixes and the redesign must keep them): #41 (404 metadata), #42 (share cards on static pages), #43 (en-IN everywhere), #44 (breadcrumbs + ItemList on archives), #45 (title-length helper). Whichever Aditya merges to `main` first, `grok` will pick up by merging `main`; any still open at Phase 1 get cherry-picked.

---

## 2. Design direction

**"A calm Indian newsroom."** The front page reads like The Verge (one lead story, a Latest river, category sections, strong category identity), the article page reads like Medium/Substack (serif body, 680px column, quiet chrome), and the finish is Stripe/Linear (tinted surfaces, hairlines, tiny purposeful motion, a dark mode designed on purpose). Brand colour comes from the genie logo (deep navy + genie blue), each of the four categories gets one accent, and everything else is greys.

### 2.1 Typography

| Role | Font | Notes |
|---|---|---|
| UI, headlines | **Geist Sans** (already in the project, variable, self-hosted via `next/font`) | Headlines weight 650–700, tracking −0.02em |
| Long-form body | **Source Serif 4** (variable, latin subset, via `next/font/google` → self-hosted at build) | Only loaded on article/static text pages (`preload` only there). Fallback `Georgia` with `adjustFontFallback` so swap causes no CLS |
| Metadata/kicker | **Geist Mono** (already present, not preloaded since PR #40) | Uppercase, 12px, +0.06em |

Fluid type scale (`clamp`, 1.25 ratio mobile → 1.333 desktop):

| Token | Mobile | Desktop | Use |
|---|---|---|---|
| `--text-display` | 36px / 1.05 | 60px / 1.02 | Home lead headline, article h1 |
| `--text-h1` | 30px / 1.1 | 44px / 1.08 | Page titles |
| `--text-h2` | 24px / 1.2 | 30px / 1.2 | Article h2, section titles |
| `--text-h3` | 20px / 1.3 | 22px / 1.3 | Card titles (lead), article h3 |
| `--text-body` | **18px / 1.65** | **20px / 1.6** | Article body (serif) |
| `--text-ui` | 15px / 1.5 | 16px / 1.5 | UI, excerpts |
| `--text-meta` | 12px / 1.4 | 12px / 1.4 | Kicker, dates, reading time (mono) |

Measure: article column `max-width: 68ch` (~680px at 20px).

### 2.2 Colour tokens (CSS variables, Tailwind v4 `@theme`)

| Token | Light | Dark |
|---|---|---|
| `--bg` page | `#FAFAF7` (warm paper) | `#0A0C10` |
| `--surface` cards | `#FFFFFF` | `#12151B` |
| `--surface-2` tint (Stripe-style bands) | `#F2F5FA` | `#171B22` |
| `--ink` headings | `#0B1530` (logo navy) | `#F2F4F8` |
| `--text` body | `#2A2F3A` | `#C9CED8` |
| `--muted` meta | `#5B6372` | `#8B93A3` |
| `--line` hairlines | `#E6E8EE` | `#232833` |
| `--brand` links/CTA | `#0138A9` (genie blue) | `#4CC3FF` (genie sky) |
| `--brand-soft` | `#E7EEFF` | `#0F2547` |

Category accents (used only for kicker text, a 3px top rule on section headers, and focus of category pages): Personal Finance `#0F7B4F` / `#39D08F`; Health & Fitness `#C2410C` / `#FF8A5B`; Side Hustles `#A16207` / `#F5C04A`; Tech & AI `#6D28D9` / `#A78BFA`. Every text/background pair must pass WCAG AA (4.5:1 body, 3:1 large); this is checked in Phase 5.

**Theme:** follows the visitor's system setting by default, with a small toggle in the header that stores the choice in `localStorage`. A tiny inline script in `<head>` sets `data-theme` before first paint so there is no flash. (Today the site is forced dark — see Decisions.)

### 2.3 Spacing, grid, shape
- 4px base; spacing scale 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Container `max-width: 1200px`, gutters 20px mobile / 32px desktop. Grid: 4 cols mobile, 8 tablet, 12 desktop.
- Radii: 6px (chips, inputs), 12px (cards, images). Borders are 1px hairlines; shadows only on hover (`0 1px 2px` → `0 8px 24px -12px`).
- Images are always 16:9 in cards (`aspect-ratio` set in CSS, so no layout shift), 3:2 for the article hero.

### 2.4 Components (new `components/ui` + `components/blog`)
`SiteHeader` (logo, 4 category links, Search, theme toggle, "Start here" CTA; compact on scroll, no JS-driven sticky jank), `MobileNav` (`<dialog>`-based sheet, focus-trapped natively), `SiteFooter`, `Kicker` (category · reading time · date), `PostCard` with variants `lead | standard | compact | row`, `SectionHeader` (title + accent rule + "See all →"), `CategoryTabs` (Linear-style text filter row), `Byline` (avatar, name → author page, role, date, updated), `ArticleHeader`, `ArticleBody` (server-rendered Markdown, unchanged pipeline), `TocRail` (desktop edge TOC à la Substack, collapsible block on mobile), `ShareBar` (native share sheet first), `Breadcrumbs` (existing, restyled), `RelatedPosts`, `TopicHubCard`, `Pagination`, `AdSlot`, `ThemeToggle`, `SearchDialog`, `EmptyState`, `Callout` (for `> **Note**` blocks), `Figure` (image + caption + credit), `Prose` (typography styles).

---

## 3. Page inventory and new layouts

URLs do **not** change. New pages are additive.

| Page | New layout |
|---|---|
| **Home `/`** | (1) Lead story: big 16:9 image left, display headline + deck + byline right (stacked on mobile; headline above image so text is the LCP). (2) "Latest" river: 6 compact rows with tiny thumbnails (Verge right rail on desktop, below lead on mobile). (3) One section per category: section header with accent rule + 1 standard + 3 compact cards + "All Personal Finance →". (4) Topic hub band (tinted surface, Stripe-style) featuring IPO hub. (5) "Start here" strip. Homepage h1 stays the brand name (visually-hidden or in hero). |
| **Blog index `/blog`, `/blog/page/N`** | Page title + Linear-style category filter row (links to category pages, not client filtering) + 3-column grid (1 col mobile, 2 tablet) + numbered pagination. Keeps `rel=prev/next`-style links, breadcrumbs, ItemList JSON-LD. |
| **Category `/blog/category/[slug]`** | Category hero (name, one-line description, post count, accent), featured post, grid, pagination; the "about this category" text block at the bottom (helps SEO and AdSense "thin content" checks). |
| **Topic hub `/blog/topics/[slug]`** | "Guide" layout: hub intro, pillar post as a large card, then numbered cluster posts as a reading path (1 → 5), FAQ if present. |
| **Post `/blog/[slug]`** | Breadcrumbs → kicker → h1 (display) → deck (excerpt) → byline (avatar, Aditya Sen, role, published, updated, reading time) → 3:2 hero image with caption/credit → 680px serif body. Desktop: edge TOC rail on the left, share/reading-time rail on the right (Vercel-style); mobile: collapsible TOC under the hero, share via native sheet. Thin reading-progress bar at the top (CSS scroll-driven animation; no JS). End of article: author box (E-E-A-T), "Part of: IPO Investing in India" hub link, tags, related posts (3), next/previous in category. In-content ad slots (see §9). |
| **Author `/author/aditya-sen`** | Profile header (photo, bio, credentials, social links), "Start here" picks, then all posts list. Keeps ProfilePage/Person JSON-LD. |
| **Start here `/start-here`** *(new)* | Curated reading paths per category (Substack's "Start here"). Static, edited in code (`lib/start-here.ts`). Strong internal linking; indexable; added to sitemap. |
| **Search `/search`** *(new, worthwhile)* | Server-rendered results for `?q=` from a pre-built index (title, excerpt, tags, category; ~60 KB JSON generated at build/ISR, cached). Client `SearchDialog` (⌘K / header icon) loads the index lazily on first open only. Page is `noindex, follow`. Also enables `WebSite` `SearchAction` JSON-LD (sitelinks search box). |
| **About / Contact / Privacy / Terms / Disclaimer** | Shared `StaticPage` layout with the serif prose styles, last-updated line, contact card. Content unchanged. |
| **404** | Friendly page: search box, top categories, 6 latest posts. Keeps `noindex, follow` and its own title (PR #41). |

---

## 4. Motion spec

Principle (from all five sites): *micro, fast, never while reading, always optional.*

| Where | What | How |
|---|---|---|
| Links | Underline grows from left on hover | `background-size` transition 180ms |
| Cards | 2px lift + image `scale(1.02)` + shadow fade on hover/focus-visible | `transform`/`opacity` only, 200ms `cubic-bezier(.2,.7,.2,1)` |
| "See all →" / "Read more →" | Arrow nudges 3px | `transform` 150ms |
| Page navigation | Cross-fade + card image morphs into article hero | **View Transitions** (`@view-transition { navigation: auto; }` + `view-transition-name` on the card image/title). Progressive: browsers without support just navigate normally |
| Header | Shrinks from 64px to 52px and gains a hairline after scrolling | CSS scroll-driven animation (`animation-timeline: scroll()`), static fallback |
| Reading progress | 2px bar at top of article | CSS `animation-timeline: scroll(root)`; hidden where unsupported |
| Sections on home | Fade-up 8px when entering viewport, first time only | CSS `animation-timeline: view()` with `animation-range: entry`; content is fully visible without it (no opacity:0 default for unsupported browsers) |
| Theme toggle | Icon rotate 90° | 200ms |
| Mobile nav | Sheet slides in 240ms | `<dialog>` + `@starting-style` |

Rules: animate only `transform` and `opacity`; nothing above the fold animates on load (protects LCP); `@media (prefers-reduced-motion: reduce)` sets all durations to 0.01ms and disables view transitions; no animation library (no Framer Motion/GSAP — CSS covers all of the above at 0 KB of JS).

---

## 5. Folder / component architecture

```
app/
  (site)/                     # route group: header/footer layout; URLs unchanged
    page.tsx                  # home
    blog/...                  # index, page/[page], [slug], category/[slug](/page/[page]), topics/[slug]
    author/aditya-sen/
    start-here/  search/
    about/ contact/ privacy-policy/ terms/ disclaimer/
  api/
    posts/route.ts            # unchanged contract (GET summaries by default, see §7)
    posts/[slug]/route.ts     # unchanged
    upload/route.ts           # same contract + compression pipeline
  feed.xml/ sitemap.xml/ robots.ts manifest.ts icons   # unchanged
  layout.tsx                  # html lang=en-IN, fonts, theme script, JSON-LD graph
  not-found.tsx
components/
  ui/        Button, Chip, Kicker, Dialog, ThemeToggle, Container, VisuallyHidden
  layout/    SiteHeader, MobileNav, SiteFooter, Breadcrumbs, SectionHeader
  blog/      PostCard, LeadStory, LatestRiver, CategorySection, ArticleHeader, ArticleBody,
             TocRail, ShareBar, AuthorBox, RelatedPosts, HubCard, Pagination, SearchDialog
  ads/       AdSlot
lib/
  content/   posts.ts (getPostSummaries, getPostBySlug), categories.ts, hubs.ts, start-here.ts, search-index.ts
  seo/       metadata.ts (title helper from #45, buildMetadata), jsonld.ts (WebSite, Organization, BlogPosting, BreadcrumbList, CollectionPage/ItemList, ProfilePage, FAQ)
  images/    urls.ts (srcset builder), pipeline.ts (sharp compression), variants.ts
  api/       auth.ts (single validateAuth), responses.ts
  site.ts  author.ts  pagination.ts  toc.ts  faq.ts  links.ts
styles/      tokens.css (design tokens), prose.css, motion.css   # imported by app/globals.css
scripts/     seo-parity.mjs, backfill-image-variants.mjs, test-upload.mjs, test-markdown-render.mjs
docs/redesign/ ARCHITECTURE.md RESEARCH.md
```

Server Components by default. Client components only where needed: `ThemeToggle`, `MobileNav`, `SearchDialog`, `ShareBar` (native share), `CopyCodeButton`, `TocRail` active-heading highlight (IntersectionObserver, < 1 KB). Markdown stays server-rendered (PR #22) so `react-markdown` never ships to the browser.

---

## 6. Data layer and caching (egress plan)

The outage was Supabase's egress quota. Everything here is designed to read Supabase as rarely as possible.

1. **Lists never include bodies** (`getPostSummaries`, PR #47): ~1 KB/post instead of ~10 KB.
2. **One cached list for the whole site**: Next Data Cache, tag `posts`, 10 min; `React.cache` de-dupes within a render. Home, archives, categories, hubs, feed, sitemap, related posts and the search index all derive from this one list.
3. **Article pages** fetch one row by slug, cached with tag `post:<slug>`. ISR `revalidate` raised from 1 h to **24 h**, because publishing/editing through the API already revalidates on demand (`revalidatePath`, plus `revalidateTag('posts')` / `revalidateTag('post:<slug>')`). That cuts ~240 hourly regenerations/day to ~10.
4. **Errors never get cached** (PR #46): a failed read throws, so ISR keeps serving the last good page.
5. **Build**: `generateStaticParams` uses the summary list (one query per build, not one per page).
6. **`GET /api/posts`** returns summaries by default (the autopilot's de-dupe only reads `title`) with `Cache-Control: s-maxage=600, stale-while-revalidate` so repeat calls are served from Vercel's CDN; `?include=content` returns full posts for anyone who needs them. *(Response shape is otherwise identical.)*
7. **Images** are the other big egress source (every visitor downloads covers from Supabase Storage). See §7: smaller files at upload + fixed-width variants + long immutable caching. Optional, needs Aditya's OK: serve images through a Vercel rewrite (`/img/*` → Supabase public bucket) so repeat requests hit Vercel's CDN instead of Supabase.
8. **Search index** is generated from the cached summary list, not a separate query.

---

## 7. Image pipeline

Goal from Aditya: *every image compressed, never over 1 MB, no visible quality loss, even if he forgets to shrink it first.*

### 7.1 At upload (`POST /api/upload`)
Using **sharp** (already installed as Next's optional dependency; will be added as a direct dependency):

1. Read the file (multipart `file`, unchanged). Reject > 10 MB as today. *(Note: Vercel itself caps request bodies at ~4.5 MB, so in production practical uploads must be under 4.5 MB — see Decisions.)*
2. Decode with sharp, `.rotate()` (apply EXIF orientation), strip metadata (EXIF/GPS), convert to sRGB.
3. Resize so the longest side is **≤ 2000px** (covers: width ≤ 1600px is enough for a 680–1200px layout at 2x), never upscale.
4. Encode **WebP, quality 82, effort 5, smart subsampling** (visually lossless for photos). PNG screenshots/charts with few colours: WebP **near-lossless** (or lossless if smaller) so text stays crisp.
5. **Size guard:** target ≤ 300 KB for covers; if the result is still > 1 MB, step quality down (82 → 76 → 70) and then width (−15%) until ≤ 1 MB. Hard guarantee: the stored main image is never above 1 MB.
6. **Responsive variants** written alongside with a predictable naming convention: `<name>.webp` (main, ≤ 1600/2000px) plus `<name>-w480.webp`, `-w800.webp`, `-w1200.webp`. All uploaded with `cacheControl: 31536000` (immutable, unique names).
7. If the compressed file is somehow larger than a small already-optimised input (e.g. a 40 KB WebP), keep the original bytes.
8. **GIF:** animated → animated WebP (much smaller); **SVG:** passed through unchanged (no raster benefit) — but see Decisions (security). **AVIF uploads:** accepted and re-encoded to WebP for universal support.
9. Escape hatch: form field `optimize=false` stores the file exactly as sent (old behaviour).

Response stays backward compatible — same fields (`success`, `message`, `url`, `path`, `bucket`, `filename`, `originalName`, `size`, `contentType`, `storage`), where `url` now points to the optimised WebP and `size`/`contentType` describe the stored file. New fields are additive: `originalSize`, `width`, `height`, `variants: { 480, 800, 1200 }`, `savedPercent`.

### 7.2 At render
- `lib/images/urls.ts` builds `srcset` from the pre-generated variants when the URL follows the convention, so browsers pick 480/800/1200/1600 with correct `sizes` (`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px` for cards; `min(100vw, 1200px)` for the article hero).
- **Legacy images** (~240 existing covers): a one-off `scripts/backfill-image-variants.mjs` (run by Aditya locally with his own service key, or via a secret-protected admin endpoint if preferred) downloads each original once, writes the variants, and **does not change existing URLs**. Until backfilled, legacy covers keep using Supabase render transforms (current behaviour from PR #39) — or the full original if transforms are turned off.
- Every `<img>` gets explicit `width`/`height` (no CLS), `decoding="async"`, `loading="lazy"` except the single LCP image (`fetchpriority="high"`, preloaded via `<link rel="preload" imagesrcset>`).
- Inline Markdown images use the same component and the same variants.
- `next.config` keeps `images.unoptimized: true` (Vercel optimisation quota) — the pipeline above replaces it.
- OG/share images keep pointing at the full-size cover (1200px+ for Google Discover's large-image requirement; `max-image-preview:large` stays).

---

## 8. Upload / publishing API contract (preserved)

**How it works today** (verified in code):
- **Auth:** `Authorization: Bearer <BLOG_API_SECRET>` or `x-api-key: <BLOG_API_SECRET>`; 401 JSON `{success:false,error:"Unauthorized",message,help}` otherwise.
- **`POST /api/posts`** (JSON): `title` and `content` (Markdown) required; optional `slug, excerpt, cover_image, category, tags[], author_name, author_avatar, reading_time, published`. Upserts by slug (creates or overwrites), auto-slug from title, auto excerpt (160 chars), auto reading time; revalidates `/blog/<slug>`, `/`, `/blog` layout, `/sitemap.xml`, `/feed.xml`. Returns 201 `{success, message, post, url, slug, storage, warning?}`.
- **`PATCH /api/posts/[slug-or-uuid]`** (JSON): edits only `title, content, excerpt, tags, cover_image, category`; unknown fields → 400; slug/author/created_at never change; sets `updated_at`, recomputes reading time; same revalidation.
- **`POST /api/upload`** (multipart): `file` (required), `bucket` (default `blog-images`), `folder` (default `uploads`; autopilot sends `covers`); JPEG/PNG/WebP/GIF/SVG/AVIF up to 10 MB; stored as `<folder>/<timestamp>-<rand>-<name><ext>` with 1-year cache; returns 201 with the public URL.
- **`GET /api/posts`** (`?category=`, `?tag=`) and **`GET /api/posts/[slug]`** are public, no key.
- **Who uses it:** the blog autopilot posts with `Authorization: Bearer`, uploads covers/charts to `/api/upload` with `folder=covers`, reads `GET /api/posts` titles for de-duplication and `GET /api/posts/<slug>`.

**What the redesign keeps:** every endpoint path, method, header, request field and response field above. Changes are internal or additive:
- One shared `validateAuth` in `lib/api/auth.ts` (today `/api/upload` has its own copy with a *different* fallback secret), using a **constant-time comparison**.
- Upload compression (§7) — `url` still points to a public image; extension becomes `.webp`.
- `GET /api/posts`: summaries by default + `?include=content` (§6).
- Publishing also calls `revalidateTag('posts')` and `revalidateTag('post:<slug>')`, and revalidates `/search` and `/start-here`.
- `scripts/test-upload.mjs` extended into a contract test (401 without key, 201 with key, `url` reachable, stored size ≤ 1 MB, response fields present).

---

## 9. AdSense-friendly ad slots (no CLS)

- `AdSlot` component renders a **reserved box** with fixed `min-height` per placement (e.g. 280px in-article mobile, 250px sidebar, 100px below header on mobile only if used), labelled "Advertisement" in `--muted` mono. Space is reserved before the ad loads, so CLS stays ≈ 0; collapse only if unfilled *below the viewport*.
- Placements: after the 3rd paragraph and roughly every ~8 paragraphs in long posts (max 3 in-article), one in the right rail on desktop (sticky inside the rail, never over content), one between home sections. None above the article title; nothing that overlaps text or the share bar.
- The AdSense script loads with `strategy="lazyOnload"` and only when `NEXT_PUBLIC_ADSENSE_CLIENT` is set; until approval the slots render nothing (no empty boxes for reviewers).
- `ads.txt` is added once Aditya shares the `pub-…` ID. Privacy policy already covers Google ad cookies; a consent banner (Google CMP) will be needed for EEA/UK visitors when ads go live.

---

## 10. SEO checklist (must stay identical or better)

- [x] Every existing URL returns 200 with the same canonical (`https://www.kalizubaan.fun/...`), including `/blog/page/N`, category pages and hubs; no new trailing-slash or redirect changes.
- [x] `<html lang="en-IN">`, `og:locale en_IN` (PR #43).
- [x] Titles via the title helper (PR #45): full brand suffix when it fits, short suffix, or none; `title.template`.
- [x] Meta descriptions (post excerpt; per-page for static pages), keywords, `robots` (index, follow, `max-image-preview:large`); 404 is `noindex, follow` (PR #41).
- [x] Open Graph + Twitter cards on every page incl. static pages (PR #42), `siteName: Kali Zubaan`, OG image 1200×630 fallback.
- [x] JSON-LD: WebSite (+ `SearchAction` once /search exists) and Organization (logo `/logo.png` 600×240) in layout; BlogPosting (headline, image, datePublished, dateModified, author Person with url → author page, publisher, mainEntityOfPage, inLanguage) on posts; BreadcrumbList on posts, archives, categories, hubs, author (PR #44); CollectionPage + ItemList on archives/hubs; ProfilePage on author; FAQPage where the post has an FAQ section.
- [x] Visible breadcrumbs matching the BreadcrumbList.
- [x] One `<h1>` per page; heading order intact; TOC anchor IDs unchanged (`lib/toc.ts`), so existing `#section` links keep working.
- [x] `/sitemap.xml` route handler (all posts with `lastmod` = `updated_at`, archives, categories, hubs, author, static pages, + `/start-here`), `/feed.xml` RSS (en-IN), `<link rel="alternate" type="application/rss+xml">`, `robots.txt` (only `/api/` disallowed; `/search` added as `noindex` via meta rather than robots so links are still followed).
- [x] Favicon/icons/manifest/brand logos unchanged (Google site name "Kali Zubaan").
- [x] Internal links same-tab, external links `rel="noopener noreferrer"`; image `alt` = caption or title.
- [x] **Parity script** (`scripts/seo-parity.mjs`): crawls a list of ~30 URLs on `main`'s build and on `grok`'s build and diffs title, description, canonical, robots, og:*, twitter:*, JSON-LD types/fields, h1, hreflang/lang, status codes, sitemap URL set and feed item set. Must show zero regressions before the PR leaves draft.

---

## 11. Performance budgets

| Metric (mobile, Lighthouse/PSI, Moto G Power, slow 4G) | Budget |
|---|---|
| LCP | **< 2.5 s** (home and posts) |
| CLS | **< 0.02** |
| INP / TBT | INP < 200 ms, TBT < 150 ms |
| Performance score | ≥ 90 mobile, ≥ 98 desktop |
| First-load JS (gzip, per route) | **≤ 110 KB** (framework baseline ~90 KB + ≤ 20 KB app); search dialog code and index are lazy |
| Fonts | ≤ 2 preloaded files, ≤ 90 KB total; serif body font only on text pages |
| LCP image | ≤ 60 KB on mobile (480/800 variant), preloaded |
| Total page weight (home, first view) | ≤ 500 KB |
| Third-party scripts | Umami only (`lazyOnload`); AdSense only after approval, `lazyOnload` |

---

## 12. Phased plan and acceptance criteria

All phases push to `grok`; the draft PR stays open until Phase 5 passes. Each phase ends with: `tsc`, `lint`, `build` green; screenshots (desktop + mobile, light + dark) attached to the PR comment; no SEO-parity regressions on the pages touched.

### Phase 1 — Foundation, design system, layout shell, image pipeline
- Fold in #41–#45 (whatever isn't on `main` yet).
- `styles/tokens.css`, `prose.css`, `motion.css`; fonts (Geist + Source Serif 4); light/dark/system theme with no-flash script.
- New `SiteHeader`, `MobileNav`, `SiteFooter`, `Container`, `Kicker`, `Button`, `Chip`, `ThemeToggle`, `SectionHeader`, `AdSlot` (inert).
- Upload pipeline (§7.1) + shared constant-time auth + contract test; `GET /api/posts` summaries + CDN caching; `revalidateTag` wiring; ISR 24 h on articles.
- **Accept when:** every existing page renders inside the new shell with no broken layout at 360/768/1280px; header/footer keyboard-accessible; theme toggle works without flash; uploading a 6 MB JPEG returns a WebP ≤ 1 MB (typically ≤ 300 KB) with 3 variants and the old response fields; 401 still returned without a key; autopilot payloads (title-only `GET`, `POST`, `PATCH`) work against a local build.

### Phase 2 — Home + listing pages
- Home (lead, Latest river, category sections, hub band, Start-here strip); `/blog` + pagination; category pages; topic hubs; `PostCard` variants; responsive `srcset` from variants; `Pagination`.
- **Accept when:** home LCP element is the lead headline or a ≤ 60 KB preloaded image; mobile PSI ≥ 90 on home and a category page in a preview build; CLS < 0.02; all archive/category/hub URLs, titles, canonicals, breadcrumbs and ItemList JSON-LD unchanged in the parity script.

### Phase 3 — Post page reading experience
- `ArticleHeader`, serif `Prose`, `Figure`/captions, `TocRail` (desktop) + collapsible TOC (mobile), share, reading progress, author box, hub link, related + next/prev, in-article `AdSlot` positions, code blocks/tables/callouts restyled.
- **Accept when:** body is 18px/20px serif at ≤ 68ch; TOC anchors unchanged; BlogPosting/FAQ/Breadcrumb JSON-LD identical to `main`; mobile PSI ≥ 90 and LCP < 2.5 s on 3 sample posts; no horizontal scroll from tables/code at 360px.

### Phase 4 — Secondary pages, search, polish & motion
- Author page, About/Contact/legal, 404, new `/start-here` and `/search` (+ SearchAction JSON-LD), View Transitions, scroll-driven header/progress/section reveals, hover micro-interactions, empty/error states, print styles.
- **Accept when:** motion matches §4 and is fully disabled with reduced motion; View Transitions degrade gracefully in Firefox/Safari; search returns results for title/tag queries and its JS is not in the first-load bundle; new pages in sitemap with correct metadata.

### Phase 5 — QA and launch readiness
- Lighthouse/PSI on 10 URLs (mobile + desktop), axe accessibility scan (0 serious/critical), keyboard-only and screen-reader pass, colour-contrast check for all tokens, SEO parity script (zero regressions), link checker (0 broken), sitemap/feed validation, Rich Results test on a post, cross-browser check (Chrome, Safari iOS, Firefox, Samsung Internet), upload API contract test, egress estimate (requests per build and per day).
- **Accept when:** all budgets in §11 met; parity clean; PR moved out of draft with a summary for Aditya to review and merge.

---

## 13. Decisions needed from Aditya

1. **Default theme.** Today the site is always dark. Proposal: follow the visitor's system setting (light for most daytime readers, matching Medium/Substack) with a toggle. Alternative: keep dark as the default.
2. **Serif body font** for articles (Medium/Substack style) vs. keeping all-sans Geist (Vercel style). Proposal: serif.
3. **SVG uploads.** SVGs in a public bucket can carry scripts. Proposal: reject SVG uploads (the autopilot only sends JPEG/PNG). Alternative: keep accepting them unchanged.
4. **Upload size.** Vercel rejects request bodies above ~4.5 MB before our code runs, so the 10 MB limit only applies locally. Proposal: keep it simple (Aditya/autopilot upload < 4.5 MB; the server compresses further). Alternative (later): a signed direct-to-Supabase upload flow for large originals.
5. **Image egress.** Proposal: serve images through a Vercel rewrite so the CDN caches them and Supabase egress drops further — needs a quick test that Vercel caches the external rewrite on Hobby. Alternative long-term: move images to Cloudflare R2 (free egress) — needs a new account, so only if he wants.
6. **Backfill of the ~240 existing covers** into variants: run a local script with his service key (I'd write it; he runs it), or keep using Supabase transforms for old images (costs Pro-plan transform credits).
7. **The fake newsletter form** (no backend today): remove it, or connect a real service (e.g. Buttondown/Substack). Proposal: replace with "Follow via RSS / Start here" until a real service exists.
8. **Next.js security upgrade** (16.4.3 is flagged by `next build`): do it as part of Phase 1 on `grok`, or as a separate small PR to `main` first (recommended, so production gets the fix sooner).
9. **Supabase quota**: the live site stays broken until the quota is restored (upgrade/spend cap/reset). The redesign reduces egress but can't restore service.

---

## 14. Status (23 Nov 2026)

Phases 1–5 are built on `grok`. Results are in [RESULTS.md](./RESULTS.md) and screenshots in [screenshots/](./screenshots/). Decisions applied: theme follows the system setting, with a toggle; serif article body (upright only); SVG uploads rejected; newsletter form kept and ready to connect (`NEWSLETTER_WEBHOOK_URL`); Next.js upgraded to 16.4.6; PRs #41–#48 folded in. Changes from this plan:
- Kickers use Geist (sans), not mono, to keep a 23 KB font off every first view.
- Pipeline variants are 320/480/800/1200 (320 added for thumbnails).
- The Latest river is text-only on phones.
- Below-the-fold blocks use `content-visibility: auto`.
- Search is a server-rendered page with no client dialog.

Still open: in lab simulation, mobile LCP is 2.5–3.5 s, which misses the 2.5 s budget even though every page improved on main; font weight on articles (~136 KB) is over budget; and the real-device / PSI / Rich Results passes need a deploy.
