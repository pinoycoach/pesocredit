import { Fragment, type ReactNode } from "react";
import { copy } from "@/lib/copy";
import { SOURCE } from "@/lib/rules";
import type { Segments } from "@/lib/segments";
import { cn } from "@/lib/utils";

/** The one link to the published circular. Opens in a new tab so typed numbers are kept. */
export function SourceLink({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <a
      href={SOURCE.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "underline decoration-dotted underline-offset-2 hover:decoration-solid",
        className,
      )}
    >
      {children}
    </a>
  );
}

/** Renders copy that contains caps: text as text, every cap as a link to the source. */
export function CapSegments({ segments }: { segments: Segments }) {
  return (
    <>
      {segments.map((segment, index) =>
        typeof segment === "string" ? (
          <Fragment key={index}>{segment}</Fragment>
        ) : (
          <SourceLink key={index}>{segment.cap}</SourceLink>
        ),
      )}
    </>
  );
}

/** "Batay sa SEC MC No. 14, s. 2025 · as of 2026-09-19", with the circular linked. */
export function BasisLine() {
  return (
    <>
      {copy.basisLead} <SourceLink>{SOURCE.id}</SourceLink> · {copy.basisAsOf}
    </>
  );
}
