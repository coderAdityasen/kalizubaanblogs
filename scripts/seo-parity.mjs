#!/usr/bin/env node
/**
 * SEO parity check: compares the head tags and structured data of two running
 * builds of the site (e.g. `main` on :3001 and a redesign branch on :3000).
 *
 *   node scripts/seo-parity.mjs http://localhost:3001 http://localhost:3000 [--paths=/a,/b]
 *
 * For every path it compares: HTTP status, <html lang>, <title>, meta
 * description, canonical, robots, Open Graph + Twitter tags, the set of
 * JSON-LD @types (and their key fields), and the first <h1>. It also compares
 * the URL sets of /sitemap.xml and the item links of /feed.xml.
 * Exit code 1 when anything differs (unless listed in --allow).
 */

const [, , baseA, baseB, ...rest] = process.argv;
if (!baseA || !baseB) {
  console.error("usage: node scripts/seo-parity.mjs <baseA> <baseB> [--paths=/a,/b] [--allow=/path:field,...]");
  process.exit(2);
}
const opt = Object.fromEntries(rest.map((a) => a.replace(/^--/, "").split("=")));
const allow = new Set((opt.allow || "").split(",").filter(Boolean));

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return m ? decode(m[1]) : undefined;
}

function headTags(html) {
  const out = {};
  const head = html.split(/<\/head>/i)[0];
  out.lang = attr(html.match(/<html[^>]*>/i)?.[0] || "", "lang");
  out.title = decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  for (const tag of html.match(/<meta [^>]*>/gi) || []) {
    const key = attr(tag, "name") || attr(tag, "property");
    if (!key) continue;
    if (/^(description|robots|googlebot|og:|twitter:|article:)/i.test(key)) {
      const k = `meta:${key}`;
      out[k] = out[k] ? `${out[k]} | ${attr(tag, "content")}` : attr(tag, "content");
    }
  }
  for (const tag of head.match(/<link [^>]*>/gi) || []) {
    const rel = attr(tag, "rel");
    if (rel === "canonical" || rel === "alternate") out[`link:${rel}:${attr(tag, "type") || attr(tag, "hreflang") || ""}`] = attr(tag, "href");
  }
  const ld = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const j = JSON.parse(m[1]);
      for (const node of Array.isArray(j) ? j : j["@graph"] || [j]) {
        const t = node["@type"];
        const key = Array.isArray(t) ? t.join("+") : t;
        const summary = {
          headline: node.headline,
          name: node.name,
          url: node.url,
          datePublished: node.datePublished,
          dateModified: node.dateModified,
          author: node.author?.name,
          items: (node.itemListElement || node.mainEntity || []).length || undefined,
          target: node.potentialAction?.target?.urlTemplate || node.potentialAction?.target,
        };
        ld.push(`${key} ${JSON.stringify(summary)}`);
      }
    } catch {
      ld.push("INVALID_JSON");
    }
  }
  out.jsonld = ld.sort().join("\n");
  out.h1 = decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "").replace(/<[^>]+>/g, ""));
  out.h1count = String((html.match(/<h1[\s>]/gi) || []).length);
  return out;
}

async function get(base, path) {
  const res = await fetch(base + path, { redirect: "manual" });
  const body = await res.text();
  return { status: res.status, location: res.headers.get("location"), body };
}

async function samplePaths(base) {
  const sm = (await get(base, "/sitemap.xml")).body;
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const posts = urls.filter((u) => u.startsWith("/blog/") && !u.startsWith("/blog/category") && !u.startsWith("/blog/topics"));
  const pick = posts.filter((_, i) => i % Math.max(1, Math.floor(posts.length / 12)) === 0).slice(0, 12);
  return [
    "/",
    "/blog",
    "/blog/page/2",
    ...urls.filter((u) => u.startsWith("/blog/category/")),
    "/blog/category/personal-finance/page/2",
    ...urls.filter((u) => u.startsWith("/blog/topics/")),
    "/author/aditya-sen",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/disclaimer",
    "/this-page-does-not-exist",
    "/blog/no-such-post",
    ...pick,
  ];
}

const paths = opt.paths ? opt.paths.split(",") : await samplePaths(baseA);
let diffs = 0;
const rows = [];
for (const path of paths) {
  const [a, b] = await Promise.all([get(baseA, path), get(baseB, path)]);
  const ta = { status: String(a.status), location: a.location || "", ...headTags(a.body) };
  const tb = { status: String(b.status), location: b.location || "", ...headTags(b.body) };
  const keys = [...new Set([...Object.keys(ta), ...Object.keys(tb)])];
  const changed = keys.filter((k) => (ta[k] || "") !== (tb[k] || "") && !allow.has(`${path}:${k}`) && !allow.has(`*:${k}`));
  if (changed.length) {
    diffs += changed.length;
    console.log(`\n✗ ${path}`);
    for (const k of changed) console.log(`   ${k}\n     A: ${ta[k] ?? "(none)"}\n     B: ${tb[k] ?? "(none)"}`);
  }
  rows.push(`${changed.length ? "✗" : "✓"} ${path}`);
}

// Sitemap and feed URL sets.
async function urlSet(base, path, re) {
  return new Set([...(await get(base, path)).body.matchAll(re)].map((m) => m[1]));
}
for (const [path, re] of [
  ["/sitemap.xml", /<loc>([^<]+)<\/loc>/g],
  ["/feed.xml", /<link>([^<]+)<\/link>/g],
]) {
  const [sa, sb] = await Promise.all([urlSet(baseA, path, re), urlSet(baseB, path, re)]);
  const onlyA = [...sa].filter((u) => !sb.has(u));
  const onlyB = [...sb].filter((u) => !sa.has(u));
  const ok = onlyA.length === 0;
  rows.push(`${ok ? "✓" : "✗"} ${path} (${sa.size} vs ${sb.size} URLs${onlyB.length ? `; new in B: ${onlyB.join(", ")}` : ""})`);
  if (!ok) {
    diffs += onlyA.length;
    console.log(`\n✗ ${path}: missing in B:\n   ${onlyA.join("\n   ")}`);
  }
}

console.log(`\n${rows.join("\n")}\n\n${paths.length} pages compared, ${diffs} difference(s).`);
process.exit(diffs ? 1 : 0);
