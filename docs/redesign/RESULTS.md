# Redesign QA results (Phase 5)

All checks were run on the box on 23 Nov 2026 against local production builds (`next build && next start`) using a fixture of the 250 real published posts (Supabase is over quota, so the live database could not be used). Covers in the fixture were run through the new pipeline (WebP + 320/480/800/1200 variants), except posts whose cover is an external URL (e.g. Unsplash), which stay as they are until the backfill runs.

- **before** = `main` (:3001) · **baseline** = `main` + PRs #41–#48 + Next 16.4.6 (:3002) · **after** = `grok` (:3000)

## Lighthouse 12 (simulated throttling: mobile = Moto G Power / slow 4G, desktop preset)

| Page | Form | Before (main): perf · LCP · CLS · TBT · weight | After (grok) | After a11y / SEO |
|---|---|---|---|---|
| Home | mobile | 88 · 3.89 s · 0.000 · 32 ms · 890 KB | **95 · 2.97 s · 0.000 · 27 ms · 530 KB** | 100 / 100 |
| Home | desktop | 100 · 0.78 s · 0.000 · 0 ms · 1453 KB | **100 · 0.76 s · 0.000 · 0 ms · 1113 KB** | 100 / 100 |
| /blog | mobile | 88 · 3.88 s · 0.000 · 31 ms · 995 KB | **98 · 2.48 s · 0.000 · 29 ms · 488 KB** | 100 / 100 |
| /blog | desktop | 99 · 0.92 s · 0.000 · 0 ms · 1439 KB | **100 · 0.78 s · 0.000 · 0 ms · 1079 KB** | 100 / 100 |
| Category: Personal Finance | mobile | 85 · 4.36 s · 0.000 · 33 ms · 1235 KB | **94 · 3.03 s · 0.000 · 24 ms · 553 KB** | 100 / 100 |
| Category: Personal Finance | desktop | 99 · 0.93 s · 0.000 · 0 ms · 1791 KB | **100 · 0.72 s · 0.000 · 0 ms · 762 KB** | 100 / 100 |
| Topic hub: IPO | mobile | 91 · 3.51 s · 0.000 · 30 ms · 745 KB | **95 · 2.94 s · 0.000 · 28 ms · 538 KB** | 100 / 100 |
| Topic hub: IPO | desktop | 100 · 0.70 s · 0.000 · 0 ms · 745 KB | **100 · 0.63 s · 0.000 · 0 ms · 731 KB** | 100 / 100 |
| Post: FD post-tax (pipeline cover) | mobile | 95 · 2.89 s · 0.000 · 28 ms · 547 KB | **96 · 2.56 s · 0.000 · 26 ms · 500 KB** | 100 / 100 |
| Post: FD post-tax (pipeline cover) | desktop | 100 · 0.59 s · 0.000 · 0 ms · 547 KB | **100 · 0.65 s · 0.000 · 0 ms · 615 KB** | 100 / 100 |
| Post: AI YouTube (pipeline cover) | mobile | 95 · 2.89 s · 0.000 · 28 ms · 402 KB | **95 · 2.88 s · 0.000 · 28 ms · 401 KB** | 100 / 100 |
| Post: AI YouTube (pipeline cover) | desktop | 100 · 0.63 s · 0.000 · 0 ms · 443 KB | **100 · 0.63 s · 0.000 · 0 ms · 595 KB** | 100 / 100 |
| Post: IPO guide (old Unsplash cover) | mobile | 94 · 2.95 s · 0.000 · 68 ms · 634 KB | **91 · 3.47 s · 0.000 · 28 ms · 621 KB** | 100 / 100 |
| Post: IPO guide (old Unsplash cover) | desktop | 100 · 0.63 s · 0.000 · 0 ms · 664 KB | **100 · 0.72 s · 0.000 · 0 ms · 745 KB** | 100 / 100 |
| Author | mobile | 100 · 1.88 s · 0.000 · 27 ms · 368 KB | **96 · 2.59 s · 0.000 · 105 ms · 323 KB** | 100 / 100 |
| Author | desktop | 100 · 0.51 s · 0.000 · 0 ms · 493 KB | **100 · 0.55 s · 0.000 · 0 ms · 472 KB** | 100 / 100 |
| About | mobile | 97 · 2.51 s · 0.000 · 31 ms · 538 KB | **95 · 2.70 s · 0.000 · 120 ms · 410 KB** | 100 / 100 |
| About | desktop | 100 · 0.53 s · 0.000 · 0 ms · 731 KB | **100 · 0.51 s · 0.000 · 0 ms · 496 KB** | 100 / 100 |
| Start here (new) | mobile | n/a (new page) | **92 · 3.35 s · 0.000 · 56 ms · 592 KB** | 96 / 100 |
| Start here (new) | desktop | n/a (new page) | **100 · 0.79 s · 0.002 · 0 ms · 984 KB** | 100 / 100 |

