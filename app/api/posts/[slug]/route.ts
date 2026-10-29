import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  EDITABLE_POST_FIELDS,
  getPostBySlug,
  updatePost,
  type UpdatePostInput,
} from "@/lib/supabase";
import { validateAuth } from "@/lib/api-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to fetch post", details: message },
      { status: 500 }
    );
  }
}

function badRequest(message: string) {
  return NextResponse.json(
    { success: false, error: "Validation Error", message },
    { status: 400 }
  );
}

/**
 * PATCH /api/posts/[slug-or-id]
 *
 * Edit an existing post in place. Same auth as POST /api/posts
 * (Authorization: Bearer <BLOG_API_SECRET> or x-api-key). Send only the fields
 * to change; allowed: title, content, excerpt, tags, cover_image, category.
 * The slug, author and created_at never change, so the URL stays the same.
 * updated_at is set to now (shown as "Last updated" and used as dateModified).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = validateAuth(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", message: auth.reason },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be a valid JSON object.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest("Request body must be a JSON object.");
  }

  const input = body as Record<string, unknown>;
  const unknownFields = Object.keys(input).filter(
    (key) => !(EDITABLE_POST_FIELDS as readonly string[]).includes(key)
  );
  if (unknownFields.length > 0) {
    return badRequest(
      `These fields cannot be changed with PATCH: ${unknownFields.join(", ")}. Allowed: ${EDITABLE_POST_FIELDS.join(", ")}.`
    );
  }

  const changes: UpdatePostInput = {};
  for (const field of ["title", "content", "category"] as const) {
    if (field in input) {
      const value = input[field];
      if (typeof value !== "string" || !value.trim()) {
        return badRequest(`Field '${field}' must be a non-empty string.`);
      }
      changes[field] = field === "content" ? value : value.trim();
    }
  }
  for (const field of ["excerpt", "cover_image"] as const) {
    if (field in input) {
      const value = input[field];
      if (typeof value !== "string") {
        return badRequest(`Field '${field}' must be a string.`);
      }
      changes[field] = value.trim();
    }
  }
  if ("tags" in input) {
    const tags = input.tags;
    if (!Array.isArray(tags) || tags.some((t) => typeof t !== "string" || !t.trim())) {
      return badRequest("Field 'tags' must be an array of non-empty strings.");
    }
    changes.tags = tags.map((t: string) => t.trim());
  }
  if (Object.keys(changes).length === 0) {
    return badRequest(`Send at least one field to change: ${EDITABLE_POST_FIELDS.join(", ")}.`);
  }

  try {
    const { slug: slugOrId } = await params;
    const result = await updatePost(slugOrId, changes);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Post not found", message: `No post with slug or id '${slugOrId}'.` },
        { status: 404 }
      );
    }
    const { post, storage } = result;

    // Refresh the article and every listing it appears on ("/blog" as a layout
    // also covers /blog/category/* and /blog/topics/*, including an old category).
    try {
      revalidatePath(`/blog/${post.slug}`);
      revalidatePath("/");
      revalidatePath("/blog", "layout");
      revalidatePath("/sitemap.xml");
      revalidatePath("/feed.xml");
    } catch (revalidateError) {
      console.error("Failed to revalidate cached pages after edit", revalidateError);
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    return NextResponse.json({
      success: true,
      message: "Blog post updated.",
      updated_fields: Object.keys(changes),
      post,
      url: `${protocol}://${host}/blog/${post.slug}`,
      slug: post.slug,
      storage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Database Error", message: "Failed to update blog post.", details: message },
      { status: 500 }
    );
  }
}
