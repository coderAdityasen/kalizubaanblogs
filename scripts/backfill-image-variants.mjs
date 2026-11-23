#!/usr/bin/env node
/**
 * Backfill: re-upload old post covers through the new image pipeline so they
 * get the ≤1 MB WebP main file plus 320/480/800/1200 variants (the "-kzv1-" names
 * that SmartImage turns into a srcset), then point the post at the new cover.
 *
 * It only talks to the site's own API, so the pipeline, storage bucket and
 * cache refresh are exactly the ones new uploads use:
 *   GET  /api/posts            (list)
 *   POST /api/upload           (pipeline: compress + variants)
 *   PATCH /api/posts/<slug>    ({ cover_image })
 *
 * Dry run by default (prints what it would do). Usage:
 *   BLOG_API_SECRET=... node scripts/backfill-image-variants.mjs --base=https://www.kalizubaan.fun [--apply] [--limit=20] [--slug=one-post]
 *
 * Each converted cover costs one upload (4 files) and one post update; run it
 * when the Supabase quota has room, e.g. in batches with --limit.
 */
const opt = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const base = String(opt.base || "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.BLOG_API_SECRET;
const apply = Boolean(opt.apply);
const limit = Number(opt.limit || Infinity);

if (apply && !secret) {
  console.error("Set BLOG_API_SECRET to run with --apply.");
  process.exit(2);
}

const res = await fetch(`${base}/api/posts`);
if (!res.ok) throw new Error(`GET /api/posts -> ${res.status}`);
const json = await res.json();
const posts = (json.posts || json.data || json).filter((p) => p && p.slug);

const todo = posts
  .filter((p) => !opt.slug || p.slug === opt.slug)
  .filter((p) => p.cover_image && !p.cover_image.includes("-kzv1-"))
  .slice(0, limit);

console.log(`${posts.length} posts, ${todo.length} cover(s) to convert${apply ? "" : " (dry run; add --apply to write)"}.`);

let done = 0;
let saved = 0;
for (const post of todo) {
  if (!apply) {
    console.log(`  would convert ${post.slug}: ${post.cover_image}`);
    continue;
  }
  try {
    const img = await fetch(post.cover_image);
    if (!img.ok) throw new Error(`download ${img.status}`);
    const blob = await img.blob();
    const name = decodeURIComponent(new URL(post.cover_image).pathname.split("/").pop() || `${post.slug}.jpg`);
    const form = new FormData();
    form.append("file", blob, name);
    form.append("folder", "covers");
    const up = await fetch(`${base}/api/upload`, { method: "POST", headers: { "x-api-key": secret }, body: form });
    const upJson = await up.json();
    if (!up.ok || !upJson.url) throw new Error(`upload ${up.status}: ${upJson.message || upJson.error}`);
    const patch = await fetch(`${base}/api/posts/${encodeURIComponent(post.slug)}`, {
      method: "PATCH",
      headers: { "x-api-key": secret, "content-type": "application/json" },
      body: JSON.stringify({ cover_image: upJson.url }),
    });
    if (!patch.ok) throw new Error(`patch ${patch.status}`);
    done++;
    saved += (upJson.originalSize || 0) - (upJson.size || 0);
    console.log(`  ✓ ${post.slug}: ${Math.round((upJson.originalSize || 0) / 1024)} KB -> ${Math.round(upJson.size / 1024)} KB`);
  } catch (err) {
    console.log(`  ✗ ${post.slug}: ${err.message}`);
  }
}
if (apply) console.log(`Converted ${done}/${todo.length}; ${Math.round(saved / 1024)} KB saved on main files.`);
