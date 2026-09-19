import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import {
  BACK_TO_CALCULATOR,
  DRAFT_BANNER,
  PRIVACY_SECTIONS,
  PRIVACY_TITLE,
  splitPlaceholders,
} from "@/lib/privacy-copy";

export const Route = createFileRoute("/privacy")({
  // A draft with blanks must not show up in search results (privacy.test.ts enforces this).
  head: () => ({
    meta: [
      { title: `${PRIVACY_TITLE} (DRAFT) · Tunay na Interes` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <main className="min-h-dvh bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid w-full max-w-2xl gap-6">
        <a href="/" className="text-sm text-muted-foreground underline underline-offset-2">
          {BACK_TO_CALCULATOR}
        </a>

        <header className="grid gap-3">
          <h1 className="font-display text-4xl tracking-tight text-foreground">{PRIVACY_TITLE}</h1>
          <p
            role="note"
            className="rounded-lg border border-warn/40 bg-warn-soft px-4 py-3 text-sm font-medium text-warn"
          >
            {DRAFT_BANNER}
          </p>
        </header>

        {PRIVACY_SECTIONS.map((section) => (
          <Card key={section.heading}>
            <CardContent className="grid gap-3 text-sm leading-relaxed text-pretty">
              <h2 className="font-display text-lg font-medium tracking-tight">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground">
                  {splitPlaceholders(paragraph).map((part, index) =>
                    part.blank ? (
                      <mark key={index} className="rounded bg-warn-soft px-1 text-warn">
                        {part.text}
                      </mark>
                    ) : (
                      <span key={index}>{part.text}</span>
                    ),
                  )}
                </p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
