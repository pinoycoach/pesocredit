/**
 * SIGNOFF.json: Napoleon's sign-off on three pieces of content (BUILD-STANDARD point 10).
 * A signature stores who signed, the date, and a hash of the exact content signed, so
 * signoff.test.ts fails the moment signed content changes. Only a human writes a
 * signature; Claude never does (CLAUDE.md).
 *
 * The hash covers the values a reader sees, as JSON with sorted keys, not the bytes of
 * a source file: comments, formatting and line endings never break a signature, and
 * any change a reader could see does.
 *
 * Used only by tests and tools/signoff.ts. Nothing here reaches the site.
 */
import { createHash } from "node:crypto";
import { copy } from "./copy.ts";
import { analyzeLoan, type LoanInput } from "./loan-math.ts";
import {
  BACK_TO_CALCULATOR,
  PRIVACY_LINK_LABEL,
  PRIVACY_SECTIONS,
  PRIVACY_TITLE,
} from "./privacy-copy.ts";
import * as rules from "./rules.ts";
import { COVERAGE_INPUTS, GOLDEN_INPUTS } from "./test-utils/loan-fixtures.ts";

export const SIGNOFF_IDS = ["privacy-page", "verdict-wording", "cap-values"] as const;
export type SignoffId = (typeof SIGNOFF_IDS)[number];

/** The only person who signs. */
export const SIGNER = "Napoleon";

export type Signature = {
  signer: string;
  /** YYYY-MM-DD */
  date: string;
  /** "sha256:" and 64 hex characters: hashOf(id) at the time of signing. */
  hash: string;
  /**
   * Who reviewed before Napoleon signed. privacy-page: the lawyer (N17). verdict-wording:
   * the independent reviewers (COPY-REVIEW.md). cap-values: Napoleon, against the circular.
   */
  reviewedBy?: string;
};

export type SignoffItem = { id: string; signature: Signature | null };
export type SignoffRecord = { items: SignoffItem[] };

/** rules.ts exports that are logic, not content: the golden cases check them instead. */
export const RULES_LOGIC_EXPORTS = ["eirVerdict"];

/** Every exported value of rules.ts, including the fee and disguised-charge examples. */
function capValues() {
  return Object.fromEntries(
    Object.entries(rules).filter(([name]) => !RULES_LOGIC_EXPORTS.includes(name)),
  );
}

/** The privacy page as a reader sees it. The DRAFT banner is not signed: signing removes it. */
function privacyPage() {
  return {
    lang: copy.htmlLang,
    title: PRIVACY_TITLE,
    backToCalculator: BACK_TO_CALCULATOR,
    linkLabel: PRIVACY_LINK_LABEL,
    sections: PRIVACY_SECTIONS,
  };
}

/** What a result says about one loan: the headline and the coverage wording, as sentences. */
function loanWording(input: LoanInput) {
  const a = analyzeLoan(input);
  if (a.status === "ok") {
    return {
      headline: copy.headline(a.numbers),
      coverage: { state: a.coverage.state, reasons: a.coverage.reasons.map(copy.coverageReason) },
    };
  }
  if (a.status === "before_effective_date") return { headline: copy.headline(a.numbers) };
  return { cannotCompute: a.reason };
}

/** The verdict wording: every sentence that states a verdict, a coverage, or the headline. */
function verdictWording() {
  const loans = { ...GOLDEN_INPUTS, ...COVERAGE_INPUTS };
  return {
    // The language is part of what is signed: switching it needs a new signature.
    lang: copy.htmlLang,
    text: {
      oldLoanNotice: copy.oldLoanNotice,
      cannotCompute: copy.cannotCompute,
      headlineMethodNote: copy.headlineMethodNote,
      grayEirText: copy.grayEirText,
      unsureCoverageText: copy.unsureCoverageText,
      unsureCoverageBadge: copy.unsureCoverageBadge,
      comparisonNote: copy.comparisonNote,
      comparisonTitle: copy.comparisonTitle,
      basis: `${copy.basisLead} ${rules.SOURCE.id} · ${copy.basisAsOf}`,
      coverageText: copy.coverageText,
      stateText: copy.stateText,
      ceilingLabel: copy.ceilingLabel,
      ceilingCapText: copy.ceilingCapText,
      rowNumberLabel: copy.rowNumberLabel,
      rowCeilingLabel: copy.rowCeilingLabel,
      disclaimer: copy.disclaimer,
    },
    loans: Object.fromEntries(
      Object.entries(loans).map(([name, input]) => [name, loanWording(input)]),
    ),
  };
}

