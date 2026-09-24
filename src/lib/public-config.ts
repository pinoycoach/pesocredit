/**
 * What the page is told about the server's environment. The Resend key and the owner's inbox are
 * never part of this: the browser only learns whether the form is on.
 */
import { emailFormAllowed, PRIVACY_STATUS, PRIVACY_VERSION, type PrivacyState } from "./privacy-copy.ts";
import { readResendSettings } from "./subscribe.ts";

export type PublicConfig = {
  /** The full privacy page is live and final, and the Resend settings (RESEND_API_KEY, SUBSCRIBE_NOTIFY_TO, SUBSCRIBE_FROM) are usable. */
  emailCaptureEnabled: boolean;
  /** GUIDE_URL when it is a web address; the guide link is hidden when null. */
  guideUrl: string | null;
};

/** GUIDE_URL if it is an http(s) address. `javascript:` and the like are refused. */
export function normalizeGuideUrl(raw: string | undefined): string | null {
  const text = raw?.trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

/**
 * `devServer` is true under a Vite dev server. There, /api/subscribe exists only under
 * `netlify dev` (it is a Netlify function, not an app route), which sets NETLIFY_DEV. Under
 * plain `npm run dev` the form is hidden, so it can never show and then fail.
 *
 * The form asks the visitor to agree to the privacy page, so it waits until that page is
 * final (PRIVACY_STATUS; review N32, C107), and it exists only under the full page, which
 * describes it: never under v1 (PRIVACY_VERSION; N45). `privacy` exists for the tests.
 */
export function readPublicConfig(
  env: Record<string, string | undefined>,
  {
    devServer = false,
    privacy = { version: PRIVACY_VERSION, status: PRIVACY_STATUS },
  }: { devServer?: boolean; privacy?: PrivacyState } = {},
): PublicConfig {
  const endpointServed = !devServer || env.NETLIFY_DEV === "true";
  return {
    emailCaptureEnabled:
      emailFormAllowed(privacy) && endpointServed && readResendSettings(env) !== null,
    guideUrl: normalizeGuideUrl(env.GUIDE_URL),
  };
}
