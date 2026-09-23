/**
 * What the page is told about the server's environment. The capture URL itself is never
 * part of this: it may carry a secret, so the browser only learns whether the form is on.
 */
import { normalizeCaptureUrl } from "./subscribe.ts";

export type PublicConfig = {
  /** EMAIL_CAPTURE_URL is set to a usable address, so the form may be shown. */
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
 */
export function readPublicConfig(
  env: Record<string, string | undefined>,
  { devServer = false }: { devServer?: boolean } = {},
): PublicConfig {
  const endpointServed = !devServer || env.NETLIFY_DEV === "true";
  return {
    emailCaptureEnabled: endpointServed && normalizeCaptureUrl(env.EMAIL_CAPTURE_URL) !== null,
    guideUrl: normalizeGuideUrl(env.GUIDE_URL),
  };
}
