/**
 * The one place the live language is chosen (DECISIONS N34). Everything on screen reads
 * `copy`; the words themselves live in src/lib/copy/<language>.ts, each a typed `Copy`.
 * English is on screen; the Filipino (./copy/fil.ts) is kept for the Tagalog version.
 *
 * headlineText and computedRows put a language's pieces together, the same way for the page
 * and for the signed wording (signoff.ts).
 */
import { en } from "./copy/en.ts";
import type { Copy } from "./copy/types.ts";
import type { LoanNumbers } from "./loan-math.ts";
import { formatPeso } from "./utils.ts";

export type { Copy, LegalFootParagraph, PrivacySection } from "./copy/types.ts";

export const copy: Copy = en;

/**
 * The headline as shown. Its total counts only the scheduled payments, all due by the day it
 * names; a late penalty is paid after its due day, so it gets a sentence of its own (N41).
 */
export function headlineText(n: LoanNumbers, c: Copy = copy): string {
  if (n.penalty > 0 && c.penaltySentence) return `${c.headline(n)} ${c.penaltySentence(formatPeso(n.penalty))}`;
  return c.headline(n);
}

/** Where the late-penalty row goes: right after the payments due by the last day. */
export const PENALTY_ROW_INDEX = 2;

/** The "how we calculated this" rows as shown, with a row for a late penalty when one is entered (N41). */
export function computedRows(n: LoanNumbers, c: Copy = copy): [label: string, value: string][] {
  const rows = c.howComputedRows(n);
  if (!(n.penalty > 0 && c.penaltyRowLabel)) return rows;
  const penaltyRow: [string, string] = [c.penaltyRowLabel, formatPeso(n.penalty)];
  return [...rows.slice(0, PENALTY_ROW_INDEX), penaltyRow, ...rows.slice(PENALTY_ROW_INDEX)];
}
