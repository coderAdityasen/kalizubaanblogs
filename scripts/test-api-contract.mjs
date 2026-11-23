/**
 * Contract test for the publishing API (what the blog autopilot relies on).
 *
 *   BLOG_API_SECRET=... BASE_URL=http://localhost:3000 node scripts/test-api-contract.mjs
 *
 * Run it against a local `next start` (no Supabase configured: uploads go to
 * public/uploads and posts to the in-memory store). Never point it at the
 * live site: it creates a test post and uploads images.
 */
import { createRequire } from "module";
import assert from "assert/strict";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SECRET = process.env.BLOG_API_SECRET || "demo-secret-key-12345";
if (/kalizubaan\.fun/.test(BASE)) {
  console.error("Refusing to run the contract test against the live site.");
  process.exit(2);
}

const results = [];

/**
 * Bytes of a stored upload. `next start` only serves public/ files that existed
 * at build time, so local-disk uploads are read from disk instead.
 */
async function storedBytes(url) {
  const local = url.match(/^https?:\/\/localhost(?::\d+)?\/(uploads\/.+)$/);
  if (local) {
    const fs = await import("fs");
    const path = await import("path");
    return fs.readFileSync(path.join(process.cwd(), "public", local[1]));
  }
  const res = await fetch(url);
  assert.equal(res.status, 200, `GET ${url} -> ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
async function check(name, fn) {
  try {
    await fn();
    results.push([true, name]);
    console.log(`  ✓ ${name}`);
  } catch (err) {
    results.push([false, name]);
    console.log(`  ✗ ${name}\n      ${err.message}`);
  }
}

const bearer = { Authorization: `Bearer ${SECRET}` };
const xKey = { "x-api-key": SECRET };

function form(buffer, name, type, extra = {}) {
  const fd = new FormData();
  fd.append("file", new Blob([buffer], { type }), name);
  for (const [k, v] of Object.entries(extra)) fd.append(k, v);
  return fd;
}

async function json(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 200)}`);
  }
}

// Test images
const noisyPhoto = await sharp({
  create: { width: 4000, height: 2600, channels: 3, noise: { type: "gaussian", mean: 128, sigma: 60 } },
})
  .jpeg({ quality: 95 })
  .toBuffer();
const chartPng = await sharp({
  create: { width: 1400, height: 900, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
})
  .composite([
    {
      input: Buffer.from(
        `<svg width="1400" height="900"><rect x="100" y="300" width="200" height="500" fill="#0138a9"/><rect x="400" y="150" width="200" height="650" fill="#17b4fa"/><text x="100" y="100" font-size="64" font-family="sans-serif">Returns 2026 (%)</text></svg>`
      ),
    },
  ])
  .png()
  .toBuffer();
const smallWebp = await sharp({ create: { width: 600, height: 340, channels: 3, background: "#123456" } }).webp().toBuffer();
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

console.log(`Contract test against ${BASE}\n\nUpload API`);
console.log(`  (test photo is ${(noisyPhoto.length / 1024 / 1024).toFixed(1)} MB)`);

await check("POST /api/upload without a key -> 401 with the same error shape", async () => {
  const res = await fetch(`${BASE}/api/upload`, { method: "POST", body: form(smallWebp, "a.webp", "image/webp") });
  assert.equal(res.status, 401);
  const body = await json(res);
  assert.equal(body.success, false);
  assert.equal(body.error, "Unauthorized");
  assert.ok(body.message && body.help);
});

await check("POST /api/upload with a wrong key -> 401", async () => {
  const res = await fetch(`${BASE}/api/upload`, {
    method: "POST",
    headers: { Authorization: "Bearer wrong-key" },
    body: form(smallWebp, "a.webp", "image/webp"),
  });
  assert.equal(res.status, 401);
});

let photo;
await check("Large JPEG (Bearer auth, folder=covers) -> 201 compressed WebP ≤ 1 MB with variants and all original fields", async () => {
  const res = await fetch(`${BASE}/api/upload`, {
    method: "POST",
    headers: bearer,
    body: form(noisyPhoto, "My Cover Photo.JPG", "image/jpeg", { folder: "covers" }),
  });
  const body = await json(res);
  assert.equal(res.status, 201, JSON.stringify(body));
  for (const k of ["success", "message", "url", "path", "filename", "originalName", "size", "contentType", "storage"]) {
    assert.ok(k in body, `missing field ${k}`);
  }
  for (const k of ["originalSize", "width", "height", "format", "optimized", "savedPercent", "variants"]) {
    assert.ok(k in body, `missing new field ${k}`);
  }
  assert.equal(body.success, true);
  assert.equal(body.originalName, "My Cover Photo.JPG");
  assert.equal(body.contentType, "image/webp");
  assert.ok(body.size <= 1_000_000, `stored ${body.size} bytes`);
  assert.ok(body.width <= 1600);
  assert.equal(body.originalSize, noisyPhoto.length);
  assert.deepEqual(Object.keys(body.variants).sort(), ["1200", "480", "800"]);
  assert.match(body.url, /-kzv1-w1600\.webp$/);
  photo = body;
});

await check("Stored photo and its 480px copy are real WebP files of the right size", async () => {
  assert.ok(photo, "previous upload failed");
  const main = await storedBytes(photo.url);
  const meta = await sharp(main).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, photo.width);
  assert.ok(main.length <= 1_000_000);
  assert.ok(!meta.exif, "EXIF should be stripped");
  const small = await sharp(await storedBytes(photo.variants["480"])).metadata();
  assert.equal(small.width, 480);
});

