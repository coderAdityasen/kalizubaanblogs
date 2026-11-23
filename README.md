# Kali Zubaan (kalizubaan.fun)

Plain-English explainers on personal finance, tech & AI, side hustles and health for readers in India.

> **Next.js 16 (App Router)** · **React 19** · **Tailwind CSS v4** · **Supabase** (Postgres + Storage) · secret-key REST API for publishing · deployed on Vercel.

---

## ✨ Features

- **Editorial design system** (Nov 2026 redesign, see [`docs/redesign/`](./docs/redesign/ARCHITECTURE.md)): design tokens in `styles/tokens.css`, light/dark theme that follows the system setting with a toggle (no flash, works without JS), Geist for UI and Source Serif 4 for article bodies, one accent colour per section.
- **Pages**: homepage (lead story + "Latest" river + section blocks), `/blog` and category archives, topic hubs, article page (TOC rail, reading progress, share bar, author box, related + previous/next), `/start-here`, `/search` (server-rendered, no JS needed), author, About/Contact/legal, 404.
- **Secure secret-key API**: create, update and list posts and upload images (`/api/posts`, `/api/posts/<slug>`, `/api/upload`) with `Authorization: Bearer` or `x-api-key`. Constant-time key comparison; in production a missing `BLOG_API_SECRET` rejects every write.
- **Image pipeline**: every upload is converted to WebP, capped at 1600×2400 and **guaranteed ≤ 1 MB**, with 320/480/800/1200 px variants that pages serve through `srcset`.
- **SEO**: BlogPosting/FAQPage/BreadcrumbList/CollectionPage/ItemList/Person JSON-LD, WebSite SearchAction, image sitemap, RSS feed, canonical + Open Graph on every page, ISR with instant refresh on publish.
- **Performance**: server-rendered Markdown (no markdown JS in the browser), CSS-only motion (View Transitions, scroll-driven effects; all off under `prefers-reduced-motion`), space reserved for every image and ad slot.

---

## 🚀 Quick Start

### 1. Install & Run Dev Server
```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the blogging website.

---

## 🔑 Publishing a Blog Post via API

### Endpoint: `POST /api/posts`

#### Headers:
- `Content-Type: application/json`
- `Authorization: Bearer <BLOG_API_SECRET>` *(or `x-api-key: <BLOG_API_SECRET>`)*

> Locally, if `BLOG_API_SECRET` is not set, the dev-only key `demo-secret-key-12345` works. In production it never does: set `BLOG_API_SECRET` in Vercel.

### Sample JSON Blog Post Payload (`demo-post.json`):
```json
{
  "title": "Autonomous Publishing: How We Built an API-First Blog with Next.js and Supabase",
  "slug": "autonomous-publishing-nextjs-supabase-api",
  "excerpt": "A deep dive into building an ultra-fast developer blog powered by Next.js and Supabase.",
  "category": "Full Stack",
  "tags": ["Next.js", "Supabase", "TypeScript", "REST API"],
  "author_name": "Aditya",
  "author_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  "cover_image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  "reading_time": 4,
  "published": true,
  "content": "## Introduction to API-Driven Publishing\n\nPublish technical articles straight from your terminal or CI/CD pipelines.\n\n```bash\ncurl -X POST https://yourblog.com/api/posts ...\n```"
}
```

### Option A: Run the Pre-Built Demo Script
We have provided an automated script that sends `demo-post.json` to your local running server:
```bash
node scripts/send-demo-post.mjs
```

### Option B: Using cURL
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer demo-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d @demo-post.json
```

### Option C: Using PowerShell
```powershell
$headers = @{
    "Authorization" = "Bearer demo-secret-key-12345"
    "Content-Type"  = "application/json"
}
$body = Get-Content -Raw -Path "demo-post.json"
Invoke-RestMethod -Uri "http://localhost:3000/api/posts" -Method Post -Headers $headers -Body $body
```

### Editing an existing post: `PATCH /api/posts/<slug-or-id>`

