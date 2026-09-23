/**
 * Loan math. Every legal number (ceilings, the coverage box, the effective date,
 * days per month) comes from ./rules.ts; none is written here.
 *
 * The EIR is the discounted-cash-flow rate, found per day, that makes the net
 * proceeds equal the payments. A daily rate becomes a monthly one by x30 or by
 * compounding, and rules.ts records that the circular does not say which, so the
 * effective-rate verdict is three-state (see eirVerdict).
 *
 * No words live here: results are data, and src/lib/copy/ turns them into sentences.
 */
import { CEILINGS, COVERAGE, DAYS_PER_MONTH, eirVerdict, type Verdict } from "./rules.ts";

export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

export const INTERVAL_DAYS: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: DAYS_PER_MONTH,
};

/**
 * Slack for floating-point noise when comparing to a cap, so a loan sitting exactly
 * on a cap is not pushed over it by the last bits of a computation. Not a legal number.
 */
const NUMERIC_TOLERANCE = 1e-9;

export type LenderKind = "lending_or_financing" | "bank";

export type LoanInput = {
  principal: number;
  upfrontFee: number;
  payment: number;
  paymentCount: number;
  frequency: Frequency;
  firstDueDays: number;
  penalty: number;
  unsecured: boolean;
  generalPurpose: boolean;
  lenderKind: LenderKind;
  /** Date the loan was entered into or renewed, as YYYY-MM-DD. */
  bookedOn: string;
  followUpDay: number | null;
};

export type Cashflow = { day: number; amount: number; label: string };

export type Coverage = "COVERED" | "MAYBE" | "NOT_COVERED";

/** Why the ceilings do not (or may not) apply to a loan. copy.coverageReason words it. */
export type CoverageReason =
  | { kind: "lender" }
  | { kind: "secured" }
  | { kind: "purpose" }
  | { kind: "principal"; principal: number }
  | { kind: "tenorOver"; tenorDays: number }
  | { kind: "tenorMaybe"; tenorDays: number };

export type CheckId = "nominal" | "eir" | "totalCost";

/**
 * One ceiling comparison. `raw` is the verdict on the numbers alone; `state` is what
 * to show once coverage is applied (null when the ceilings do not apply to this loan,
 * and OVER softened to GRAY when coverage is uncertain).
 */
export type Check = {
  id: CheckId;
  actual: number;
  cap: number;
  raw: Verdict;
  state: Verdict | null;
};

export type CannotComputeReason =
  | "invalid_input"
  | "invalid_date"
  | "fee_not_less_than_principal"
  | "payments_below_principal"
  | "no_solution";

export type LoanNumbers = {
  netProceeds: number;
  tenorDays: number;
  totalPayments: number;
  /** Interest + fees + penalties: total paid minus what was received. Never negative. */
  totalCost: number;
  /** totalCost as a share of the amount borrowed. */
  totalCostRatio: number;
  nominalPerMonth: number;
  eirPerDay: number;
  /** Daily rate x DAYS_PER_MONTH. */
  eirPerMonthSimple: number;
  /** (1 + daily rate) ^ DAYS_PER_MONTH - 1. */
  eirPerMonthCompounded: number;
  schedule: { n: number; day: number; amount: number }[];
};

export type LoanAnalysis =
  | { status: "cannot_compute"; reason: CannotComputeReason }
  /** Dated before the circular takes effect: numbers only, no ceiling comparison. */
  | { status: "before_effective_date"; numbers: LoanNumbers }
  | {
      status: "ok";
      numbers: LoanNumbers;
      coverage: { state: Coverage; reasons: CoverageReason[] };
      checks: Record<CheckId, Check>;
      /** The most serious state among the checks; null when the ceilings do not apply. */
      overall: Verdict | null;
    };

function npv(ratePerDay: number, flows: Cashflow[]): number {
  let s = 0;
  for (const f of flows) {
    s += f.amount / Math.pow(1 + ratePerDay, f.day);
  }
  return s;
}

