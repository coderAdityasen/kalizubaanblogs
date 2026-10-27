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
  // eslint-disable-next-line no-var
  var __mockPostsStore: BlogPost[] | undefined;
}

function getLocalStore(): BlogPost[] {
  if (!globalThis.__mockPostsStore) {
    globalThis.__mockPostsStore = [...SAMPLE_POSTS];
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

/**
 * Fetch all published posts
 */
export async function getPosts(): Promise<BlogPost[]> {
  const supabase = getPublicSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          return data as BlogPost[];
        }
        // If table exists but has 0 posts, return empty array
        return [];
      }
    } catch {
      // Quiet fallback to sample posts
    }
  }

  // Fallback to local memory store
  const posts = getLocalStore();
  return posts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = getPublicSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return data as BlogPost;
      }
    } catch {
      // Quiet fallback
    }
  }

  // Fallback to local memory store
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