Same authentication as `POST` (`Authorization: Bearer <BLOG_API_SECRET>` or `x-api-key`).
Send only the fields you want to change. Allowed fields: `title`, `content`, `excerpt`,
`tags` (array of strings), `cover_image`, `category`. The slug, author and `created_at`
never change, so the URL stays the same. `updated_at` is set to now, which the article
shows as **Last updated** and sends to Google as `dateModified`. Unknown fields or an
empty body return `400`; a slug or id that doesn't exist returns `404` (PATCH never
creates a post).

```bash
curl -X PATCH https://www.kalizubaan.fun/api/posts/my-post-slug \
  -H "Authorization: Bearer $BLOG_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"excerpt": "A sharper summary.", "tags": ["ipo", "ipo allotment"]}'
```

Unlike re-sending the post to `POST /api/posts` (which upserts by slug and resets any
field you leave out, such as the excerpt, cover image and author), `PATCH` leaves
untouched fields alone.

Optional database migration: [`supabase/migrations/20261028_posts_updated_at.sql`](./supabase/migrations/20261028_posts_updated_at.sql)
adds a trigger so `updated_at` also changes when a post is edited in the Supabase
dashboard. Safe to re-run; run it once in the Supabase SQL Editor.

### Uploading images: `POST /api/upload`

`multipart/form-data` with a `file` field (JPEG, PNG, WebP, AVIF or GIF; **SVG is rejected**), same auth headers. Optional fields: `folder` (default `uploads`), `bucket` (default `blog-images`), `optimize=false` (keep the original bytes; only allowed when the file is already ≤ 1 MB).

The response keeps every field it had before (`success`, `message`, `url`, `path`, `bucket`, `filename`, `originalName`, `size`, `contentType`, `storage`) and adds:

| Field | Meaning |
| --- | --- |
| `originalSize` | bytes received |
| `width`, `height`, `format` | the stored main image (normally `webp`) |
| `optimized`, `savedPercent` | whether the pipeline re-encoded it, and how much smaller it got |
| `variants` | `{ "320": url, "480": url, "800": url, "1200": url }` (smaller widths only) |

`url` is always ≤ 1,000,000 bytes. Files are named `<stem>-kzv1-w<width>.webp`; the `-kzv1-` marker lets pages build a `srcset` from any of them.

### API changes in the Nov 2026 redesign (all backward compatible)

- `GET /api/posts` now returns post **summaries** (no `content`) and is CDN-cached for 10 minutes; add `?include=content` for full posts (not cached).
- `POST`/`PATCH` refresh every page that lists the post (home, archives, categories, hubs, sitemap, feed, search, start-here, author).
- `/api/upload`: the new response fields above; SVG and non-image files are rejected with `400` ("Invalid File Type"); an image that cannot be brought under 1 MB returns `422`.
- Run `node scripts/test-api-contract.mjs` against a local server to check all of this (it refuses to run against the live site).

---

## 🐘 Supabase Database Setup

When you are ready to persist to your own Supabase cloud database:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase Dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql):
   ```sql
   create table if not exists public.posts (
     id uuid primary key default gen_random_uuid(),
     title text not null,
     slug text unique not null,
     excerpt text,
     content text not null,
     cover_image text,
     category text default 'Engineering',
     tags text[] default '{}'::text[],
     author_name text default 'Aditya',
     author_avatar text,
     reading_time integer default 3,
     published boolean default true,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   alter table public.posts enable row level security;

   create policy "Anyone can read published posts"
     on public.posts for select
     using (published = true);

   create policy "Service role full access"
     on public.posts for all
     using (true)
     with check (true);
   ```
