/**
 * POST /api/subscribe on Netlify (host-specific: CLAUDE.md "Host-specific files").
 *
 * Nitro's netlify preset makes the whole app one function at path "/*", and Netlify applies a
 * code-based rate limit only through the config of the function that declares it. So the
 * email form's endpoint is a function of its own, with its own limit (DECISIONS N18, N35).
 * There is no /api/subscribe route in the app, so the whole-app function can never answer
 * it without this limit. Every rule lives in src/lib/subscribe.ts, which knows nothing
 * about the host; this file only connects it.
 */
import { handleSubscribe } from "../../src/lib/subscribe.ts";

export default (request: Request): Promise<Response> =>
  handleSubscribe(request, { captureUrl: process.env.EMAIL_CAPTURE_URL });

export const config = {
  path: "/api/subscribe",
  rateLimit: {
    // 5 requests per minute per IP (N35: raise it if real users behind shared carrier IPs
    // ever get 429s).
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
