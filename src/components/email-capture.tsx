import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
import { PRIVACY_LINK_LABEL } from "@/lib/privacy-copy";
import { submitEmail } from "@/lib/subscribe-client";

type Status = "idle" | "sending" | "done" | "failed";

/**
 * The optional email form. It takes no props and imports nothing from the calculator: it
 * cannot see the loan numbers, so they cannot be sent with the email (CLAUDE.md
 * principle 4; email-capture.test.ts checks this). It only exists below the result.
 */
export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  // Until the page is interactive a native submit could not be intercepted; keep it off.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!consent || status === "sending") return;
    setStatus("sending");
    setStatus((await submitEmail(email)) === "ok" ? "done" : "failed");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.emailHeading}</CardTitle>
        <CardDescription>{copy.emailNote}</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "done" ? (
          <p role="status" className="text-sm font-medium text-ok">
            {copy.emailDone}
          </p>
        ) : (
          <form method="post" onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="subscribe-email">{copy.emailLabel}</Label>
              <Input
                id="subscribe-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-3">
              <input
                id="subscribe-consent"
                name="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 size-4 shrink-0 accent-primary"
              />
              <label htmlFor="subscribe-consent" className="text-sm leading-snug text-pretty">
                {copy.consentBefore}
                {/* A new tab, so the numbers typed in the calculator are still here afterwards. */}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {PRIVACY_LINK_LABEL}
                </a>
                {copy.consentAfter}
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={!ready || !consent || status === "sending"}>
                {status === "sending" ? copy.emailSending : copy.emailSubmit}
              </Button>
              {status === "failed" ? (
                <p role="alert" className="text-sm text-danger">
                  {copy.emailFailed}
                </p>
              ) : null}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
