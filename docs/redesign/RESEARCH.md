# Redesign research: 5 publications studied

*Phase 0 of the Kali Zubaan redesign. Visited on 23 Nov 2026 (IST) with a real Chrome at 1440×900 (desktop) and 390×844 @2x (mobile), on each site's index page and one article. Fonts, sizes and widths below come from the computed styles of the rendered pages; motion notes come from the stylesheets (transitions, `@keyframes`, `prefers-reduced-motion`, View Transitions, scroll-driven animations).*

Shortlist that was visited: The Verge, Medium, Stripe Blog, Linear (Now), Vercel Blog, Ghost, Lenny's Newsletter (Substack). The five below were chosen because together they cover the three things Kali Zubaan needs: a **news-style front page** (The Verge), a **best-in-class reading column** (Medium, Substack), and **premium-but-quiet product polish** (Stripe, Linear). Vercel's blog is noted at the end because it runs on the same stack (Next.js + Geist) and is the closest practical reference.

---

## 1. The Verge — theverge.com
**Role for us:** front page structure, strong identity, category-led navigation.

| | Measured |
|---|---|
| Display type | polySans (custom grotesk), article h1 65px desktop / 44px mobile, weight 500, tight tracking (−0.02em), line-height 1.0 |
| Deck / body | fkRoman serif for decks on the homepage (24px / 1.2); article deck 26px |
| Nav | Wordmark + 6 flat category links (Tech, Reviews, Science, Entertainment, AI, Policy) + menu icon; no dropdowns |
| Layout | 2-column front page: a large lead story + a narrow "Latest / Following" river on the right with small thumbnails, author + relative time in small caps mono |
| Article header | Full-bleed **colour block** (brand purple) with huge white headline, category pills, byline, timestamp in IST, then share/comment buttons |
| Motion | ~95 transition rules, scroll-driven animations used, `prefers-reduced-motion` respected; mostly colour/underline hovers, nothing moves while reading |
| Weight | Heavy: 2.5–4 MB of JS, ~550 KB of fonts, cookie wall + ads. **Copy the layout, not the payload.** |

**Takeaways**
- A homepage that reads like a front page: one lead, a "Latest" river and category sections beats a uniform card grid.
- Category is identity: each section gets a label and accent, and the nav is just the categories.
- Small monospace "kicker" metadata (CATEGORY · 4 MIN · 2 H AGO) gives a newsroom feel cheaply.
- A coloured article hero is distinctive, but the headline must still be the LCP element (text, not an image).

## 2. Medium — medium.com
**Role for us:** the reading experience.

| | Measured |
|---|---|
| UI type | Söhne (sans) for h1/UI: 42px / 52px desktop, 32px / 38px mobile, weight 700, −0.011em |
| Body | Source Serif Pro **20px / 32px (1.6)** desktop, **18px / 28px** mobile, colour #242424 on white |
| Measure | Text column **680px** (≈ 70 characters) desktop; 342px on a 390px phone (24px gutters) |
| Article header | Tag chips → h1 → grey subtitle (22px) → avatar · name · Follow · "13 min read · 4 days ago" → thin action bar (clap, comment, save, listen, share) between hairlines |
| Chrome | Minimal: logo + search + Write + Sign in; publication strip; nothing sticky while reading except a small bottom bar on mobile |
| Motion | Almost none (3 transitions); dark mode via `prefers-color-scheme` |
| Weight | ~0.7–0.9 MB JS, **39 KB of fonts** |

**Takeaways**
- Serif body at 18–20px with 1.6 line height and a ~680px column is the gold standard for long reads; Kali Zubaan's posts are long-form guides, so this matters most.
- Put reading time and date in the byline; keep the action bar thin and between hairlines.
- Almost no animation while reading. Calm = trust.

## 3. Stripe Blog — stripe.com/blog
**Role for us:** premium polish, cards, colour.

| | Measured |
|---|---|
| Type | sohne-var (variable) everywhere; h1 38px index / 56px article, weight 425–500 (light-ish), −0.2px tracking |
| Colour | Navy text `#0A2540`, slate body `#425466`, pale blue-grey page `#F6F9FC`, violet accent `#635BFF`, plus the signature diagonal gradient band |
| Index | Hero card: category label (violet) → headline → author with photo + role → excerpt → "Read more ›"; image on the right in a soft-shadowed frame |
| Body | 18px / 28px sans, generous section spacing |
| Motion | 34 transitions, **View Transitions** and **scroll-driven animations** present, `prefers-reduced-motion` respected; arrow nudges on hover (`Read more ›` moves 2–3px) |

