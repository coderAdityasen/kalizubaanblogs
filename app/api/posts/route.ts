import { NextRequest, NextResponse } from "next/server";
import { createOrUpdatePost, getPosts, isSupabaseConfigured } from "@/lib/supabase";
import { CreatePostInput } from "@/types/blog";
import { validateAuth } from "@/lib/api-auth";
import { revalidateAfterWrite } from "@/lib/revalidate";
import { getPostSummaries } from "@/lib/post-summaries";

/**
 * GET /api/posts
 * Lists published blog posts, newest first. Optional ?category= and ?tag=.
 *
 * Returns post summaries (every field except the Markdown `content`) from the
 * shared 10-minute cache, so this public endpoint no longer pulls every
 * article body from Supabase on each call. Add ?include=content for the full
 * posts (one uncached database read).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const includeContent = (searchParams.get("include") || "").split(",").includes("content");

    let posts: Array<{ category: string; tags: string[] }> = includeContent ? await getPosts() : await getPostSummaries();

    if (category) {
      posts = posts.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (tag) {
      posts = posts.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: posts.length,
        storage: isSupabaseConfigured ? "supabase" : "local_memory",
        posts,
      },
      {
        headers: includeContent
          ? { "Cache-Control": "no-store" }
          : { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts", details: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * Secure endpoint to publish or update a blog post
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate with secret key
  const auth = validateAuth(req);
  if (!auth.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: auth.reason,
        help: "Include header 'Authorization: Bearer <YOUR_BLOG_API_SECRET>' or 'x-api-key: <YOUR_BLOG_API_SECRET>'",
      },
      { status: 401 }
    );
  }

  // 2. Parse JSON body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON",
        message: "Request body must be a valid JSON object.",
      },
      { status: 400 }
    );
  }

  const postInput = body as Partial<CreatePostInput>;

  // 3. Validate required fields
  if (!postInput.title || typeof postInput.title !== "string" || !postInput.title.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation Error",
        message: "Field 'title' is required and must be a non-empty string.",
      },
      { status: 400 }
    );
  }

  if (!postInput.content || typeof postInput.content !== "string" || !postInput.content.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation Error",
        message: "Field 'content' is required and must be a non-empty string (supports Markdown).",
      },
      { status: 400 }
    );
  }

  // 4. Create or update post in Supabase / store
  try {
    const { post, storage, warning } = await createOrUpdatePost({
      title: postInput.title,
      slug: postInput.slug,
      excerpt: postInput.excerpt,
      content: postInput.content,
      cover_image: postInput.cover_image,
      category: postInput.category,
      tags: postInput.tags,
      author_name: postInput.author_name,
      author_avatar: postInput.author_avatar,
      reading_time: postInput.reading_time,
      published: postInput.published,
    });

    // Refresh cached pages right away so the new/updated post shows up on the
    // article page, homepage, listings, sitemap and feed without waiting.
    revalidateAfterWrite(post.slug);

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const publicUrl = `${protocol}://${host}/blog/${post.slug}`;

    return NextResponse.json(
      {
        success: true,
        message: "Blog post published successfully!",
        post,
        url: publicUrl,
        slug: post.slug,
        storage,
        warning,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Database Error",
        message: "Failed to store blog post.",
        details: message,
      },
      { status: 500 }
    );
  }
}
