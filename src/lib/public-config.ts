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

export function readPublicConfig(env: Record<string, string | undefined>): PublicConfig {
  return {
    emailCaptureEnabled: normalizeCaptureUrl(env.EMAIL_CAPTURE_URL) !== null,
    guideUrl: normalizeGuideUrl(env.GUIDE_URL),
  };
}