Notes
- Every mobile score ≥ 90 except Start here mobile in the earlier run (87; first card is an old 109 KB Unsplash cover, now marked priority: re-run = 92). CLS is 0 everywhere (budget < 0.02). Accessibility, Best Practices and SEO are 100 on every page except Start here a11y 96, a Lighthouse colour-contrast false positive on a `<time>` inside a `content-visibility: auto` block (axe, which renders it, reports 0).
- Mobile LCP improved on every list page (home 3.89 → 2.97 s, /blog 3.88 → 2.48 s, category 4.36 → 3.03 s, hub 3.51 → 2.94 s) but is still above the 2.5 s budget in this lab simulation. What remains before LCP is mostly Next/React framework JS (~150 KB, same as main) and fonts. Real-device numbers need PageSpeed Insights on a deploy once Supabase is back.
- Posts with an old external cover (IPO guide: 109 KB Unsplash JPEG) are the slowest. The backfill script fixes those.
- Font cost on article pages is about 136 KB (Geist latin + latin-ext for ₹, Source Serif 4 upright latin + latin-ext). That is over the 90 KB font budget; the serif italic file was dropped to save 50 KB. Switching articles to sans (`ARTICLE_BODY_FONT = "sans"` in `lib/design.ts`) would remove ~90 KB.

## Accessibility: axe-core 4 (WCAG 2.0/2.1 A+AA + best practice)
10 pages × light/dark × desktop 1440 / mobile 390: **0 violations** (one heading-order issue on /search was fixed).

## SEO parity (`scripts/seo-parity.mjs`, 29 pages + sitemap + feed)
- **grok vs baseline (main + #41–#48): only difference is the intended new `SearchAction` in the WebSite JSON-LD (28 pages).** Titles, descriptions, canonicals, robots, OG/Twitter, BlogPosting/FAQ/Breadcrumb/CollectionPage JSON-LD, h1 text and count, lang and status codes are identical. The sitemap gains `/start-here`; the feed is identical.
- grok vs main: 146 differences, all from the already-reviewed PRs #41–#45 (en-IN lang/og:locale, title helper, static-page share cards, 404 robots) plus SearchAction.

## Link check
267 pages crawled from the sitemap (+ search and a 404): **0 broken internal links or assets** (299 unique internal URLs); 1,952 external links found (not fetched).

## API contract test (`scripts/test-api-contract.mjs`)
**21/21 passed**: auth (401s, Bearer and x-api-key), POST/PATCH/GET payloads unchanged, summaries vs `?include=content`, cache headers, upload of a large photo → WebP ≤ 1 MB with 320/480/800/1200 variants and all old response fields, `optimize=false`, SVG rejected, newsletter 503 with no fake success, and the honeypot.

## Other
- `tsc --noEmit`, `npm run lint` (0 problems), `npm run build`: green. `npm audit`: 0 vulnerabilities (Next 16.4.6).
- No horizontal overflow at 390 px on any page tested (tables and code scroll inside their own box).
- Motion: CSS only, and all of it is off under `prefers-reduced-motion`. View Transitions are progressive (Chrome/Edge); other browsers navigate normally.
- Not done here (needs real devices or a deploy): Safari iOS / Samsung Internet pass, a screen-reader pass, Rich Results test on the live URL, and PSI field data.
