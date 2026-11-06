# Chronicle — Modern API-First Blogging Platform

> Built with **Next.js 16 (App Router)**, **Supabase (PostgreSQL & Row Level Security)**, **Tailwind CSS**, and **Secret Key REST API Authentication**.

---

## ✨ Features

- **🛡️ Secure Secret-Key API**: Publish, update, and manage blog posts programmatically via `POST /api/posts` using Bearer token or `x-api-key` authentication.
- **⚡ Next.js App Router**: Lightning-fast edge rendering, dynamic routing, and partial pre-rendering.
- **🐘 Supabase PostgreSQL Integration**: Fully typed database models with Row Level Security (RLS) guaranteeing safe public read access.
- **✨ Hybrid Local Fallback**: Works immediately out of the box with zero external configuration! If Supabase keys aren't provided, it automatically runs in interactive demo mode.
- **📝 Rich Markdown Engine**: Full GFM support with syntax-highlighted code blocks, copy-to-clipboard buttons, quotes, and responsive images.
- **🔍 Realtime Search & Category Filtering**: Filter articles by categories (Tech, AI, Architecture, Full Stack) and live search by title, tags, or author.
- **🧪 In-Browser API Playground**: Navigate to [`/api-docs`](http://localhost:3000/api-docs) to test API requests with your secret key directly in the UI!

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

> Default Secret Key in `.env.local`: `my-super-secret-key-12345`

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
  -H "Authorization: Bearer my-super-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d @demo-post.json
```

### Option C: Using PowerShell
```powershell
$headers = @{
    "Authorization" = "Bearer my-super-secret-key-12345"
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

### Option D: Using the In-Browser Tester
Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs), enter your secret key, tweak the JSON if desired, and click **"Send POST Request"**.

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
- `logo-{light,dark}.webp`: stacked genie and wordmark, composed from the official separate artwork, for About and the 404 page.

`components/BrandLogo.tsx` supplies the header, full lockup and footer symbol with intrinsic image dimensions and the accessible Kali Zubaan name. `public/logo.png` keeps its public URL for Organization and BlogPosting structured data: it is the official wordmark at 600×240 on a white field. `public/og-image.png` is the 1200×630 default social card. The browser icons (`app/favicon.ico` with 16/32/48px frames, `app/icon.png` at 192px, and `app/apple-icon.png`) use the blue genie on a padded white square. `app/manifest.ts` names the site Kali Zubaan and exposes those icons to installed browsers.

The source letterforms and genie details are preserved rather than auto-traced to SVG. The color WebPs use high-quality compression with exact transparency; the public publisher logo and share image remain PNG for crawler compatibility.

---

## 📂 Project Structure

```
├── app/
│   ├── api/
│   │   └── posts/
│   │       ├── route.ts          # POST (create with secret key) & GET posts
│   │       └── [slug]/route.ts   # GET single post by slug
│   ├── api-docs/
│   │   └── page.tsx              # Interactive API Docs & Live Tester
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx          # Dynamic blog post page with Markdown
│   ├── layout.tsx                # Root layout with Navbar & Footer
│   ├── page.tsx                  # Home page with Featured & Grid view
│   └── globals.css               # Tailwind styling & dark mode
├── components/
│   ├── ApiPlayground.tsx         # In-browser live testing suite
│   ├── BlogList.tsx              # Search & category filtering
│   ├── MarkdownContent.tsx       # Markdown renderer with code copy
│   ├── Navbar.tsx                # Sleek top navigation
│   ├── Footer.tsx                # Site footer
│   ├── PostCard.tsx              # Modern card component
│   └── ShareBar.tsx              # Social sharing & copy link
├── lib/
│   ├── sample-data.ts            # High quality sample demo posts
│   └── supabase.ts               # Supabase client + local fallback engine
├── scripts/
│   └── send-demo-post.mjs        # Executable test script
├── supabase/
│   └── schema.sql                # Complete Supabase PostgreSQL schema & RLS
├── demo-post.json                # Sample demo post JSON file
└── .env.local                    # Local environment secrets
```
