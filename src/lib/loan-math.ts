/** Discounted-cash-flow EIR in the spirit of BSP M-2011-040 / Circular 730. */

export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

export const INTERVAL_DAYS: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: "Araw-araw",
  weekly: "Bawat 7 araw",
  biweekly: "Bawat 14 araw",
  monthly: "Buwanan (~30 araw)",
};

/** Covered-loan box (BSP Circ. 1133 / SEC MC 3 / SEC MC 14). */
export const COVERED_PRINCIPAL_MAX = 10_000;
export const COVERED_TENOR_DAYS_MAX = 120; // 4 months × 30-day month convention
export const NOMINAL_CAP_PER_MONTH = 0.06;
export const EIR_CAP_PER_MONTH_MC14 = 0.12; // loans from 1 Apr 2026
export const EIR_CAP_PER_MONTH_MC3 = 0.15; // covered loans booked before 1 Apr 2026
export const PENALTY_CAP_PER_MONTH = 0.05;
export const TOTAL_COST_CAP_RATIO = 1;
export const MC14_EFFECTIVE = new Date("2026-04-01T00:00:00+08:00");
export const DAYS_PER_MONTH = 30;

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
  /** Calendar date the loan was entered / renewed (local). */
  bookedOn: string;
  followUpDay: number | null;
};

export type Cashflow = { day: number; amount: number; label: string };

export type CeilingHit = {
  id: "nominal" | "eir" | "penalty" | "totalCost";
  label: string;
  cap: number;
  actual: number;
  over: boolean;
  unit: "pct-month" | "ratio";
  cite: string;
};

