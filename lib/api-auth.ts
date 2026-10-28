import type { NextRequest } from "next/server";

/**
 * Validates request authorization using the blog's secret key. Shared by every
 * write endpoint (POST /api/posts, PATCH /api/posts/[slug]) so they all accept
 * exactly the same credentials.
 * Supports:
 * - Authorization: Bearer <BLOG_API_SECRET>
 * - x-api-key: <BLOG_API_SECRET>
 */
export function validateAuth(req: NextRequest): { authorized: boolean; reason?: string } {
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
