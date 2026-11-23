import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { BlogPostSummary } from "@/types/blog";
import { getPosts, isSupabaseConfigured } from "@/lib/supabase";
import { toSummaries } from "@/lib/blog-index";
import { deferToRequestDuringBuild, withTimeout } from "@/lib/build-safe";

/**
 * Every column that post cards, archives, the feed and "Keep reading" need:
 * everything except the Markdown `content` body.
 */
const SUMMARY_COLUMNS =
  "id,title,slug,excerpt,cover_image,category,tags,author_name,author_avatar,reading_time,published,created_at,updated_at";

/** Same window as the list pages' ISR (`revalidate = 600`). */
const LIST_CACHE_SECONDS = 600;

/** PostgREST code for "table not found": the posts table has not been created yet. */
const TABLE_MISSING = "PGRST205";

/**
 * supabase-js fetch that goes through the Next.js Data Cache. The published-post
 * list is the same for every page, so one response is reused by every ISR
 * regeneration and by every page of a build for up to LIST_CACHE_SECONDS,
 * instead of each page pulling it from Supabase again. revalidatePath() in the
 * posts API also clears it (Next tags fetches with the paths that used them),
 * so a newly published post still shows up straight away.
 */
const cachedFetch: typeof fetch = withTimeout((input, init) =>
  fetch(input, { ...init, next: { revalidate: LIST_CACHE_SECONDS, tags: ["posts"] } }));

function getListClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !isSupabaseConfigured) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: cachedFetch },
  });
}

/**
 * All published posts, newest first, without their Markdown bodies.
 *
 * Use this anywhere that only lists posts (cards, archives, related posts,
 * feed, static params). `getPosts()` selects `*`, so each call downloaded the
 * full text of every article (~2 MB for ~240 posts), and it ran once per page
 * render: on every hourly regeneration of every article and ~250 times per
 * build. That traffic counts against the Supabase egress quota.
 *
 * Throws if Supabase answers with an error, so an ISR regeneration fails and
 * Next keeps serving the last good page rather than caching an empty list.
 * During `next build` the page is deferred to request time instead, so a
 * Supabase outage can't fail the deployment (see lib/build-safe.ts).
 */
export const getPostSummaries = cache(async (): Promise<BlogPostSummary[]> => {
  const supabase = getListClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("posts")
      .select(SUMMARY_COLUMNS)
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (!error) return (data ?? []) as BlogPostSummary[];
    if (error.code !== TABLE_MISSING) {
      return deferToRequestDuringBuild(
        "post list",
        new Error(`Supabase read failed (post list): ${error.message}`)
      );
    }
  }
  // No Supabase configured, or the posts table is not created yet: sample posts
  return toSummaries(await getPosts());
});
