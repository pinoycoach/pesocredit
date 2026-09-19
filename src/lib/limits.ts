/** Caps and coverage limits from rules.ts, worded once for everything that shows them. */
import { CEILINGS, COVERAGE } from "./rules.ts";

/** A ceiling as a whole-number percent: 0.06 becomes "6%", 1 becomes "100%". */
export const capPercent = (fraction: number) => `${Number((fraction * 100).toFixed(2))}%`;

export const pesoWhole = (n: number) => `₱${n.toLocaleString("en-PH")}`;

export const NOMINAL_CAP_TEXT = `${capPercent(CEILINGS.nominalPerMonth)} kada buwan`;
export const EIR_CAP_TEXT = `${capPercent(CEILINGS.effectivePerMonth)} kada buwan`;
export const TOTAL_COST_CAP_TEXT = `${capPercent(CEILINGS.totalCostRatio)} ng inutang`;
export const PENALTY_CAP_TEXT = `${capPercent(CEILINGS.penaltyPerMonth)} kada buwan`;

export const PRINCIPAL_LIMIT_TEXT = pesoWhole(COVERAGE.principalMax);
export const TENOR_LIMIT_TEXT = `${COVERAGE.tenorMonthsMax} na buwan`;
