import { createFileRoute } from "@tanstack/react-router";
import { handleSubscribe } from "@/lib/subscribe";

/**
 * POST /api/subscribe: the email form posts here, never to the capture service directly,
 * so EMAIL_CAPTURE_URL stays on the server. All the rules live in lib/subscribe.ts. Every
 * method goes through the handler, so a GET is answered 405 (404 when the form is off)
 * instead of falling through to the site's pages.
 */
export const Route = createFileRoute("/api/subscribe")({
  server: {
    handlers: {
      ANY: ({ request }) =>
        handleSubscribe(request, { captureUrl: process.env.EMAIL_CAPTURE_URL }),
    },
  },
});
