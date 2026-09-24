/**
 * The email form's server side. Framework-free so tests can call it with plain Request
 * objects.
 *
 * CLAUDE.md principle 4: email is optional, separate, and never sent together with loan
 * numbers. The strongest place to enforce that is here: the browser may send exactly
 * { email, consent: true } and nothing else, so a stray field (a loan number, say) is
 * refused, not forwarded. Only the address and the consent time, stamped by this server,
 * go on: in one email to the owner's inbox, sent through Resend (DECISIONS N13).
 *
 * The Resend key has Sending access only, restricted to the peso.credit domain: it can
 * send that one email and nothing else (point 15). Contacts are added to the Resend list
 * by hand, with a separate Full-access key that never enters this code.
 *
 * Nothing about a request (the email, the body, the address) is logged.
 *
 * The endpoint exists only when the email form may: under the full privacy page, once final
 * (privacy-copy.ts emailFormAllowed; N45). Hiding the form is not enough, since anyone can post.
 */
import { emailFormAllowed, type PrivacyState } from "./privacy-copy.ts";

export const MAX_BODY_BYTES = 2_048;
export const FORWARD_TIMEOUT_MS = 8_000;
const MAX_EMAIL_LENGTH = 254;

/** Resend's send-email endpoint: the one web address this server contacts. */
export const RESEND_EMAILS_URL = "https://api.resend.com/emails";
export const NOTIFY_SUBJECT = "New peso.credit subscriber";

/** The environment variables that switch the email form on. All three, or it is off. */
export type SubscribeEnv = {
  /** A Resend Sending-access key, restricted to the peso.credit domain. Secret. */
  RESEND_API_KEY?: string;
  /** The owner's inbox, where each new subscriber's address is sent. */
  SUBSCRIBE_NOTIFY_TO?: string;
  /** The sender, on the verified domain: "peso.credit <subscribe@peso.credit>" or an address. */
  SUBSCRIBE_FROM?: string;
};

export type ResendSettings = { apiKey: string; notifyTo: string; from: string };

export type SubscribeDeps = {
  /** The environment (process.env in production). */
  env: SubscribeEnv;
  /** For tests. Defaults to the global fetch. */
  fetchImpl?: typeof fetch;
  /** For tests. Defaults to the current time. */
  now?: () => Date;
  /** For tests. Defaults to the live privacy page (PRIVACY_VERSION, PRIVACY_STATUS). */
  privacy?: PrivacyState;
};

/** "Name <address>" or a bare address, with a valid address and no line breaks. */
function isValidSender(value: string): boolean {
  if (hasControl(value)) return false;
  const named = /^([^<>@]+?)\s*<([^<>]+)>$/.exec(value);
  if (named) return isValidEmail(named[2]);
  return !/[<>]/.test(value) && isValidEmail(value);
}

/**
 * The Resend settings if all three are usable; null otherwise, which switches the form off.
 * A key must look like a Resend key ("re_…", no spaces), so a stray value is not sent.
 */
export function readResendSettings(env: SubscribeEnv): ResendSettings | null {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const notifyTo = env.SUBSCRIBE_NOTIFY_TO?.trim() ?? "";
  const from = env.SUBSCRIBE_FROM?.trim() ?? "";
  if (!/^re_\S+$/.test(apiKey)) return null;
  if (!isValidEmail(notifyTo) || !isValidSender(from)) return null;
  return { apiKey, notifyTo, from };
}

/** The one email sent per subscriber: to the owner, carrying only the address and the time. */
export function notifyEmail(settings: ResendSettings, email: string, consentedAt: string) {
  return {
    from: settings.from,
    to: [settings.notifyTo],
    subject: NOTIFY_SUBJECT,
    text: `Email: ${email}\nConsented at: ${consentedAt}\n`,
  };
}

/** Whitespace and control characters never belong in an address. */
function hasWhitespaceOrControl(value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code <= 0x1f || code === 0x7f || /\s/.test(character)) return true;
  }
  return false;
}

/** Control characters (line breaks included) never belong in a header value. */
function hasControl(value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code <= 0x1f || code === 0x7f) return true;
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
  const settings = readResendSettings(deps.env);
  if (!settings || !emailFormAllowed(deps.privacy)) return reply(404, { ok: false, error: "unavailable" });
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
    const response = await send(RESEND_EMAILS_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${settings.apiKey}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(notifyEmail(settings, parsed.email, now().toISOString())),
      redirect: "error",
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    return response.ok ? reply(200, { ok: true }) : reply(502, { ok: false, error: "unavailable" });
  } catch {
    return reply(502, { ok: false, error: "unavailable" });
  }
}
