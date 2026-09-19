/**
 * CLAUDE.md principle 1, "Inform, never accuse": these words must never appear on
 * screen, and no lender may be named. Only the tests read this file; nothing on screen
 * does, so the words below are never shipped to the page.
 *
 * Words match from their start ("scam" also catches "scammer", "fraud" also catches
 * "fraudulent"), ignoring case and accents.
 */
export const BANNED_WORDS = ["ilegal", "illegal", "scam", "fraud"] as const;

export const BANNED_PHRASES = ["loan shark"] as const;

/**
 * Lender names that must never appear on screen. EMPTY until the project owner
 * supplies them: none are invented here. While empty, the banned-phrase test says so.
 */
export const LENDER_NAMES: readonly string[] = [];

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Not preceded by a letter or digit, so a match starts at the start of a word. */
const WORD_START = "(?<![\\p{L}\\p{N}])";
const WORD_END = "(?![\\p{L}\\p{N}])";

/** Every banned word, phrase or lender name found in `text`. Empty means clean. */
export function findBanned(text: string, lenderNames: readonly string[] = LENDER_NAMES): string[] {
  const folded = fold(text);
  const hits: string[] = [];

  for (const word of BANNED_WORDS) {
    if (new RegExp(`${WORD_START}${word}`, "u").test(folded)) hits.push(word);
  }
  for (const phrase of BANNED_PHRASES) {
    const pattern = escapeRegExp(phrase).replace(/ /g, "\\s+");
    if (new RegExp(`${WORD_START}${pattern}`, "u").test(folded)) hits.push(phrase);
  }
  for (const name of lenderNames) {
    const folding = fold(name).trim();
    if (!folding) continue;
    if (new RegExp(`${WORD_START}${escapeRegExp(folding)}${WORD_END}`, "u").test(folded)) {
      hits.push(name);
    }
  }
  return hits;
}
