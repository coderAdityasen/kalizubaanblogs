import { timingSafeEqual, createHash } from "crypto";
import type { NextRequest } from "next/server";

/** Secret used only by `next dev` when BLOG_API_SECRET isn't set. Never accepted in production. */
const DEV_FALLBACK_SECRET = "demo-secret-key-12345";

function expectedSecret(): string | null {
  const secret = process.env.BLOG_API_SECRET?.trim();
  if (secret) return secret;
  return process.env.NODE_ENV === "production" ? null : DEV_FALLBACK_SECRET;
}

/** Constant-time string comparison (hashing first makes the lengths equal). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Validates request authorization using the blog's secret key. Shared by every
 * write endpoint (POST /api/posts, PATCH /api/posts/[slug], POST /api/upload)
 * so they all accept exactly the same credentials:
 * - Authorization: Bearer <BLOG_API_SECRET>
 * - x-api-key: <BLOG_API_SECRET>
 * Messages are unchanged from the original API so existing clients see the
 * same responses. In production, a missing BLOG_API_SECRET rejects every
 * request instead of falling back to a guessable default.
 */
export function validateAuth(req: NextRequest): { authorized: boolean; reason?: string } {
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

  const expected = expectedSecret();
  if (!expected || !safeEqual(providedSecret, expected)) {
    return {
      authorized: false,
      reason: "Invalid API secret key. Please check your BLOG_API_SECRET.",
    };
  }

  return { authorized: true };
}
