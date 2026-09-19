/**
 * On-screen wording that depends on rules.ts or on a calculation state. Anything a
 * legal number goes into is built here from rules.ts, never typed out.
 */
import {
  capPercent,
  EIR_CAP_TEXT,
  NOMINAL_CAP_TEXT,
  PENALTY_CAP_TEXT,
  PRINCIPAL_LIMIT_TEXT,
  TENOR_LIMIT_TEXT,
  TOTAL_COST_CAP_TEXT,
} from "./limits.ts";
import type { CannotComputeReason, CheckId, Coverage, LoanNumbers } from "./loan-math.ts";
import {
  COVERAGE,
  CEILINGS,
  DAYS_PER_MONTH,
  OTHER_FEES_EXAMPLES,
  RULES_AS_OF,
  SOURCE,
  type Verdict,
} from "./rules.ts";
import { cap, type Segments } from "./segments.ts";
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

/** "Batay sa SEC MC No. 14, s. 2025 · as of 2026-09-19". <BasisLine> links the circular. */
export const BASIS_LEAD = "Batay sa";
export const BASIS_AS_OF = `as of ${RULES_AS_OF}`;
export const BASIS_TEXT = `${BASIS_LEAD} ${SOURCE.id} · ${BASIS_AS_OF}`;

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

/** Each ceiling as a cap segment, so it can only be shown as a link to the source. */
export const CEILING_CAP_TEXT: Record<CheckId, Segments> = {
  eir: [cap(EIR_CAP_TEXT)],
  nominal: [cap(NOMINAL_CAP_TEXT)],
  totalCost: [cap(TOTAL_COST_CAP_TEXT)],
};

export const DISCLAIMER =
  "Illustration lang. Ang institusyon ang magbibigay ng opisyal na EIR sa disclosure statement. Hindi ito legal advice at hindi tumutukoy sa anumang lender.";

export const FEE_LABEL = "Mga fee na binawas sa natanggap";

/** Names the fees so a borrower recognizes theirs; the list comes from rules.ts. */
export const FEE_HINT = `Halimbawa: ${OTHER_FEES_EXAMPLES.join(", ")}. Ilagay ang kabuuan ng lahat ng binawas. 0 kung buo ang natanggap. Kasama sa EIR.`;

/** The optional email form, shown below the result and never required for it. */
export const EMAIL_HEADING = "Gusto mo ng libreng checklist at abiso kapag may bagong rules?";
export const EMAIL_NOTE =
  "Opsyonal. Hindi mo ito kailangan para makita ang resulta mo, at hindi kasama rito ang anumang numerong inilagay mo.";
export const EMAIL_LABEL = "Email";
export const CONSENT_BEFORE =
  "Pumapayag akong padalhan ng email para sa checklist at mga abiso. Nabasa ko ang ";
export const CONSENT_AFTER = ".";
export const EMAIL_SUBMIT = "Ipadala";
export const EMAIL_SENDING = "Ipinapadala…";
export const EMAIL_DONE = "Salamat! Padadalhan ka namin ng checklist.";
export const EMAIL_FAILED = "Hindi naipadala. Subukan ulit mamaya.";

export const GUIDE_TITLE = "Gusto mo ng mas malalim na gabay?";
export const GUIDE_LINK_LABEL = "Kunin ang ₱99 na gabay";

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

export const EYEBROW = `Philippines · ${SOURCE.id}`;

/** Shown under the input card, where the numbers are typed. */
export const NO_STORAGE_NOTE = "Hindi namin sine-save o ipinapadala ang mga numerong inilagay mo.";

export const PENALTY_HINT: Segments = [
  "Hindi kasama sa EIR; kasama sa ",
  cap(capPercent(CEILINGS.totalCostRatio)),
  " total-cost cap.",
];

export const DATE_HINT = `Para sa loans na pinasok, inayos o na-renew simula ${formatDateFil(COVERAGE.appliesToLoansFrom)}.`;

export const LEGAL_FOOT_TITLE = "Batayan";

/**
 * The "Batayan" paragraphs: a bold term, then its text. Only what rules.ts records. The
 * term of the first is the circular itself, so it is the link; caps inside the text are
 * cap segments and link too.
 */
export const LEGAL_FOOT: { term: string; termIsSource?: boolean; segments: Segments }[] = [
  {
    term: SOURCE.id,
    termIsSource: true,
    segments: [
      `— epektibo simula ${formatDateFil(SOURCE.effective)}. Para sa unsecured, general-purpose loans ng lending at financing companies na hindi lalampas sa `,
      cap(PRINCIPAL_LIMIT_TEXT),
      " at hindi hihigit sa ",
      cap(TENOR_LIMIT_TEXT),
      ".",
    ],
  },
  {
    term: "Mga ceiling",
    segments: [
      "— nominal ",
      cap(NOMINAL_CAP_TEXT),
      ", EIR ",
      cap(EIR_CAP_TEXT),
      ", at kabuuang gastos na hindi lalampas sa ",
      cap(TOTAL_COST_CAP_TEXT),
      ".",
    ],
  },
  {
    term: "Hindi sinusuri ng tool na ito",
    segments: [
      "ang ceiling sa late penalty (",
      cap(PENALTY_CAP_TEXT),
      "), dahil kailangan nito ng bilang ng araw na late.",
    ],
  },
  {
    term: "RA No. 3765 (Truth in Lending Act)",
    segments: [
      `— ang batayan ng pagkuwenta ng EIR ayon sa circular. Hindi tinukoy ng circular kung ×${DAYS_PER_MONTH} o compounded ang buwanang rate, kaya ipinapakita namin ang pareho.`,
    ],
  },
];

export const HOW_METHOD_TEXT = `Ang EIR ay ang rate kada araw na nagpapantay sa natanggap mo at sa lahat ng bayad mo, hindi kasama ang late penalty. Hindi sinasabi ng circular kung paano gagawing buwanan ang rate kada araw — ×${DAYS_PER_MONTH} o compounded — kaya ipinapakita namin ang pareho.`;
