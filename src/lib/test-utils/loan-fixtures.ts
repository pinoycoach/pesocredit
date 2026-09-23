/**
 * Loan inputs shared by the tests and by the SIGNOFF content (signoff.ts). The golden
 * inputs are the loans in GOLDEN-CASES.md; the table there holds the expected values.
 */
import type { LoanInput } from "../loan-math.ts";
import { COVERAGE } from "../rules.ts";

export const base = (over: Partial<LoanInput> = {}): LoanInput => ({
  principal: 5_000,
  upfrontFee: 0,
  payment: 5_300,
  paymentCount: 1,
  frequency: "monthly",
  firstDueDays: 30,
  penalty: 0,
  unsecured: true,
  generalPurpose: true,
  lenderKind: "lending_or_financing",
  bookedOn: "2026-09-18",
  followUpDay: null,
  ...over,
});

/** A single payment due on `days`, whatever the frequency label. */
export const single = (days: number, over: Partial<LoanInput> = {}) =>
  base({ frequency: "daily", paymentCount: 1, firstDueDays: days, ...over });

export const GOLDEN_INPUTS: Record<string, LoanInput> = {
  G1: base({ principal: 5_000, payment: 5_300, frequency: "monthly", firstDueDays: 30 }),
  G2: base({ principal: 5_000, payment: 6_500, frequency: "weekly", firstDueDays: 7 }),
  G3: base({
    principal: 5_000,
    upfrontFee: 65,
    payment: 5_070,
    frequency: "weekly",
    firstDueDays: 7,
  }),
  G4: base({
    principal: 5_000,
    upfrontFee: 800,
    payment: 5_500,
    frequency: "weekly",
    firstDueDays: 7,
  }),
  G5: base({
    principal: 3_000,
    upfrontFee: 450,
    payment: 3_000,
    frequency: "biweekly",
    firstDueDays: 14,
  }),
  G6: base({
    principal: 10_000,
    payment: 2_560,
    paymentCount: 4,
    frequency: "weekly",
    firstDueDays: 7,
  }),
  G7: base({
    principal: 3_000,
    payment: 3_150,
    penalty: 2_900,
    frequency: "monthly",
    firstDueDays: 30,
  }),
};

/** One loan per coverage outcome and per reason a loan is not covered. */
export const COVERAGE_INPUTS: Record<string, LoanInput> = {
  bank: base({ payment: 9_000, lenderKind: "bank" }),
  secured: base({ payment: 9_000, unsecured: false }),
  notGeneralPurpose: base({ payment: 9_000, generalPurpose: false }),
  principalAboveCoverage: base({ principal: COVERAGE.principalMax + 1, payment: 10_500 }),
  tenorMaybeCovered: single(COVERAGE.tenorDaysSurelyCovered + 1, { payment: 12_000 }),
  tenorNotCovered: single(COVERAGE.tenorDaysMaybeCovered + 1, { payment: 12_000 }),
  beforeEffectiveDate: base({ bookedOn: "2026-03-31" }),
};