4. Copy your Supabase credentials into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   BLOG_API_SECRET=your-custom-secret-key
   ```
5. Restart the server (`npm run dev`). Your posts will now sync straight to your Supabase PostgreSQL database!

---

## Brand assets

The official genie and Kalizubaan wordmark are organized in `public/brand/`:

- `genie.webp`: transparent full-color blue genie mark for the header, footer and other compact placements. One version works across light and dark themes.
- `wordmark-{light,dark}.webp`: transparent wordmark; the light variant has dark ink and the dark variant has white ink.
- `genie-96.webp` and `wordmark-{light,dark}-252.webp`: small copies of the masters sized for 2x screens. Images are served unoptimized, so the header and footer use these instead of downloading the 480px/840px masters on every page. Regenerate them if the masters change.
- `logo-{light,dark}.webp`: stacked genie and wordmark, composed from the official separate artwork, for About and the 404 page.

`components/BrandLogo.tsx` supplies the header, full lockup and footer symbol with intrinsic image dimensions and the accessible Kali Zubaan name. `public/logo.png` keeps its public URL for Organization and BlogPosting structured data: it is the official wordmark at 600×240 on a white field. `public/og-image.png` is the 1200×630 default social card. The browser icons (`app/favicon.ico` with 16/32/48px frames, `app/icon.png` at 192px, and `app/apple-icon.png`) use the blue genie on a padded white square. `app/manifest.ts` names the site Kali Zubaan and exposes those icons to installed browsers.

The source letterforms and genie details are preserved rather than auto-traced to SVG. The color WebPs use high-quality compression with exact transparency; the public publisher logo and share image remain PNG for crawler compatibility.

---

## Configuration (environment variables)

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | posts + image storage |
| `BLOG_API_SECRET` | the write API (required in production) |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs (defaults to `https://www.kalizubaan.fun`) |
| `NEWSLETTER_WEBHOOK_URL` | *optional.* Newsletter sign-ups are POSTed here as JSON `{ email, source, ts }` (works with Zapier/Make/Buttondown/ConvertKit webhooks). Until it is set, the form shows "Email sign-ups aren't open yet" and points to the RSS feed; it never pretends to subscribe anyone. Handler: `lib/newsletter.ts`. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | *optional.* `ca-pub-…`. Loads the AdSense script (lazily) once set. |
| `NEXT_PUBLIC_ADSENSE_SLOT_HOME`, `…_LISTING`, `…_IN_ARTICLE`, `…_ARTICLE_END` | *optional.* Ad unit ids per placement. A placement renders nothing until both the client id and its slot id are set; its space is reserved so ads never shift the page. |

## Checks and maintenance scripts

```bash
npx tsc --noEmit && npm run lint && npm run build
node scripts/test-api-contract.mjs                      # API contract (local server only)
node scripts/seo-parity.mjs http://localhost:3001 http://localhost:3000   # compare head tags/JSON-LD/sitemap of two builds
BLOG_API_SECRET=... node scripts/backfill-image-variants.mjs --base=https://www.kalizubaan.fun [--apply] [--limit=20]
```

`backfill-image-variants.mjs` re-uploads old covers through the pipeline (WebP ≤ 1 MB + variants) and points each post at its new cover. It is a dry run unless you pass `--apply`; run it in batches when the Supabase quota has room.

Tune the design in one place: `styles/tokens.css` (colours, type scale, spacing, motion), `lib/design.ts` (default theme, article font, section names/taglines), `lib/start-here.ts` (hand-picked Start here posts).

---

## 📂 Project Structure

```
├── app/
│   ├── api/posts/, api/upload/, api/newsletter/   # write API, uploads, newsletter
│   ├── blog/[slug]/          # article page
│   ├── blog/, blog/category/, blog/topics/        # archives, sections, topic hubs
│   ├── start-here/, search/, author/, about/ …    # other pages
│   ├── sitemap.xml/, feed.xml/                    # crawl files (ISR)
│   ├── layout.tsx            # fonts, theme script, header/footer, JSON-LD
│   └── globals.css           # Tailwind v4 + component classes
├── styles/                   # tokens.css, prose.css, motion.css
├── components/
│   ├── layout/               # SiteHeader, SiteFooter, NavLinks, MobileNav
│   ├── blog/                 # PostCard, Kicker, SectionHeader, AuthorBox, TocRail, NewsletterForm
│   ├── ads/                  # AdSlot (inert until configured)
│   ├── ui/                   # ThemeScript, ThemeToggle
│   └── MarkdownContent.tsx   # server-side Markdown renderer
├── lib/                      # data access, image pipeline, auth, revalidation, SEO helpers
├── scripts/                  # contract test, SEO parity, backfill, demo post
├── docs/redesign/            # research, architecture, screenshots
└── supabase/                 # schema + migrations
```