**Takeaways**
- A featured "hero card" with author photo + role builds E-E-A-T trust (useful for a finance/health blog under AdSense review).
- Tinted page background + white cards gives depth without heavy shadows.
- Micro-interactions are tiny: arrows nudge, underlines grow, cards lift 1–2px. Nothing bounces.

## 4. Linear — linear.app/now
**Role for us:** dark mode, grid rhythm, restraint.

| | Measured |
|---|---|
| Type | Inter Variable, h1 48px weight 510; muted grey metadata |
| Layout | Big page title "Now", then a single row of text filters (All · Changelog · Product launches · …) with search + RSS on the right; 3-column card grid with 16:9 artwork, title, 2-line summary, "Author · Date" |
| Colour | Near-black `#08090A` canvas, cards are just slightly lighter with 1px hairline borders, text in 3 greys |
| Motion | Many CSS transitions (~90–100) and keyframes, View Transitions and scroll timelines present, reduced-motion respected. Effects are opacity/translate fades ≤ 250ms |

**Takeaways**
- Category filters as a plain text row (not pills, not a dropdown) keep the archive calm; RSS icon visible next to search.
- A dark theme designed on purpose (three text greys, hairlines instead of shadows) rather than inverted colours.
- Consistent card anatomy: image → title → 2-line excerpt → meta. Same everywhere.

## 5. Lenny's Newsletter (Substack) — lennysnewsletter.com
**Role for us:** creator-led blog, subscription UX, simplicity.

| | Measured |
|---|---|
| Header | Centered publication wordmark, icon on the left, search/share/**Subscribe** (accent button)/Sign in on the right; a second row of tabs (Home, Podcast, Start here, …) with an underline on the active tab |
| Body | Spectral serif **19px / 30.4px** desktop, **17px / 27.2px** mobile, 728px column, text `#363737` |
| Headings | Bold sans (SF Pro) h2 ~31px |
| Extras | Floating mini table-of-contents (dashes on the left edge that expand on hover) |
| Motion | Essentially none (0 transitions, 0 keyframes) |
| Weight | ~350 KB JS, **13–27 KB fonts** |

**Takeaways**
- "Start here" page for new readers: a curated path through the best posts. Great for a niche blog and for internal linking.
- One clear call to action (Subscribe) in the header; everything else is quiet.
- A minimal edge table-of-contents (dashes → labels on hover) is less intrusive than a boxed TOC.

---

## Honourable mention: Vercel Blog — vercel.com/blog
Same stack as us. Geist Sans for everything: article h1 48px weight 450, body **18px / 28px** in a **684px** column, sticky 64px header, metadata (date, reading time, "Copy" as Markdown) in a **right-hand rail** instead of under the title. View Transitions + scroll-driven animations, reduced motion respected. Takeaway: a quiet right rail can hold date / reading time / share / TOC on desktop and collapse into the byline on mobile.

---

## What all five agree on (the rules we'll design by)
1. **Typography does the work.** Large, tight-tracked sans headlines; 17–20px body with 1.55–1.65 line height; ~65–75 character measure.
2. **One accent colour**, used for links, active states and one primary button. Everything else is greys.
3. **Nav = your sections.** 4–7 flat links, search, one CTA. No mega-menus for a blog.
4. **Consistent card anatomy** (image 16:9 → kicker → title → excerpt → meta) everywhere.
5. **Motion is micro:** 150–250ms colour/opacity/translate, arrow nudges, underline growth, cross-page View Transitions where supported; never while reading; always honour `prefers-reduced-motion`.
6. **Metadata is small and quiet** (mono or small caps, muted colour).
7. **Speed is a design choice:** the fastest of the five (Medium, Substack) are also the calmest. Our budget is much tighter than The Verge's.

## What we will not copy
- Cookie walls, auto-playing media, sticky ad rails and 2–4 MB of JavaScript (The Verge).
- Paywall/member UI and login (Medium/Substack) – the site has no accounts.
- Product-marketing mega-menus (Stripe, Vercel).
