import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/calculator";
import { EYEBROW } from "@/lib/copy";
import { PRIVACY_LINK_LABEL } from "@/lib/privacy-copy";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="min-h-dvh bg-background px-4 py-8 sm:px-6 sm:py-12">
      <header className="mx-auto mb-8 max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {EYEBROW}
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Tunay na Interes
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
          Ilagay ang inutang, ang hulog, at ilang beses magbabayad. Kasama ang 7-araw na loan.
          Ang tool ay nagkukuwenta ng effective interest (EIR) at tinitingnan kung sakop ka ng
          naka-publish na ceiling — hindi nagnangalan ng lender, hindi nagpapayo kung paano
          magbayad.
        </p>
      </header>
      <Calculator />
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
