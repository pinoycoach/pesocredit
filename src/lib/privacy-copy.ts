/**
 * The privacy page: its status, its one contact address, and its words in the live language
 * (copy.ts; the words themselves are in src/lib/copy/<language>.ts).
 *
 * Two versions (PRIVACY_VERSION). "v1" is live: the calculator alone, no email form, no blanks
 * (N45). "full" describes the email form and keeps its blanks for counsel (N17); it is kept in
 * the source, unused, until the form goes live, and only under it may the form exist.
 *
 * It states only what this app verifiably does (see network-privacy.test.ts and
 * subscribe.test.ts) and leaves a visible placeholder for everything the owner must supply
 * or a lawyer must decide. No operator, address, provider name or retention period is
 * invented. A test lists the placeholders that remain.
 *
 * PRIVACY_STATUS is "draft" until Napoleon signs the page in SIGNOFF.json with no blanks
 * left; then it must be "final" (privacy.test.ts enforces both directions). A draft shows
 * the DRAFT banner and is hidden from search; a final page is neither. The email form asks
 * visitors to agree to this page, so it also waits for "final" (public-config.ts, C107).
 */
import { copy, type PrivacySection } from "./copy.ts";

export type { PrivacySection } from "./copy.ts";

/** How a blank starts in the live language, e.g. "[ILAGAY DITO:". */
export const PLACEHOLDER_OPEN = copy.placeholderOpen;

/** A blank the owner (or a lawyer) has to fill before this page is final. */
export const placeholder = (what: string) => `${PLACEHOLDER_OPEN} ${what}]`;

export type PrivacyStatus = "draft" | "final";

/** Switched to "final" in the same commit as Napoleon's signature for privacy-page. */
export const PRIVACY_STATUS: PrivacyStatus = "draft";

/**
 * Which privacy page is live. "full" describes the email form and needs counsel's review (N17);
 * "v1" is for the calculator alone, with no email form (N45).
 */
export type PrivacyVersion = "v1" | "full";
export const PRIVACY_VERSION: PrivacyVersion = "v1";

export type PrivacyState = { version: PrivacyVersion; status: PrivacyStatus };

/**
 * Whether the email form may exist at all: only under the full page, once it is final. The v1
 * page describes no form, so under it the form stays off even with every Resend setting usable.
 * Both the page (public-config.ts) and the server (subscribe.ts) ask this.
 */
export function emailFormAllowed(
  { version, status }: PrivacyState = { version: PRIVACY_VERSION, status: PRIVACY_STATUS },
): boolean {
  return version === "full" && status === "final";
}

/**
 * The one designated place for the page's email address, used wherever the page gives
 * one. Empty until supplied: the page shows its placeholders instead.
 */
export const CONTACT_EMAIL: string = "privacy@peso.credit";

export const PRIVACY_TITLE = copy.privacyTitle;
export const DRAFT_BANNER = copy.privacyDraftBanner;
export const BACK_TO_CALCULATOR = copy.backToCalculator;
export const PRIVACY_LINK_LABEL = copy.privacyLinkLabel;

/** The day the v1 page was last changed, shown under its title. Change it with the page. */
export const PRIVACY_V1_UPDATED = "2026-09-24";

/** The full page (N17): kept for when the email form goes live, not shown under v1. */
export const PRIVACY_FULL_SECTIONS: PrivacySection[] = copy.privacySections(CONTACT_EMAIL);

// The v1 page in the live language. privacy.test.ts fails if it is missing while v1 is live.
const V1 = PRIVACY_VERSION === "v1" ? copy.privacyV1 : null;

/** The live page's sections: v1 or full, as PRIVACY_VERSION says. */
export const PRIVACY_SECTIONS: PrivacySection[] = V1 ? V1.sections(CONTACT_EMAIL) : PRIVACY_FULL_SECTIONS;

/** The line under the title on the v1 page ("Last updated: …"); the full page has none yet. */
export const PRIVACY_LAST_UPDATED: string | null = V1 ? V1.lastUpdated(PRIVACY_V1_UPDATED) : null;

/** The page's head tags: a draft is hidden from search and says DRAFT in its title. */
export function privacyHeadMeta(status: PrivacyStatus) {
  return status === "final"
    ? [{ title: copy.privacyHeadTitleFinal }]
    : [{ title: copy.privacyHeadTitleDraft }, { name: "robots", content: "noindex" }];
}

export const showDraftBanner = (status: PrivacyStatus) => status === "draft";

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every blank still to fill on the live page. */
export function remainingPlaceholders(): string[] {
  const text = PRIVACY_SECTIONS.flatMap((s) => s.paragraphs).join("\n");
  const blank = new RegExp(`${escapeRegExp(PLACEHOLDER_OPEN)} ([^\\]]*)\\]`, "g");
  return [...text.matchAll(blank)].map((m) => m[1]);
}

export type TextPart = { text: string; blank: boolean };

/** Split a paragraph so placeholders can be shown highlighted. */
export function splitPlaceholders(paragraph: string): TextPart[] {
  const parts: TextPart[] = [];
  let rest = paragraph;
  for (;;) {
    const start = rest.indexOf(PLACEHOLDER_OPEN);
    const end = start === -1 ? -1 : rest.indexOf("]", start);
    if (start === -1 || end === -1) break;
    if (start > 0) parts.push({ text: rest.slice(0, start), blank: false });
    parts.push({ text: rest.slice(start, end + 1), blank: true });
    rest = rest.slice(end + 1);
  }
  if (rest) parts.push({ text: rest, blank: false });
  return parts;
}
