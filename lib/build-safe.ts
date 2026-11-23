import { connection } from "next/server";

/**
 * Keeps `next build` from failing when Supabase can't be read (quota exceeded,
 * outage, network), without ever baking demo posts, empty lists or 404s into
 * the deployment.
 *
 * Why: Supabase reads throw on error (see lib/supabase.ts `read`) so that an
 * ISR regeneration keeps the last good page instead of caching a broken one.
 * At build time there is no "last good page", so the same throw failed the
 * whole Vercel deployment (Supabase answered 402 exceed_egress_quota).
 */

/** True while `next build` is collecting page data / prerendering. */
export function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

const warned = new Set<string>();
function warnOnce(what: string, err: unknown) {
  if (warned.has(what)) return;
  warned.add(what);
  const detail = err instanceof Error ? err.message : String(err);
  console.warn(`[build] ${what}: Supabase unavailable (${detail}); deferring to request time.`);
}

/**
 * For generateStaticParams: if the post list can't be read at build time,
 * prerender no paths. With dynamicParams (the default) each page then renders
 * on its first request and is cached by ISR only if that render succeeds.
 */
export async function paramsOrNone<T>(what: string, load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load();
  } catch {
    if (!warned.has(what)) {
      warned.add(what);
      console.warn(`[build] ${what}: posts could not be read; prebuilding no pages, they render on first request.`);
    }
    return [];
  }
}

/**
 * Call from the catch of a failed Supabase read. During `next build` this opts
 * the current page or route handler out of static prerendering (it renders per
 * request in this deployment, like a dynamic route), so the build succeeds and
 * nothing fake is cached. Outside the build it rethrows, so ISR keeps serving
 * the last good page and retries later.
 */
export async function deferToRequestDuringBuild(what: string, err: unknown): Promise<never> {
  if (isProductionBuild()) {
    warnOnce(what, err);
    // Throws Next's internal dynamic-usage signal while prerendering.
    await connection();
  }
  throw err;
}

/**
 * Abort Supabase reads that hang, so a build or render never waits forever.
 * supabase-js retries a timed-out fetch up to 3 times (1 s, 2 s, 4 s backoff),
 * so the worst case is about 4 x 8 s + 7 s = 39 s, under Next's 60 s
 * per-page build limit.
 */
export const SUPABASE_READ_TIMEOUT_MS = 8_000;

export function withTimeout(fetchImpl: typeof fetch = fetch): typeof fetch {
  return (input, init) => {
    const timeout = AbortSignal.timeout(SUPABASE_READ_TIMEOUT_MS);
    const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
    return fetchImpl(input, { ...init, signal });
  };
}
