/**
 * The one place the live language is chosen (DECISIONS N34). Everything on screen reads
 * `copy`; the words themselves live in src/lib/copy/<language>.ts, each a typed `Copy`.
 * English is on screen; the Filipino (./copy/fil.ts) is kept for the Tagalog version.
 */
import { en } from "./copy/en.ts";
import type { Copy } from "./copy/types.ts";

export type { Copy, LegalFootParagraph, PrivacySection } from "./copy/types.ts";

export const copy: Copy = en;
