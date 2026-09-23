/**
 * The one place the live language is chosen (DECISIONS N34). Everything on screen reads
 * `copy`; the words themselves live in src/lib/copy/<language>.ts, each a typed `Copy`.
 */
import { fil } from "./copy/fil.ts";
import type { Copy } from "./copy/types.ts";

export type { Copy, LegalFootParagraph, PrivacySection } from "./copy/types.ts";

export const copy: Copy = fil;
