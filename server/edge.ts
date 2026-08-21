// =============================================================================
// FILE: server/edge.ts
// PURPOSE: Shared request-handling helpers for the Cloudflare Pages Functions in
//          functions/. Every public endpoint needs the same three things —
//          a same-origin check, an IP rate limit, and a JSON response helper —
//          and they must behave identically across endpoints or the weakest one
//          becomes the way in.
//
// WHY THIS LIVES OUTSIDE functions/:
//          Every module inside functions/ is mapped to a public URL by Pages.
//          Shared code therefore has to sit outside that tree or it would be
//          served as its own route.
// =============================================================================

// -----------------------------------------------------------------------------
// Minimal shape of the KV binding we rely on, declared locally so the Functions
// build does not need the full @cloudflare/workers-types package.
// -----------------------------------------------------------------------------
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// -----------------------------------------------------------------------------
// Same-origin check. Compares the Referer/Origin host against the host actually
// serving the request, so this works unchanged on localhost, *.pages.dev preview
// URLs, and the production domain without a hardcoded allowlist.
//
// This is a cheap filter against drive-by use of our endpoints from other sites,
// not an authentication mechanism: both headers are client-supplied and a
// non-browser client can set them freely. The rate limiter is what actually
// bounds abuse.
// -----------------------------------------------------------------------------
export function isSameOrigin(request: Request): boolean {
  const selfHost = new URL(request.url).host;
  const candidate = request.headers.get("Origin") ?? request.headers.get("Referer");

  if (!candidate) return false;

  try {
    return new URL(candidate).host === selfHost;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// Collapses a client address to the unit we want to rate limit.
//
// IPv4 is used as-is. IPv6 is truncated to its /64 prefix, because a single
// client is routinely allocated a whole /64 (or larger). Keying on the full
// address would let anyone increment one hextet to mint a fresh quota, making
// the limit meaningless — the logs confirmed Cloudflare hands us full IPv6
// addresses, e.g. 2603:8082:af00:3cf:d918:e843:7b7d:9001.
//
// Consequence, and it is intended: everyone behind one /64 (typically one
// household) shares a single quota.
// -----------------------------------------------------------------------------
export function rateLimitKey(ip: string): string {
  if (!ip.includes(":")) return ip; // IPv4, or the "unknown" fallback.

  // IPv4-mapped IPv6 (::ffff:203.0.113.5) — limit on the embedded IPv4.
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return mapped[1];

  // Expand "::" so the prefix is taken from the true hextet positions.
  let groups: string[];
  if (ip.includes("::")) {
    const [head, tail] = ip.split("::");
    const headParts = head ? head.split(":") : [];
    const tailParts = tail ? tail.split(":") : [];
    const gap = Math.max(0, 8 - headParts.length - tailParts.length);
    groups = [...headParts, ...Array(gap).fill("0"), ...tailParts];
  } else {
    groups = ip.split(":");
  }

  return groups
    .slice(0, 4)
    .map((h) => (h || "0").toLowerCase())
    .join(":");
}

// -----------------------------------------------------------------------------
// KV-backed sliding-window IP rate limiter.
//
// WHY KV AND NOT MODULE STATE: an in-memory Map only lives as long as one V8
// isolate. Locally that is a single long-lived isolate so a Map appears to work,
// but on the real edge requests are spread across isolates that are constantly
// created and recycled, so counts never accumulate and the limit never trips.
// This was measured: 22 consecutive edge requests produced zero 429s, where the
// same test locally tripped on request 21 exactly. KV is shared across isolates.
//
// KV is eventually consistent, on the order of seconds. Against windows measured
// in minutes that is comfortably accurate enough for abuse control.
//
// FAILURE MODE: fails OPEN. If KV is unavailable the site keeps working rather
// than going dark, and a Cloudflare WAF rate-limiting rule on these routes is
// the backstop that protects spend. A KV blip should not break the site.
//
// `bucket` namespaces the counters so each endpoint gets its own quota — the
// assistant allows far more requests than the contact form should, and sharing
// one key would let chat traffic exhaust the form's allowance.
// -----------------------------------------------------------------------------
// `record` controls whether a permitted request also consumes quota.
//
// It defaults to true, which is right when every request costs something no
// matter the outcome — the assistant pays for an LLM call whatever the visitor
// typed. It must be false where the expensive action happens later and might not
// happen at all: counting a rejected contact-form submission meant someone who
// mistyped their email address five times was locked out for an hour, having
// never successfully sent anything. Callers that pass false are responsible for
// calling recordRateLimitHit() once the costly action actually succeeds.
export async function isRateLimited(
  ip: string,
  store: KVNamespace | undefined,
  options: { bucket: string; max: number; windowMs: number; record?: boolean },
): Promise<boolean> {
  // No binding configured (e.g. local dev without --kv): skip, do not block.
  if (!store) return false;

  const key = `rl:${options.bucket}:${rateLimitKey(ip)}`;
  const now = Date.now();

  try {
    const timestamps = await readWindow(store, key, now - options.windowMs);

    if (timestamps.length >= options.max) return true;

    if (options.record ?? true) {
      await writeWindow(store, key, [...timestamps, now], options.windowMs);
    }

    return false;
  } catch (err) {
    console.error("Rate limiter KV error, failing open:", err);
    return false;
  }
}

// Consumes one unit of quota. Used after a costly action has succeeded, paired
// with an isRateLimited({ record: false }) check earlier in the request.
export async function recordRateLimitHit(
  ip: string,
  store: KVNamespace | undefined,
  options: { bucket: string; windowMs: number },
): Promise<void> {
  if (!store) return;

  const key = `rl:${options.bucket}:${rateLimitKey(ip)}`;
  const now = Date.now();

  try {
    const timestamps = await readWindow(store, key, now - options.windowMs);
    await writeWindow(store, key, [...timestamps, now], options.windowMs);
  } catch (err) {
    // Failing to record is a lost count, not a reason to fail the request the
    // visitor already completed successfully.
    console.error("Rate limiter KV write error, ignoring:", err);
  }
}

// Reads the stored timestamps, discarding anything outside the window. Stored as
// a JSON array of epoch-ms values.
async function readWindow(
  store: KVNamespace,
  key: string,
  cutoff: number,
): Promise<number[]> {
  const raw = await store.get(key);
  const parsed: unknown = raw ? JSON.parse(raw) : [];

  return Array.isArray(parsed)
    ? parsed.filter((t): t is number => typeof t === "number" && t > cutoff)
    : [];
}

// expirationTtl lets KV evict the key once the window has fully elapsed, so the
// namespace self-cleans and needs no sweeping.
function writeWindow(
  store: KVNamespace,
  key: string,
  timestamps: number[],
  windowMs: number,
): Promise<void> {
  return store.put(key, JSON.stringify(timestamps), {
    expirationTtl: Math.ceil(windowMs / 1000),
  });
}

// Cloudflare sets CF-Connecting-IP on the edge and it cannot be spoofed by the
// client, so it is safe to key the limiter on.
export function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}
