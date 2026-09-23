import { EmailCapture } from "@/components/email-capture";
import { Card, CardContent } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import type { PublicConfig } from "@/lib/public-config";

/**
 * Everything optional that sits below the result: the email form when the Resend settings are
 * configured, then the guide link when a guide address is. Each hides itself when its
 * setting is empty, independently of the other, and neither ever affects the result above.
 */
export function OptionalExtras({ config }: { config: PublicConfig }) {
  if (!config.emailCaptureEnabled && !config.guideUrl) return null;
  return (
    <>
      {config.emailCaptureEnabled ? <EmailCapture /> : null}
      {config.guideUrl ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-lg tracking-tight">{copy.guideTitle}</p>
            <a
              href={config.guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline underline-offset-2"
            >
              {copy.guideLinkLabel}
            </a>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
