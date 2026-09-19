/**
 * The browser's side of the optional email form. It imports nothing on purpose: it has no
 * way to reach the calculator's numbers, and its only input is the email address the
 * borrower typed. The body it builds is exactly what the server's strict parser accepts
 * (see subscribe.ts): { email, consent: true }.
 */

export const SUBSCRIBE_PATH = "/api/subscribe";

export type SubmitResult = "ok" | "failed";

/** Sent only after the consent box is ticked, so consent is always literally true. */
export function buildSubscribeBody(email: string): { email: string; consent: true } {
  return { email: email.trim(), consent: true };
}

/** Post the address to this site's own endpoint. Never throws; the answer is ok or failed. */
export async function submitEmail(email: string, send: typeof fetch = fetch): Promise<SubmitResult> {
  try {
    const response = await send(SUBSCRIBE_PATH, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildSubscribeBody(email)),
    });
    return response.ok ? "ok" : "failed";
  } catch {
    return "failed";
  }
}