await check("PNG chart (x-api-key auth) -> 201 WebP, smaller than the PNG", async () => {
  const res = await fetch(`${BASE}/api/upload`, { method: "POST", headers: xKey, body: form(chartPng, "chart.png", "image/png") });
  const body = await json(res);
  assert.equal(res.status, 201, JSON.stringify(body));
  assert.equal(body.contentType, "image/webp");
  assert.ok(body.size < chartPng.length, `${body.size} >= ${chartPng.length}`);
});

await check("optimize=false keeps a small image exactly as sent", async () => {
  const res = await fetch(`${BASE}/api/upload`, {
    method: "POST",
    headers: bearer,
    body: form(smallWebp, "keep.webp", "image/webp", { optimize: "false" }),
  });
  const body = await json(res);
  assert.equal(res.status, 201, JSON.stringify(body));
  assert.equal(body.size, smallWebp.length);
  assert.equal(body.optimized, false);
});

await check("SVG upload -> 400 Invalid File Type", async () => {
  const res = await fetch(`${BASE}/api/upload`, { method: "POST", headers: bearer, body: form(svg, "x.svg", "image/svg+xml") });
  assert.equal(res.status, 400);
  assert.equal((await json(res)).error, "Invalid File Type");
});

await check("Non-image bytes labelled image/png -> 400", async () => {
  const res = await fetch(`${BASE}/api/upload`, { method: "POST", headers: bearer, body: form(Buffer.from("hello"), "x.png", "image/png") });
  assert.equal(res.status, 400);
});

await check("Missing file -> 400 Bad Request", async () => {
  const fd = new FormData();
  fd.append("folder", "covers");
  const res = await fetch(`${BASE}/api/upload`, { method: "POST", headers: bearer, body: fd });
  assert.equal(res.status, 400);
  assert.equal((await json(res)).error, "Bad Request");
});

console.log("\nPosts API");
const slug = `contract-test-${Date.now()}`;
const payload = {
  title: "Contract test post",
  slug,
  excerpt: "Created by scripts/test-api-contract.mjs",
  content: "## Hello\n\nThis post checks the publishing API.\n\n## FAQs\n\n### Is this real?\n\nNo.",
  cover_image: photo?.url,
  category: "Tech & AI",
  tags: ["Test"],
  author_name: "Aditya Sen",
};

