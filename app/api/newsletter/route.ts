import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, subscribe } from "@/lib/newsletter";

/**
 * POST /api/newsletter  { email, source?, company? }
 * `company` is a hidden honeypot field: bots fill it, people don't.
 * Returns 503 with a plain message while no email service is connected.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, message: "Send JSON: { \"email\": \"you@example.com\" }." }, { status: 400 });
  }

  if (typeof body.company === "string" && body.company.trim() !== "") {
    // Honeypot tripped: answer like a normal request but do nothing.
    return NextResponse.json({ ok: false, message: "Please try again." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
  }

  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "site";
  const result = await subscribe(email, source);
  return NextResponse.json(
    { ok: result.ok, message: result.message, connected: result.ok || result.status !== 503 },
    { status: result.ok ? 200 : result.status, headers: { "Cache-Control": "no-store" } }
  );
}
