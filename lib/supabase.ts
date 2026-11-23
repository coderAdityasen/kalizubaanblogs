import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { BlogPost, CreatePostInput } from "@/types/blog";
import { SAMPLE_POSTS } from "./sample-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  !supabaseUrl.includes("your-project") &&
  supabaseUrl.startsWith("https://") &&
  ((supabaseAnonKey && !supabaseAnonKey.includes("your-anon")) ||
   (supabaseServiceKey && !supabaseServiceKey.includes("your-service")))
);

// In-memory store fallback when Supabase table is not yet created
declare global {
  var __mockPostsStore: BlogPost[] | undefined;
}

/**
 * Local development only: with no Supabase configured, LOCAL_POSTS_FIXTURE can
 * point at a JSON array of posts to preview the site with realistic content.
 * Ignored whenever Supabase is configured (production).
 */
function loadLocalFixture(): BlogPost[] | null {
  const file = process.env.LOCAL_POSTS_FIXTURE;
  if (!file || isSupabaseConfigured) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    return JSON.parse(fs.readFileSync(file, "utf8")) as BlogPost[];
  } catch (err) {
    console.warn("LOCAL_POSTS_FIXTURE could not be read:", err);
    return null;
  }
}

function getLocalStore(): BlogPost[] {
  if (!globalThis.__mockPostsStore) {
    globalThis.__mockPostsStore = loadLocalFixture() ?? [...SAMPLE_POSTS];
  }
  return globalThis.__mockPostsStore;
}

export function getPublicSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey || !isSupabaseConfigured) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function getAdminSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !isSupabaseConfigured) {
    return null;
  }
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Check if the Supabase database and `posts` table are ready
 */
export async function checkSupabaseStatus(): Promise<{
  connected: boolean;
  tableExists: boolean;
  message?: string;
}> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    return { connected: false, tableExists: false, message: "Supabase credentials not configured." };
  }

  try {
    const { error } = await supabase.from("posts").select("id").limit(1);
    if (!error) {
      return { connected: true, tableExists: true };
    }
    if (error.code === "PGRST205") {
      return {
        connected: true,
        tableExists: false,
        message: "Supabase connected, but 'posts' table is not created yet.",
      };
    }
    return { connected: false, tableExists: false, message: error.message };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { connected: false, tableExists: false, message: msg };
  }
}

/** PostgREST code for "table not found": the posts table has not been created yet (first-time setup). */
const TABLE_MISSING = "PGRST205";

class SupabaseReadError extends Error {
  constructor(what: string, cause: unknown) {
    const detail =
      cause && typeof cause === "object" && "message" in cause
        ? String((cause as { message: unknown }).message)
        : String(cause);
    super(`Supabase read failed (${what}): ${detail}`);
    this.name = "SupabaseReadError";
  }
}

type ReadResult<T> = { data: T | null; error: { code?: string; message: string } | null };

/**
 * Run a Supabase read. Returns `undefined` when the posts table does not exist
 * yet (so local setup can fall back to sample posts) and throws on any other
 * error. supabase-js already retries network failures and 503/520 answers with
 * backoff before an error gets here.
 *
 * Throwing matters in production: these reads run inside ISR regeneration, and
 * Next.js keeps serving the last good page when a regeneration throws (then
 * retries on the next request). Swallowing the error and returning sample posts
 * or null instead turned a slow or failing database call into a cached 404 for
 * a real article, and demo posts in the RSS feed, until the next revalidation.
 */
async function read<T>(what: string, run: () => PromiseLike<ReadResult<T>>): Promise<T | null | undefined> {
  let result: ReadResult<T>;
  try {
    result = await run();
  } catch (err: unknown) {
    throw new SupabaseReadError(what, err);
  }
  if (!result.error) return result.data;
  if (result.error.code === TABLE_MISSING) return undefined;
  throw new SupabaseReadError(what, result.error);
}

/**
 * Fetch all published posts
 */
export async function getPosts(): Promise<BlogPost[]> {
  const supabase = getPublicSupabaseClient();

  if (supabase) {
    const data = await read<BlogPost[]>("published posts", () =>
      supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
    );
    if (data !== undefined) return data ?? [];
  }

  // No Supabase configured, or the posts table is not created yet: sample posts
  const posts = getLocalStore();
  return posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Fetch a single post by slug. Returns null only when no such post exists;
 * throws if the database cannot be read (see read).
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = getPublicSupabaseClient();

  if (supabase) {
    const data = await read<BlogPost>(`post "${slug}"`, () =>
      supabase.from("posts").select("*").eq("slug", slug).maybeSingle()
    );
    if (data !== undefined) return data;
  }

  // No Supabase configured, or the posts table is not created yet: sample posts
  const posts = getLocalStore();
  return posts.find((p) => p.slug === slug) || null;
}