/** Daily IRR. Borrower sign: +in at t0, −payments later. */
export function irrDaily(flows: Cashflow[]): number | null {
  if (flows.length < 2) return null;
  const f = (r: number) => npv(r, flows);
  let lo = -0.85;
  let hi = 2;
  let nLo = f(lo);
  let nHi = f(hi);
  if (!Number.isFinite(nLo) || !Number.isFinite(nHi)) return null;
  if (nLo * nHi > 0) {
    for (const trial of [5, 10, 25, 80, 200]) {
      hi = trial;
      nHi = f(hi);
      if (Number.isFinite(nHi) && nLo * nHi <= 0) break;
    }
  }
  if (!Number.isFinite(nHi) || nLo * nHi > 0) return null;
  for (let i = 0; i < 90; i++) {
    const mid = (lo + hi) / 2;
    const n = f(mid);
    if (!Number.isFinite(n)) return null;
    if (nLo * n <= 0) {
      hi = mid;
    } else {
      lo = mid;
      nLo = n;
    }
  }
  return (lo + hi) / 2;
}

export function buildSchedule(input: LoanInput): {
  schedule: { n: number; day: number; amount: number }[];
  tenorDays: number;
} {
  const interval = INTERVAL_DAYS[input.frequency];
  const first = Math.max(1, Math.round(input.firstDueDays) || interval);
  const n = Math.max(1, Math.floor(input.paymentCount));
  const schedule = Array.from({ length: n }, (_, i) => ({
    n: i + 1,
    day: first + i * interval,
    amount: input.payment,
  }));
  const tenorDays = schedule[schedule.length - 1]?.day ?? first;
  return { schedule, tenorDays };
}

