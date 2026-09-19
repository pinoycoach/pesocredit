/**
 * The email form's server side. Framework-free so tests can call it with plain Request
 * objects.
 *
 * CLAUDE.md principle 4: email is optional, separate, and never sent together with loan
 * numbers. The strongest place to enforce that is here: the browser may send exactly
 * { email, consent: true } and nothing else, so a stray field (a loan number, say) is
 * refused, not forwarded. Only { email, consentedAt } goes on to the capture service,
 * with the time stamped by this server.
 *
 * Nothing about a request (the email, the body, the address) is logged.
 */

export const MAX_BODY_BYTES = 2_048;
export const FORWARD_TIMEOUT_MS = 8_000;
const MAX_EMAIL_LENGTH = 254;

export type SubscribeDeps = {
  /** EMAIL_CAPTURE_URL as set in the environment (may be missing or unusable). */
  captureUrl: string | undefined;
  /** For tests. Defaults to the global fetch. */
  fetchImpl?: typeof fetch;
  /** For tests. Defaults to the current time. */
  now?: () => Date;
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * The capture URL if it is safe to send email to: https, or http only for this machine.
 * Anything else (unset, empty, garbage, plain http to the internet) is treated as unset.
 */
export function normalizeCaptureUrl(raw: string | undefined): string | null {
  const text = raw?.trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol === "https:") return url.href;
    if (url.protocol === "http:" && LOCAL_HOSTS.has(url.hostname)) return url.href;
    return null;
  } catch {
    return null;
  }
}

/** Whitespace and control characters never belong in an address. */
function hasWhitespaceOrControl(value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code <= 0x1f || code === 0x7f || /\s/.test(character)) return true;
  }
  return false;
}

export function isValidEmail(value: string): boolean {
  if (value.length < 3 || value.length > MAX_EMAIL_LENGTH) return false;
  if (hasWhitespaceOrControl(value) || value.includes("..")) return false;
  return /^[^@]+@[^@.][^@]*\.[^@.]+$/.test(value);
}

export type ParsedBody = { ok: true; email: string } | { ok: false };

/** Exactly { email: string, consent: true }; anything else is refused. */
export function parseSubscribeBody(value: unknown): ParsedBody {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return { ok: false };
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return { ok: false };

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (keys.length !== 2 || keys[0] !== "consent" || keys[1] !== "email") return { ok: false };
  if (record.consent !== true) return { ok: false };
  if (typeof record.email !== "string") return { ok: false };

  const email = record.email.trim();
  return isValidEmail(email) ? { ok: true, email } : { ok: false };
}

function reply(status: number, body: { ok: boolean; error?: string }): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/** Only our own pages may post here. Browsers always send one of these two headers. */
function isSameOrigin(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site !== null) return site === "same-origin";
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

export async function handleSubscribe(request: Request, deps: SubscribeDeps): Promise<Response> {
  const captureUrl = normalizeCaptureUrl(deps.captureUrl);
  if (!captureUrl) return reply(404, { ok: false, error: "unavailable" });
  if (request.method !== "POST") return reply(405, { ok: false, error: "method" });
  if (!isSameOrigin(request)) return reply(403, { ok: false, error: "forbidden" });
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return reply(415, { ok: false, error: "type" });
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return reply(413, { ok: false, error: "size" });
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return reply(413, { ok: false, error: "size" });
  }

  let parsed: ParsedBody;
  try {
    parsed = parseSubscribeBody(JSON.parse(text));
  } catch {
    return reply(400, { ok: false, error: "invalid" });
  }
  if (!parsed.ok) return reply(400, { ok: false, error: "invalid" });

  const now = deps.now ?? (() => new Date());
  const send = deps.fetchImpl ?? fetch;
  try {
    const response = await send(captureUrl, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ email: parsed.email, consentedAt: now().toISOString() }),
      redirect: "error",
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    return response.ok ? reply(200, { ok: true }) : reply(502, { ok: false, error: "unavailable" });
  } catch {
    return reply(502, { ok: false, error: "unavailable" });
  }
}