export type LoanResult = {
  netProceeds: number;
  tenorDays: number;
  totalPayments: number;
  financeCharge: number;
  totalCostVsPrincipal: number;
  totalCostRatio: number;
  nominalPerMonth: number;
  eirPerMonth: number;
  eirPerDay: number;
  periodRate: number;
  cashflows: Cashflow[];
  schedule: { n: number; day: number; amount: number }[];
  covered: boolean;
  coverageReasons: string[];
  eirCap: number;
  eirCapLabel: string;
  hits: CeilingHit[];
  anyOver: boolean;
  irrOk: boolean;
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

export function analyzeLoan(input: LoanInput): LoanResult | null {
  if (!(input.principal > 0) || !(input.payment >= 0) || !(input.paymentCount >= 1)) {
    return null;
  }
  const upfront = Math.max(0, input.upfrontFee);
  const netProceeds = input.principal - upfront;
  if (netProceeds <= 0) return null;

  const { schedule, tenorDays } = buildSchedule(input);
  const penalty = Math.max(0, input.penalty);
  const totalPayments = schedule.reduce((s, p) => s + p.amount, 0) + penalty;
  const financeCharge = totalPayments - netProceeds;
  const totalCostVsPrincipal = totalPayments - input.principal + (upfront > 0 ? upfront : 0);
  // Statutory total cost = interest + fees + penalties. If the fee was deducted,
  // it is still a cost. Cash out minus cash in, measured against face principal:
  const statutoryCost = totalPayments + (netProceeds < input.principal ? input.principal - netProceeds : 0) - input.principal;
  const totalCostRatio = statutoryCost / input.principal;

  const cashflows: Cashflow[] = [
    { day: 0, amount: netProceeds, label: "Natanggap" },
    ...schedule.map((p) => ({
      day: p.day,
      amount: -p.amount,
      label: `Hulog ${p.n}`,
    })),
  ];
  if (penalty > 0) {
    cashflows.push({
      day: tenorDays,
      amount: -penalty,
      label: "Penalty",
    });
  }

  // EIR excludes late penalties (BSP Circ. 1133 / SEC MC 14).
  const eirFlows: Cashflow[] = [
    { day: 0, amount: netProceeds, label: "Natanggap" },
    ...schedule.map((p) => ({
      day: p.day,
      amount: -p.amount,
      label: `Hulog ${p.n}`,
    })),
  ];

  const rDay = irrDaily(eirFlows);
  const irrOk = rDay !== null && Number.isFinite(rDay);
  const eirPerDay = irrOk ? (rDay as number) : NaN;
  const eirPerMonth = irrOk ? Math.pow(1 + eirPerDay, DAYS_PER_MONTH) - 1 : NaN;
  const periodRate = irrOk ? Math.pow(1 + eirPerDay, tenorDays) - 1 : NaN;

  const interestOnFace = Math.max(0, schedule.reduce((s, p) => s + p.amount, 0) - input.principal);
  const months = tenorDays / DAYS_PER_MONTH;
  const nominalPerMonth = months > 0 ? interestOnFace / input.principal / months : NaN;

  const coverageReasons: string[] = [];
  if (input.lenderKind !== "lending_or_financing") {
    coverageReasons.push("Ang ceiling ay para sa lending/financing companies at online lending platforms — hindi sa bangko.");
  }
  if (!input.unsecured) coverageReasons.push("Ang ceiling ay para sa unsecured loans.");
  if (!input.generalPurpose) coverageReasons.push("Ang ceiling ay para sa general-purpose loans.");
  if (input.principal > COVERED_PRINCIPAL_MAX) {
    coverageReasons.push(`Principal na ₱${input.principal.toLocaleString("en-PH")} ay lampas sa ₱10,000 na sakop.`);
  }
  if (tenorDays > COVERED_TENOR_DAYS_MAX) {
    coverageReasons.push(`Tenor na ${tenorDays} araw ay lampas sa 4 na buwan (≤120 araw sa 30-araw na buwan).`);
  }
  const covered = coverageReasons.length === 0;

  const booked = input.bookedOn ? new Date(input.bookedOn + "T12:00:00") : new Date();
  const useMc14 = !Number.isNaN(booked.getTime()) && booked >= MC14_EFFECTIVE;
  const eirCap = useMc14 ? EIR_CAP_PER_MONTH_MC14 : EIR_CAP_PER_MONTH_MC3;
  const eirCapLabel = useMc14
    ? "12% / buwan (SEC MC 14, s. 2025; simula 1 Abril 2026)"
    : "15% / buwan (BSP Circ. 1133 / SEC MC 3; covered loan bago 1 Abril 2026)";

  const EPS = 1e-6;
  const hits: CeilingHit[] = [
    {
      id: "nominal",
      label: "Nominal interest",
      cap: NOMINAL_CAP_PER_MONTH,
      actual: nominalPerMonth,
      over: covered && Number.isFinite(nominalPerMonth) && nominalPerMonth > NOMINAL_CAP_PER_MONTH + EPS,
      unit: "pct-month",
      cite: "6% / buwan — BSP Circ. 1133, s. 2021; SEC MC 3, s. 2022; SEC MC 14, s. 2025",
    },
    {
      id: "eir",
      label: "Effective interest (EIR)",
      cap: eirCap,
      actual: eirPerMonth,
      over: covered && Number.isFinite(eirPerMonth) && eirPerMonth > eirCap + EPS,
      unit: "pct-month",
      cite: eirCapLabel,
    },
    {
      id: "penalty",
      label: "Late penalty (sa hulog na overdue)",
      cap: PENALTY_CAP_PER_MONTH,
      actual: NaN,
      over: false,
      unit: "pct-month",
      cite: "5% / buwan sa outstanding scheduled amount due — Circ. 1133 / MC 3 / MC 14",
    },
    {
      id: "totalCost",
      label: "Kabuuang gastos vs. inutang",
      cap: TOTAL_COST_CAP_RATIO,
      actual: totalCostRatio,
      over: covered && Number.isFinite(totalCostRatio) && totalCostRatio > TOTAL_COST_CAP_RATIO + EPS,
      unit: "ratio",
      cite: "100% ng amount borrowed (interest + fees + penalties) — Circ. 1133 / MC 3 / MC 14",
    },
  ];

  return {
    netProceeds,
    tenorDays,
    totalPayments,
    financeCharge,
    totalCostVsPrincipal: statutoryCost,
    totalCostRatio,
    nominalPerMonth,
    eirPerMonth,
    eirPerDay,
    periodRate,
    cashflows,
    schedule,
    covered,
    coverageReasons,
    eirCap,
    eirCapLabel,
    hits,
    anyOver: hits.some((h) => h.over),
    irrOk,
  };
}

export type PresetId = "7d" | "14d" | "30d" | "4w";

export const PRESETS: {
  id: PresetId;
  label: string;
  hint: string;
  patch: Partial<LoanInput>;
}[] = [
  {
    id: "7d",
    label: "7 araw",
    hint: "Isang bayad sa ika-7 araw",
    patch: {
      frequency: "weekly",
      paymentCount: 1,
      firstDueDays: 7,
      followUpDay: 4,
    },
  },
  {
    id: "14d",
    label: "14 araw",
    hint: "Isang bayad sa ika-14",
    patch: {
      frequency: "biweekly",
      paymentCount: 1,
      firstDueDays: 14,
      followUpDay: 7,
    },
  },
  {
    id: "30d",
    label: "30 araw · 1 bayad",
    hint: "Isang bayad sa dulo ng buwan",
    patch: {
      frequency: "monthly",
      paymentCount: 1,
      firstDueDays: 30,
      followUpDay: null,
    },
  },
  {
    id: "4w",
    label: "4 na hulog",
    hint: "Lingguhan, apat na bayad",
    patch: {
      frequency: "weekly",
      paymentCount: 4,
      firstDueDays: 7,
      followUpDay: 4,
    },
  },
];