/** True for a real calendar date written YYYY-MM-DD. */
function isIsoDate(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

function assessCoverage(
  input: LoanInput,
  tenorDays: number,
): { state: Coverage; reasons: CoverageReason[] } {
  const reasons: CoverageReason[] = [];
  if (input.lenderKind !== "lending_or_financing") reasons.push({ kind: "lender" });
  if (COVERAGE.unsecured && !input.unsecured) reasons.push({ kind: "secured" });
  if (COVERAGE.generalPurpose && !input.generalPurpose) reasons.push({ kind: "purpose" });
  if (input.principal > COVERAGE.principalMax) {
    reasons.push({ kind: "principal", principal: input.principal });
  }
  if (tenorDays > COVERAGE.tenorDaysMaybeCovered) reasons.push({ kind: "tenorOver", tenorDays });
  if (reasons.length > 0) return { state: "NOT_COVERED", reasons };

  if (tenorDays > COVERAGE.tenorDaysSurelyCovered) {
    return { state: "MAYBE", reasons: [{ kind: "tenorMaybe", tenorDays }] };
  }
  return { state: "COVERED", reasons: [] };
}

/** Ceilings only apply to covered loans; when coverage is uncertain, OVER is shown as GRAY. */
function applyCoverage(raw: Verdict, coverage: Coverage): Verdict | null {
  if (coverage === "NOT_COVERED") return null;
  if (coverage === "MAYBE" && raw === "OVER") return "GRAY";
  return raw;
}

const SEVERITY: Record<Verdict, number> = { WITHIN: 0, GRAY: 1, OVER: 2 };

export function analyzeLoan(input: LoanInput): LoanAnalysis {
  const numeric = [input.principal, input.upfrontFee, input.payment, input.penalty];
  if (
    !numeric.every(Number.isFinite) ||
    !Number.isFinite(input.paymentCount) ||
    input.principal <= 0 ||
    input.upfrontFee < 0 ||
    input.payment < 0 ||
    input.penalty < 0 ||
    input.paymentCount < 1
  ) {
    return { status: "cannot_compute", reason: "invalid_input" };
  }
  if (!isIsoDate(input.bookedOn)) return { status: "cannot_compute", reason: "invalid_date" };

  const netProceeds = input.principal - input.upfrontFee;
  if (netProceeds <= 0) return { status: "cannot_compute", reason: "fee_not_less_than_principal" };

  const { schedule, tenorDays } = buildSchedule(input);
  const scheduled = schedule.reduce((sum, p) => sum + p.amount, 0);
  // Scheduled payments below what was received would be a negative rate and a
  // negative cost; that is a typing error, not a loan.
  if (scheduled < netProceeds - NUMERIC_TOLERANCE) {
    return { status: "cannot_compute", reason: "payments_below_principal" };
  }

  // EIR excludes late penalties; they count only toward total cost.
  const rDay = irrDaily([
    { day: 0, amount: netProceeds, label: "received" },
    ...schedule.map((p) => ({ day: p.day, amount: -p.amount, label: `payment ${p.n}` })),
  ]);
  if (rDay === null || !Number.isFinite(rDay)) {
    return { status: "cannot_compute", reason: "no_solution" };
  }
  // A zero-cost loan solves to 0 plus noise; keep it exactly 0.
  const eirPerDay = Math.abs(rDay) < NUMERIC_TOLERANCE ? 0 : rDay;

  const totalPayments = scheduled + input.penalty;
  const totalCost = Math.max(0, totalPayments - netProceeds);
  const interestOnFace = Math.max(0, scheduled - input.principal);

  const numbers: LoanNumbers = {
    netProceeds,
    tenorDays,
    totalPayments,
    totalCost,
    totalCostRatio: totalCost / input.principal,
    nominalPerMonth: interestOnFace / input.principal / (tenorDays / DAYS_PER_MONTH),
    eirPerDay,
    eirPerMonthSimple: eirPerDay * DAYS_PER_MONTH,
    eirPerMonthCompounded: Math.pow(1 + eirPerDay, DAYS_PER_MONTH) - 1,
    schedule,
  };

  // ISO dates compare correctly as strings, and this has no time-zone dependence.
  if (input.bookedOn < COVERAGE.appliesToLoansFrom) {
    return { status: "before_effective_date", numbers };
  }

  const coverage = assessCoverage(input, tenorDays);
  const rawNominal: Verdict =
    numbers.nominalPerMonth > CEILINGS.nominalPerMonth + NUMERIC_TOLERANCE ? "OVER" : "WITHIN";
  const rawEir = eirVerdict(eirPerDay, CEILINGS.effectivePerMonth + NUMERIC_TOLERANCE);
  const rawTotalCost: Verdict =
    numbers.totalCostRatio > CEILINGS.totalCostRatio + NUMERIC_TOLERANCE ? "OVER" : "WITHIN";

  const checks: Record<CheckId, Check> = {
    nominal: {
      id: "nominal",
      actual: numbers.nominalPerMonth,
      cap: CEILINGS.nominalPerMonth,
      raw: rawNominal,
      state: applyCoverage(rawNominal, coverage.state),
    },
    eir: {
      id: "eir",
      actual: numbers.eirPerMonthSimple,
      cap: CEILINGS.effectivePerMonth,
      raw: rawEir,
      state: applyCoverage(rawEir, coverage.state),
    },
    totalCost: {
      id: "totalCost",
      actual: numbers.totalCostRatio,
      cap: CEILINGS.totalCostRatio,
      raw: rawTotalCost,
      state: applyCoverage(rawTotalCost, coverage.state),
    },
  };

  const states = Object.values(checks)
    .map((c) => c.state)
    .filter((s): s is Verdict => s !== null);
  const overall = states.length
    ? states.reduce((worst, s) => (SEVERITY[s] > SEVERITY[worst] ? s : worst))
    : null;

  return { status: "ok", numbers, coverage, checks, overall };
}

export type PresetId = "7d" | "14d" | "30d" | "4w";

/** The quick-fill buttons. Their words are copy.presets. */
export const PRESETS: {
  id: PresetId;
  patch: Partial<LoanInput>;
}[] = [
  {
    id: "7d",
    patch: {
      frequency: "weekly",
      paymentCount: 1,
      firstDueDays: 7,
      followUpDay: 4,
    },
  },
  {
    id: "14d",
    patch: {
      frequency: "biweekly",
      paymentCount: 1,
      firstDueDays: 14,
      followUpDay: 7,
    },
  },
  {
    id: "30d",
    patch: {
      frequency: "monthly",
      paymentCount: 1,
      firstDueDays: 30,
      followUpDay: null,
    },
  },
  {
    id: "4w",
    patch: {
      frequency: "weekly",
      paymentCount: 4,
      firstDueDays: 7,
      followUpDay: 4,
    },
  },
];