/**
 * Helper to generate URL slug from title
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Helper to calculate estimated reading time in minutes
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Insert or upsert a post into Supabase or local store
 */
export async function createOrUpdatePost(input: CreatePostInput): Promise<{
  post: BlogPost;
  storage: "supabase" | "local_memory";
  warning?: string;
}> {
  const title = input.title.trim();
  const slug = input.slug?.trim() || slugify(title);
  const reading_time = input.reading_time || calculateReadingTime(input.content);
  const now = new Date().toISOString();

  const newPostData = {
    title,
    slug,
    excerpt: input.excerpt || input.content.slice(0, 160).replace(/[#*`_]/g, "").trim() + "...",
    content: input.content,
    cover_image: input.cover_image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    category: input.category || "General",
    tags: Array.isArray(input.tags) ? input.tags : ["General"],
    author_name: input.author_name || "Admin",
    // No stock-photo default: a byline without a real photo shows initials.
    author_avatar: input.author_avatar || undefined,
    reading_time,
    published: input.published ?? true,
    updated_at: now,
  };

  const adminSupabase = getAdminSupabaseClient();

  if (adminSupabase) {
    try {
      // Check if post with slug exists
      const { data: existing } = await adminSupabase
        .from("posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        const { data, error } = await adminSupabase
          .from("posts")
          .update(newPostData)
          .eq("slug", slug)
          .select()
          .single();

        if (error) throw error;
        return { post: data as BlogPost, storage: "supabase" };
      } else {
        const { data, error } = await adminSupabase
          .from("posts")
          .insert([{ ...newPostData, created_at: now }])
          .select()
          .single();

        if (error) throw error;
        return { post: data as BlogPost, storage: "supabase" };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn("Supabase insert warning:", errorMsg);

      // If table doesn't exist, provide warning
      let warningText = "Stored in local memory fallback.";
      if (errorMsg.includes("public.posts") || errorMsg.includes("schema cache")) {
        warningText = "Table 'posts' not created in Supabase yet. Please run schema.sql in Supabase SQL Editor.";
      }

      const posts = getLocalStore();
      const existingIdx = posts.findIndex((p) => p.slug === slug);
      if (existingIdx >= 0) {
        posts[existingIdx] = { ...posts[existingIdx], ...newPostData, updated_at: now };
        return { post: posts[existingIdx], storage: "local_memory", warning: warningText };
      } else {
        const created: BlogPost = { id: "post-" + Date.now(), created_at: now, ...newPostData };
        posts.unshift(created);
        return { post: created, storage: "local_memory", warning: warningText };
      }
    }
  }

  // Local memory store fallback
  const posts = getLocalStore();
  const existingIdx = posts.findIndex((p) => p.slug === slug);
  if (existingIdx >= 0) {
    posts[existingIdx] = { ...posts[existingIdx], ...newPostData, updated_at: now };
    return { post: posts[existingIdx], storage: "local_memory" };
  } else {
    const created: BlogPost = { id: "post-" + Date.now(), created_at: now, ...newPostData };
    posts.unshift(created);
    return { post: created, storage: "local_memory" };
  }
}

/** Fields PATCH /api/posts/[slug] may change. Everything else (slug, author, dates) is left alone. */
export const EDITABLE_POST_FIELDS = ["title", "content", "excerpt", "tags", "cover_image", "category"] as const;
export type EditablePostField = (typeof EDITABLE_POST_FIELDS)[number];
export type UpdatePostInput = Partial<Pick<BlogPost, EditablePostField>>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Partially update an existing post, found by slug or by id (uuid).
 * Only the fields in `changes` are written; updated_at is always set to now and
 * reading_time is recalculated when the content changes. Returns null when no
 * post matches. Never creates a post.
 */
export async function updatePost(
  slugOrId: string,
  changes: UpdatePostInput
): Promise<{ post: BlogPost; storage: "supabase" | "local_memory" } | null> {
  const now = new Date().toISOString();
  const patch: Partial<BlogPost> = { ...changes, updated_at: now };
  if (typeof changes.content === "string") {
    patch.reading_time = calculateReadingTime(changes.content);
  }

  const adminSupabase = getAdminSupabaseClient();
  if (adminSupabase) {
    const column = UUID_RE.test(slugOrId) ? "id" : "slug";
    const { data: existing, error: findError } = await adminSupabase
      .from("posts")
      .select("id")
      .eq(column, slugOrId)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) return null;

    const { data, error } = await adminSupabase
      .from("posts")
      .update(patch)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return { post: data as BlogPost, storage: "supabase" };
  }

  // Local memory store (dev without Supabase)
  const posts = getLocalStore();
  const idx = posts.findIndex((p) => p.slug === slugOrId || p.id === slugOrId);
  if (idx < 0) return null;
  posts[idx] = { ...posts[idx], ...patch };
  return { post: posts[idx], storage: "local_memory" };
}