await check("POST /api/posts without a key -> 401", async () => {
  const res = await fetch(`${BASE}/api/posts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  assert.equal(res.status, 401);
  assert.equal((await json(res)).error, "Unauthorized");
});

await check("POST /api/posts without title -> 400 Validation Error", async () => {
  const res = await fetch(`${BASE}/api/posts`, {
    method: "POST",
    headers: { ...bearer, "Content-Type": "application/json" },
    body: JSON.stringify({ content: "x" }),
  });
  assert.equal(res.status, 400);
  assert.equal((await json(res)).error, "Validation Error");
});

await check("POST /api/posts (Bearer) -> 201 with post, url, slug, storage", async () => {
  const res = await fetch(`${BASE}/api/posts`, {
    method: "POST",
    headers: { ...bearer, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await json(res);
  assert.equal(res.status, 201, JSON.stringify(body));
  for (const k of ["success", "message", "post", "url", "slug", "storage"]) assert.ok(k in body, `missing ${k}`);
  assert.equal(body.slug, slug);
  assert.match(body.url, new RegExp(`/blog/${slug}$`));
  assert.equal(body.post.title, payload.title);
});

await check("GET /api/posts lists the post by title, without article bodies", async () => {
  const res = await fetch(`${BASE}/api/posts`);
  const body = await json(res);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.posts) && typeof body.count === "number");
  const found = body.posts.find((p) => p.slug === slug);
  assert.ok(found, "new post missing from list");
  assert.equal(found.title, payload.title);
  assert.ok(!("content" in found), "list should not include content");
});

await check("GET /api/posts?include=content returns full posts", async () => {
  const body = await json(await fetch(`${BASE}/api/posts?include=content&category=Tech%20%26%20AI`));
  const found = body.posts.find((p) => p.slug === slug);
  assert.ok(found && found.content.includes("publishing API"));
});

await check("GET /api/posts/<slug> -> 200 full post", async () => {
  const body = await json(await fetch(`${BASE}/api/posts/${slug}`));
  assert.equal(body.success, true);
  assert.equal(body.post.slug, slug);
  assert.ok(body.post.content);
});

await check("PATCH /api/posts/<slug> without a key -> 401", async () => {
  const res = await fetch(`${BASE}/api/posts/${slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "x" }) });
  assert.equal(res.status, 401);
});

await check("PATCH /api/posts/<slug> (x-api-key) edits allowed fields only", async () => {
  const res = await fetch(`${BASE}/api/posts/${slug}`, {
    method: "PATCH",
    headers: { ...xKey, "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Contract test post (edited)", tags: ["Test", "Edited"] }),
  });
  const body = await json(res);
  assert.equal(res.status, 200, JSON.stringify(body));
  assert.deepEqual(body.updated_fields.sort(), ["tags", "title"]);
  assert.equal(body.slug, slug);
});

await check("PATCH with a non-editable field -> 400", async () => {
  const res = await fetch(`${BASE}/api/posts/${slug}`, {
    method: "PATCH",
    headers: { ...bearer, "Content-Type": "application/json" },
    body: JSON.stringify({ slug: "new-slug" }),
  });
  assert.equal(res.status, 400);
});

await check("The new post renders at /blog/<slug>", async () => {
  const res = await fetch(`${BASE}/blog/${slug}`);
  assert.equal(res.status, 200);
  assert.ok((await res.text()).includes("Contract test post (edited)"));
});

console.log("\nNewsletter");
await check("POST /api/newsletter with no service connected -> 503 with a plain message (no fake success)", async () => {
  const res = await fetch(`${BASE}/api/newsletter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "reader@example.com" }) });
  const body = await json(res);
  assert.equal(res.status, 503);
  assert.equal(body.ok, false);
  assert.match(body.message, /aren't open yet/);
});
await check("POST /api/newsletter with an invalid email -> 400", async () => {
  const res = await fetch(`${BASE}/api/newsletter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "nope" }) });
  assert.equal(res.status, 400);
});

const failed = results.filter(([ok]) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
