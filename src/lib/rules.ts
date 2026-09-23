/**
 * peso.credit — rules as data. THE ONLY place legal numbers live.
 * Every constant names its primary source. Change the law here, nowhere else.
 *
 * Primary source: SEC Memorandum Circular No. 14, Series of 2025
 *   "Recalibrated Ceilings on Interest Rates and Other Fees Charged by
 *    Financing Companies and Lending Companies" — signed 10 Dec 2025,
 *    effective 01 Apr 2026. Read in full 19 Sep 2026.
 * The circular itself (a 3-page scan): docs/sources/SEC-MC-14-s2025.pdf. Every value below was
 * checked against it on 23 Sep 2026 (DECISIONS N42).
 * NOTE: not to be confused with SEC MC No. 14, Series of 2026 (Umbrella Funds).
 */

export const RULES_AS_OF = "2026-09-19";

export const SOURCE = {
  id: "SEC MC No. 14, s. 2025",
  url: "https://www.sec.gov.ph/mc-2025/sec-mc-no-14-series-of-2025/",
  effective: "2026-04-01",
} as const;

/** Sec. 1 & 2(g): which loans are covered. */
export const COVERAGE = {
  lenderTypes: ["financing_company", "lending_company"] as const, // Sec. 2(a),(b): excludes banks, pawnshops, coops
  unsecured: true, // Sec. 2(e)
  generalPurpose: true, // Sec. 2(f)
  principalMax: 10_000, // "do not exceed ₱10,000"
  tenorMonthsMax: 4, // "loan tenor of up to four (4) months"
  /** 4 months ≠ 120 days. 121–123 days may still be 4 calendar months → GRAY, never "not covered". */
  tenorDaysSurelyCovered: 120,
  tenorDaysMaybeCovered: 123,
  appliesToLoansFrom: "2026-04-01", // "entered into, restructured, or renewed beginning 01 April 2026"
};

/** Sec. 3: prescribed ceilings. */
export const CEILINGS = {
  /** Sec. 3(1), def. Sec. 2(c): % of total amount borrowed, excluding fees. */
  nominalPerMonth: 0.06, // circular: "approximately 0.20% per day"
  /** Sec. 3(2), def. Sec. 2(d): includes NIR + all other fees; excludes late/non-payment penalties. */
  effectivePerMonth: 0.12, // circular: "approximately 0.40% per day"
  /** Sec. 3(3): on the outstanding scheduled amount due. NOT CHECKED in v1 (needs days-late input). */
  penaltyPerMonth: 0.05,
  /** Sec. 3(4): interest + fees + penalties ≤ 100% of amount borrowed, regardless of time outstanding. */
  totalCostRatio: 1.0,
};

/**
 * OPEN QUESTION (unresolved by the circular): Sec. 2(d) defers the EIR method to
 * "the calculation models implemented in the Truth in Lending Act" (RA 3765).
 * The circular does not say whether a daily rate becomes monthly by ×30 (simple)
 * or by compounding. We therefore compute BOTH and use a three-state verdict:
 *   compounded ≤ cap          → WITHIN   (within under any reading)
 *   simple ×30 > cap          → OVER     (over under any reading)
 *   otherwise                 → GRAY     ("malapit sa ceiling")
 * Never show OVER for a GRAY loan. Revisit when the TLA calculation model is confirmed.
 */
export const DAYS_PER_MONTH = 30;

/**
 * Fee names to prompt for, so borrowers recognize them. The first seven are Sec. 2(h)'s examples
 * of other fees and charges, in its order; the last two are what Sec. 3(2) adds in its list of
 * fees the EIR includes. Both lists end "among others".
 */
export const OTHER_FEES_EXAMPLES = [
  // Sec. 2(h)
  "processing fee",
  "service fee",
  "notarial fee",
  "origination fee",
  "transfer charge",
  "documentary stamp tax",
  "disbursement fee",
  // Sec. 3(2)
  "handling fee",
  "verification fee",
] as const;

/** Sec. 5: anti-circumvention — for explainer content only, never for accusations. */
export const CIRCUMVENTION_EXAMPLES = [
  "restructuring",
  "repackaging",
  "splitting of loan amounts",
  "recharacterization of fees",
  "shifting of loan tenor",
  "simulated collateral",
  "sham guaranty arrangements",
  "disguised charges",
] as const;

export type Verdict = "WITHIN" | "GRAY" | "OVER";

export function eirVerdict(dailyRate: number, cap = CEILINGS.effectivePerMonth): Verdict {
  const simple = dailyRate * DAYS_PER_MONTH;
  const compounded = Math.pow(1 + dailyRate, DAYS_PER_MONTH) - 1;
  if (compounded <= cap) return "WITHIN";
  if (simple > cap) return "OVER";
  return "GRAY";
}
