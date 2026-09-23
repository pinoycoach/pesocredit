import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/calculator";
import { copy } from "@/lib/copy";
import { getPublicConfig } from "@/lib/get-public-config";
import { PRIVACY_LINK_LABEL } from "@/lib/privacy-copy";

// The environment is read on the server at request time; the page learns only whether
// the email form is on, and the guide link.
export const Route = createFileRoute("/")({
  loader: () => getPublicConfig(),
  component: Home,
});

function Home() {
  const publicConfig = Route.useLoaderData();
  return (
    <main className="min-h-dvh bg-background px-4 py-8 sm:px-6 sm:py-12">
      <header className="mx-auto mb-8 max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          {copy.pageTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
          {copy.pageIntro}
        </p>
      </header>
      <Calculator publicConfig={publicConfig} />
      <footer className="mx-auto mt-10 max-w-6xl text-xs text-muted-foreground">
        {/* A new tab, so what the borrower typed is still here when they come back. */}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {PRIVACY_LINK_LABEL}
        </a>
      </footer>
    </main>
  );
}
