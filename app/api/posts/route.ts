import { NextRequest, NextResponse } from "next/server";
import { createOrUpdatePost, getPosts, isSupabaseConfigured } from "@/lib/supabase";
import { CreatePostInput } from "@/types/blog";

/**
 * Validates request authorization using secret key.
 * Supports:
 * - Authorization: Bearer <BLOG_API_SECRET>
 * - x-api-key: <BLOG_API_SECRET>
 */
function validateAuth(req: NextRequest): { authorized: boolean; reason?: string } {
  const expectedSecret = process.env.BLOG_API_SECRET || "demo-secret-key-12345";

  const authHeader = req.headers.get("authorization");
  const apiKeyHeader = req.headers.get("x-api-key");

  let providedSecret: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    providedSecret = authHeader.substring(7).trim();
  } else if (apiKeyHeader) {
    providedSecret = apiKeyHeader.trim();
  }

  if (!providedSecret) {
    return {
      authorized: false,
      reason: "Missing authentication. Provide 'Authorization: Bearer <secret>' or 'x-api-key: <secret>' header.",
    };
  }

  if (providedSecret !== expectedSecret) {
    return {
      authorized: false,
      reason: "Invalid API secret key. Please check your BLOG_API_SECRET.",
    };
  }

  return { authorized: true };
}

/**
 * GET /api/posts
 * Lists published blog posts
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");

    let posts = await getPosts();

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

    return NextResponse.json({
      success: true,
      count: posts.length,
      storage: isSupabaseConfigured ? "supabase" : "local_memory",
      posts,
    });
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
