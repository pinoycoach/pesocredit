/**
 * Formatting for caps and limits from rules.ts, in any language. The words around them ("a
 * month", "kada buwan") live in each language file under src/lib/copy/.
 */

/** A ceiling as a whole-number percent: 0.06 becomes "6%", 1 becomes "100%". */
export const capPercent = (fraction: number) => `${Number((fraction * 100).toFixed(2))}%`;

export const pesoWhole = (n: number) => `₱${n.toLocaleString("en-PH")}`;