export function contentOf(id: SignoffId): unknown {
  switch (id) {
    case "privacy-page":
      return privacyPage();
    case "verdict-wording":
      return verdictWording();
    case "cap-values":
      return capValues();
  }
}

/** JSON with object keys sorted at every level, so key order never changes a hash. */
export function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v !== null && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
        )
      : v,
  );
}

export function hashContent(value: unknown): string {
  return `sha256:${createHash("sha256").update(canonical(value), "utf8").digest("hex")}`;
}

export function hashOf(id: SignoffId): string {
  return hashContent(contentOf(id));
}

export function currentHashes(): Record<SignoffId, string> {
  return Object.fromEntries(SIGNOFF_IDS.map((id) => [id, hashOf(id)])) as Record<
    SignoffId,
    string
  >;
}

const HASH = /^sha256:[0-9a-f]{64}$/;
const SIGNATURE_FIELDS = new Set(["signer", "date", "hash", "reviewedBy"]);
const DAY_MS = 86_400_000;

/** A real calendar date written YYYY-MM-DD, as midnight UTC; null otherwise. */
function calendarDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(year, month - 1, day));
  const real =
    d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
  return real ? d : null;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/**
 * Every problem with a SIGNOFF record, empty when it is sound. Checks structure, never
 * that anything is (un)signed: each id once, no unknown ids, well-formed signatures, and
 * no signed content that has changed since it was signed. `now` allows one day of slack
 * on dates, because Philippine time runs ahead of UTC.
 */
export function validate(
  record: unknown,
  current: Record<SignoffId, string>,
  now: Date,
): string[] {
  if (!isRecord(record) || !Array.isArray(record.items)) {
    return ['SIGNOFF.json must be { "items": [...] }'];
  }
  const problems: string[] = [];
  const seen = new Map<string, number>();
  const latest = now.getTime() + DAY_MS;

  for (const item of record.items as unknown[]) {
    if (!isRecord(item) || typeof item.id !== "string" || !("signature" in item)) {
      problems.push(`not an item with an id and a signature: ${JSON.stringify(item)}`);
      continue;
    }
    const id = item.id;
    seen.set(id, (seen.get(id) ?? 0) + 1);
    if (!(SIGNOFF_IDS as readonly string[]).includes(id)) {
      problems.push(`${id}: unknown id (expected one of ${SIGNOFF_IDS.join(", ")})`);
      continue;
    }
    const s = item.signature;
    if (s === null) continue;
    if (!isRecord(s)) {
      problems.push(`${id}: signature must be null or an object`);
      continue;
    }
    for (const field of Object.keys(s)) {
      if (!SIGNATURE_FIELDS.has(field)) problems.push(`${id}: unknown signature field "${field}"`);
    }
    if (s.signer !== SIGNER) problems.push(`${id}: signer must be "${SIGNER}"`);
    const date = calendarDate(s.date);
    if (!date) problems.push(`${id}: date must be a real date written YYYY-MM-DD`);
    else if (date.getTime() > latest) problems.push(`${id}: date ${String(s.date)} is in the future`);
    if ("reviewedBy" in s && (typeof s.reviewedBy !== "string" || s.reviewedBy.trim() === "")) {
      problems.push(`${id}: reviewedBy, when present, must be a non-empty string`);
    }
    if (typeof s.hash !== "string" || !HASH.test(s.hash)) {
      problems.push(`${id}: hash must be "sha256:" and 64 hex characters`);
    } else if (s.hash !== current[id as SignoffId]) {
      problems.push(
        `${id} changed since ${String(s.signer)} signed it on ${String(s.date)}: re-sign or revert`,
      );
    }
  }

  for (const id of SIGNOFF_IDS) {
    const count = seen.get(id) ?? 0;
    if (count === 0) problems.push(`${id}: missing`);
    if (count > 1) problems.push(`${id}: listed ${count} times`);
  }
  for (const [id, count] of seen) {
    if (count > 1 && !(SIGNOFF_IDS as readonly string[]).includes(id)) {
      problems.push(`${id}: listed ${count} times`);
    }
  }
  return problems;
}

/** Ids with no signature yet. Assumes a record that validate() accepts. */
export function unsigned(record: SignoffRecord): SignoffId[] {
  return SIGNOFF_IDS.filter((id) => record.items.find((item) => item.id === id)?.signature == null);
}
