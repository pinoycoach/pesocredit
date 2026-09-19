/**
 * On-screen wording that depends on rules.ts or on a calculation state. Anything a
 * legal number goes into is built here from rules.ts, never typed out.
 */
import type { CannotComputeReason, CheckId, Coverage, LoanNumbers } from "./loan-math.ts";
import {
  CEILINGS,
  COVERAGE,
  DAYS_PER_MONTH,
  OTHER_FEES_EXAMPLES,
  SOURCE,
  type Verdict,
} from "./rules.ts";
import { formatPct, formatPeso } from "./utils.ts";

const MONTHS_FIL = [
  "Enero",
  "Pebrero",
  "Marso",
  "Abril",
  "Mayo",
  "Hunyo",
  "Hulyo",
  "Agosto",
  "Setyembre",
  "Oktubre",
  "Nobyembre",
  "Disyembre",
];

/** "2026-04-01" becomes "1 Abril 2026". */
export function formatDateFil(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS_FIL[month - 1]} ${year}`;
}

/** A ceiling as a whole-number percent: 0.06 becomes "6%", 1 becomes "100%". */
const capPercent = (fraction: number) => `${Number((fraction * 100).toFixed(2))}%`;

export const OLD_LOAN_NOTICE = `Ang tool na ito ay para sa loans simula ${formatDateFil(COVERAGE.appliesToLoansFrom)}.`;

export const CANNOT_COMPUTE_TEXT: Record<CannotComputeReason, string> = {
  invalid_input: "Maglagay ng principal at hulog para makita ang totoong gastos.",
  invalid_date: "Ilagay ang petsa ng kontrata para makita ang resulta.",
  fee_not_less_than_principal:
    "Hindi makalkula: ang binawas na fee ay hindi dapat katumbas o lampas sa inutang. Pakisuri ang mga numero.",
  payments_below_principal:
    "Hindi makalkula: mas mababa ang kabuuang hulog kaysa sa natanggap mo. Pakisuri ang mga numero.",
  no_solution: "Hindi makalkula ang rate sa mga numerong ito. Pakisuri ang mga numero.",
};

/** The headline: the true monthly cost, then what is paid and when. */
export function headline(n: LoanNumbers): string {
  return `Ang totoong gastos mo: ${formatPct(n.eirPerMonthSimple)} kada buwan. Sa araw ${n.tenorDays}, ${formatPeso(n.totalPayments)} ang kabuuang babayaran mo.`;
}

export const HEADLINE_METHOD_NOTE = `Ito ay ang rate kada araw × ${DAYS_PER_MONTH}. Nasa "Paano kinuwenta" ang compounded na bersyon.`;

export const GRAY_EIR_TEXT =
  "Malapit sa ceiling — depende kung paano kinukuwenta ang buwanang rate. Hindi malinaw sa circular.";

export const UNSURE_COVERAGE_TEXT =
  "Maaaring lumampas ang numero mo, pero hindi tiyak kung sakop ang loan na ito.";

/** Badge for a number that is over its ceiling but on a loan that may not be covered. */
export const UNSURE_COVERAGE_BADGE = "Hindi tiyak kung sakop";

export const COMPARISON_TITLE = "Kumpara sa naka-publish na ceiling";
export const COMPARISON_SOURCE = `Ayon sa ${SOURCE.id}`;

export const COVERAGE_TEXT: Record<Coverage, string> = {
  COVERED: "Sakop ng ceiling ang loan na ito.",
  MAYBE: "Maaaring sakop ang loan na ito.",
  NOT_COVERED: "Hindi sakop ng ceiling ang loan na ito.",
};

export const STATE_TEXT: Record<Verdict, string> = {
  WITHIN: "Nasa loob ng ceiling",
  GRAY: "Malapit sa ceiling",
  OVER: "Lampas sa ceiling",
};

export const CEILING_LABEL: Record<CheckId, string> = {
  eir: "Effective interest rate (EIR) kada buwan",
  nominal: "Nominal na interes kada buwan",
  totalCost: "Kabuuang gastos kumpara sa inutang",
};

export const CEILING_CAP_TEXT: Record<CheckId, string> = {
  eir: `${capPercent(CEILINGS.effectivePerMonth)} kada buwan`,
  nominal: `${capPercent(CEILINGS.nominalPerMonth)} kada buwan`,
  totalCost: `${capPercent(CEILINGS.totalCostRatio)} ng inutang`,
};

export const DISCLAIMER =
  "Illustration lang. Ang institusyon ang magbibigay ng opisyal na EIR sa disclosure statement. Hindi ito legal advice at hindi tumutukoy sa anumang lender.";

export const FEE_LABEL = "Mga fee na binawas sa natanggap";

/** Names the fees so a borrower recognizes theirs; the list comes from rules.ts. */
export const FEE_HINT = `Halimbawa: ${OTHER_FEES_EXAMPLES.join(", ")}. Ilagay ang kabuuan ng lahat ng binawas. 0 kung buo ang natanggap. Kasama sa EIR.`;

export const HOW_TITLE = "Paano kinuwenta";

/** Every figure behind the headline, both monthly readings included. */
export function howComputedRows(n: LoanNumbers): [label: string, value: string][] {
  return [
    ["Natanggap mo (net proceeds)", formatPeso(n.netProceeds)],
    [`Kabuuang babayaran (sa araw ${n.tenorDays})`, formatPeso(n.totalPayments)],
    [
      "Kabuuang gastos (interest + fees + penalty)",
      `${formatPeso(n.totalCost)} · ${formatPct(n.totalCostRatio)} ng inutang`,
    ],
    ["Rate kada araw (EIR)", formatPct(n.eirPerDay, 4)],
    [`Kada buwan, simple (rate kada araw × ${DAYS_PER_MONTH})`, formatPct(n.eirPerMonthSimple)],
    [
      `Kada buwan, compounded ((1 + rate kada araw) ^ ${DAYS_PER_MONTH} − 1)`,
      formatPct(n.eirPerMonthCompounded),
    ],
    ["Nominal na interes kada buwan", formatPct(n.nominalPerMonth)],
  ];
}

const pesoWhole = (n: number) => `₱${n.toLocaleString("en-PH")}`;

export const EYEBROW = `Philippines · ${SOURCE.id}`;

export const PENALTY_HINT = `Hindi kasama sa EIR; kasama sa ${capPercent(CEILINGS.totalCostRatio)} total-cost cap.`;

export const DATE_HINT = `Para sa loans na pinasok, inayos o na-renew simula ${formatDateFil(COVERAGE.appliesToLoansFrom)}.`;

export const LEGAL_FOOT_TITLE = "Batayan";

/** The "Batayan" paragraphs: a bold term, then its text. Only what rules.ts records. */
export const LEGAL_FOOT: { term: string; text: string }[] = [
  {
    term: SOURCE.id,
    text: `— epektibo simula ${formatDateFil(SOURCE.effective)}. Para sa unsecured, general-purpose loans ng lending at financing companies na hindi lalampas sa ${pesoWhole(COVERAGE.principalMax)} at hindi hihigit sa ${COVERAGE.tenorMonthsMax} na buwan.`,
  },
  {
    term: "Mga ceiling",
    text: `— nominal ${capPercent(CEILINGS.nominalPerMonth)} kada buwan, EIR ${capPercent(CEILINGS.effectivePerMonth)} kada buwan, at kabuuang gastos na hindi lalampas sa ${capPercent(CEILINGS.totalCostRatio)} ng inutang.`,
  },
  {
    term: "Hindi sinusuri ng tool na ito",
    text: `ang ceiling sa late penalty (${capPercent(CEILINGS.penaltyPerMonth)} kada buwan), dahil kailangan nito ng bilang ng araw na late.`,
  },
  {
    term: "RA No. 3765 (Truth in Lending Act)",
    text: `— ang batayan ng pagkuwenta ng EIR ayon sa circular. Hindi tinukoy ng circular kung ×${DAYS_PER_MONTH} o compounded ang buwanang rate, kaya ipinapakita namin ang pareho.`,
  },
];

export const HOW_METHOD_TEXT =
  "Ang EIR ay ang rate kada araw na nagpapantay sa natanggap mo at sa lahat ng bayad mo, hindi kasama ang late penalty. Hindi sinasabi ng circular kung paano gagawing buwanan ang rate kada araw — ×30 o compounded — kaya ipinapakita namin ang pareho.";
