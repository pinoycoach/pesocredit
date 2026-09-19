/**
 * Text that may contain a cap or limit from rules.ts. Every such value has to link to the
 * published source, so this copy is deliberately not plain text: a cap is written
 * `{ cap: "12% kada buwan" }`, an object React cannot render by itself. The only way to
 * show it is <CapSegments> in components/source-link.tsx, which links each cap, and
 * TypeScript rejects anything else (segments.test.ts keeps that true).
 */
export type Segment = string | { readonly cap: string };
export type Segments = readonly Segment[];

/** Mark a piece of text as a cap or limit taken from rules.ts. */
export const cap = (text: string): Segment => ({ cap: text });

/** The segments as one plain string, for tests and comparisons. */
export const plainText = (segments: Segments): string =>
  segments.map((segment) => (typeof segment === "string" ? segment : segment.cap)).join("");
