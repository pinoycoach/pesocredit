/**
 * The Filipino copy: what the page said before English first (DECISIONS N34), kept for the
 * future Tagalog version. Every legal number is built from rules.ts, never typed here.
 */
import type { CoverageReason } from "../loan-math.ts";
import { capPercent, pesoWhole } from "../limits.ts";
import {
  CEILINGS,
  COVERAGE,
  DAYS_PER_MONTH,
  OTHER_FEES_EXAMPLES,
  RULES_AS_OF,
  SOURCE,
} from "../rules.ts";
import { cap, type Segments } from "../segments.ts";
import { formatPct, formatPeso } from "../utils.ts";
import type { Copy } from "./types.ts";

const MONTHS = [
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
function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

// Caps and limits from rules.ts, in these words.
const NOMINAL_CAP_TEXT = `${capPercent(CEILINGS.nominalPerMonth)} kada buwan`;
const EIR_CAP_TEXT = `${capPercent(CEILINGS.effectivePerMonth)} kada buwan`;
const TOTAL_COST_CAP_TEXT = `${capPercent(CEILINGS.totalCostRatio)} ng inutang`;
const PENALTY_CAP_TEXT = `${capPercent(CEILINGS.penaltyPerMonth)} kada buwan`;
const PRINCIPAL_LIMIT_TEXT = pesoWhole(COVERAGE.principalMax);
const TENOR_LIMIT_TEXT = `${COVERAGE.tenorMonthsMax} na buwan`;

const NO_STORAGE_NOTE = "Hindi namin sine-save o ipinapadala ang mga numerong inilagay mo.";
const PLACEHOLDER_OPEN = "[ILAGAY DITO:";
const blank = (what: string) => `${PLACEHOLDER_OPEN} ${what}]`;
const PRIVACY_TITLE = "Patakaran sa Privacy";

function coverageReason(reason: CoverageReason): Segments {
  switch (reason.kind) {
    case "lender":
      return ["Ang ceiling ay para sa lending at financing companies — hindi sa bangko."];
    case "secured":
      return ["Ang ceiling ay para sa unsecured loans."];
    case "purpose":
      return ["Ang ceiling ay para sa general-purpose loans."];
    case "principal":
      return [
        `Ang principal na ${pesoWhole(reason.principal)} ay lampas sa `,
        cap(PRINCIPAL_LIMIT_TEXT),
        " na saklaw.",
      ];
    case "tenorOver":
      return [`Ang tenor na ${reason.tenorDays} araw ay lampas sa `, cap(TENOR_LIMIT_TEXT), "."];
    case "tenorMaybe":
      return [
        `Ang tenor na ${reason.tenorDays} araw ay maaaring pasok pa sa `,
        cap(TENOR_LIMIT_TEXT),
        ", depende sa kalendaryo. Maaaring sakop.",
      ];
  }
}

export const fil: Copy = {
  htmlLang: "fil",
  formatDate,

  documentTitle: "Tunay na Interes",
  metaDescription:
    "Libre. Ilagay ang loan amount, hulog, at bilang ng bayad. Tingnan ang EIR laban sa naka-publish na ceiling sa Pilipinas.",
  eyebrow: `Philippines · ${SOURCE.id}`,
  pageTitle: "Tunay na Interes",
  pageIntro:
    "Ilagay ang inutang, ang hulog, at ilang beses magbabayad. Kasama ang 7-araw na loan. Ang tool ay nagkukuwenta ng effective interest (EIR) at tinitingnan kung sakop ka ng naka-publish na ceiling — hindi nagnangalan ng lender, hindi nagpapayo kung paano magbayad.",

  inputsTitle: "Mga numero ng loan mo",
  inputsDescription: "Kunin sa disclosure statement, resibo, o app screen — hindi sa advertisement.",
  presets: {
    "7d": { label: "7 araw", hint: "Isang bayad sa ika-7 araw" },
    "14d": { label: "14 araw", hint: "Isang bayad sa ika-14" },
    "30d": { label: "30 araw · 1 bayad", hint: "Isang bayad sa dulo ng buwan" },
    "4w": { label: "4 na hulog", hint: "Lingguhan, apat na bayad" },
  },
  principalLabel: "Inutang (principal)",
  principalHint: "Face amount sa kontrata — hindi ang natanggap kung may binawas.",
  feeLabel: "Mga fee na binawas sa natanggap",
  feeHint: `Halimbawa: ${OTHER_FEES_EXAMPLES.join(", ")}. Ilagay ang kabuuan ng lahat ng binawas. 0 kung buo ang natanggap. Kasama sa EIR.`,
  paymentLabel: "Hulog bawat bayad",
  paymentHint: "Ang sinusulat sa schedule — isang numero lang kung isang bayad sa dulo.",
  countLabel: "Ilang hulog",
  firstDueLabel: "Unang due (araw)",
  firstDueHint: "7 = due sa ika-7 araw",
  frequencyHeading: "Dalas ng hulog",
  frequency: {
    daily: "Araw-araw",
    weekly: "Bawat 7 araw",
    biweekly: "Bawat 14 araw",
    monthly: `Buwanan (~${DAYS_PER_MONTH} araw)`,
  },
  penaltyLabel: "Late penalty na siningil (kung meron)",
  penaltyHint: [
    "Hindi kasama sa EIR; kasama sa ",
    cap(capPercent(CEILINGS.totalCostRatio)),
    " total-cost cap.",
  ],
  followUpLabel: "Tala: unang follow-up",
  followUpHint:
    "Opsyonal. Ilagay kung kailan unang tumawag o nag-message — hal. araw 4 sa 7-araw na loan. Hindi ito interes at hindi paratang sa sinuman.",
  followUpDayLabel: "Araw ng unang follow-up",
  coverageHeading: "Saklaw ng ceiling",
  lenderToggle: "Lending / financing company (hindi bangko)",
  unsecuredToggle: "Unsecured, general-purpose",
  dateLabel: "Petsa ng kontrata / renewal",
  dateHint: `Para sa loans na pinasok, inayos o na-renew simula ${formatDate(COVERAGE.appliesToLoansFrom)}.`,
  noStorageNote: NO_STORAGE_NOTE,

  cannotCompute: {
    invalid_input: "Maglagay ng principal at hulog para makita ang totoong gastos.",
    invalid_date: "Ilagay ang petsa ng kontrata para makita ang resulta.",
    fee_not_less_than_principal:
      "Hindi makalkula: ang binawas na fee ay hindi dapat katumbas o lampas sa inutang. Pakisuri ang mga numero.",
    payments_below_principal:
      "Hindi makalkula: mas mababa ang kabuuang hulog kaysa sa natanggap mo. Pakisuri ang mga numero.",
    no_solution: "Hindi makalkula ang rate sa mga numerong ito. Pakisuri ang mga numero.",
  },
  headline: (n) =>
    `Ang totoong gastos mo: ${formatPct(n.eirPerMonthSimple)} kada buwan. Sa araw ${n.tenorDays}, ${formatPeso(n.totalPayments)} ang kabuuang babayaran mo.`,
  // N41's late-penalty sentence and row have no approved Filipino yet (N40); until then this
  // headline still counts the penalty in its total.
  penaltySentence: null,
  headlineMethodNote: `Ito ay ang rate kada araw × ${DAYS_PER_MONTH}. Nasa "Paano kinuwenta" ang compounded na bersyon.`,
  oldLoanNotice: `Ang tool na ito ay para sa loans simula ${formatDate(COVERAGE.appliesToLoansFrom)}.`,
  comparisonTitle: "Kumpara sa naka-publish na ceiling",
  basisLead: "Batay sa",
  basisAsOf: `as of ${RULES_AS_OF}`,
  coverageText: {
    COVERED: "Sakop ng ceiling ang loan na ito.",
    MAYBE: "Maaaring sakop ang loan na ito.",
    NOT_COVERED: "Hindi sakop ng ceiling ang loan na ito.",
  },
  coverageReason,
  ceilingLabel: {
    eir: "Effective interest rate (EIR) kada buwan",
    nominal: "Nominal na interes kada buwan",
    totalCost: "Kabuuang gastos kumpara sa inutang",
  },
  stateText: {
    WITHIN: "Nasa loob ng ceiling",
    GRAY: "Malapit sa ceiling",
    OVER: "Lampas sa ceiling",
  },
  unsureCoverageBadge: "Hindi tiyak kung sakop",
  rowNumberLabel: "Numero mo:",
  rowCeilingLabel: "Ceiling:",
  ceilingCapText: {
    eir: [cap(EIR_CAP_TEXT)],
    nominal: [cap(NOMINAL_CAP_TEXT)],
    totalCost: [cap(TOTAL_COST_CAP_TEXT)],
  },
  grayEirText:
    "Malapit sa ceiling — depende kung paano kinukuwenta ang buwanang rate. Hindi malinaw sa circular.",
  unsureCoverageText:
    "Maaaring lumampas ang numero mo, pero hindi tiyak kung sakop ang loan na ito.",
  // Added in English first (F1, N1); no Filipino wording is approved yet.
  comparisonNote: null,
  disclaimer:
    "Illustration lang. Ang institusyon ang magbibigay ng opisyal na EIR sa disclosure statement. Hindi ito legal advice at hindi tumutukoy sa anumang lender.",

  howTitle: "Paano kinuwenta",
  howComputedRows: (n) => [
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
  ],
  penaltyRowLabel: null,
  howMethodText: `Ang EIR ay ang rate kada araw na nagpapantay sa natanggap mo at sa lahat ng bayad mo, hindi kasama ang late penalty. Hindi sinasabi ng circular kung paano gagawing buwanan ang rate kada araw — ×${DAYS_PER_MONTH} o compounded — kaya ipinapakita namin ang pareho.`,

  calendarTitle: "Kalendaryo ng loan",
  calendarSubtitle: (days, payments) => `${days}-araw na tenor · ${payments} hulog`,
  timelineDay0: "Araw 0",
  timelineReceived: (amount) => `Natanggap · ${amount}`,
  timelineDay: (day) => `Araw ${day}`,
  timelinePayment: (n, amount) => `Hulog ${n} · ${amount}`,
  timelineFollowUp: "Unang follow-up (tala mo)",
  timelineDayCell: "Araw",
  timelineCellReceived: "Pera",
  timelineCellDue: "Due",
  timelineCellFollowUp: "Follow-up",
  timelineLegend: "Araw 0 = natanggap ang pera. Due = araw ng hulog ayon sa inilagay mo.",
  timelineLegendFollowUp: (day) =>
    ` Follow-up = araw ${day} (opsyonal na tala — hindi charge, hindi hatol sa lender).`,
  scheduleTitle: "Iskedyul",
  scheduleDay: "Araw",
  schedulePayment: "Bayad",
  scheduleRelease: "Release",

  legalFootTitle: "Batayan",
  legalFoot: [
    {
      term: SOURCE.id,
      termIsSource: true,
      segments: [
        `— epektibo simula ${formatDate(SOURCE.effective)}. Para sa unsecured, general-purpose loans ng lending at financing companies na hindi lalampas sa `,
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
  ],

  emailHeading: "Gusto mo ng libreng checklist at abiso kapag may bagong rules?",
  emailNote:
    "Opsyonal. Hindi mo ito kailangan para makita ang resulta mo, at hindi kasama rito ang anumang numerong inilagay mo.",
  emailLabel: "Email",
  consentBefore:
    "Pumapayag akong padalhan ng email para sa checklist at mga abiso. Nabasa ko ang ",
  consentAfter: ".",
  emailSubmit: "Ipadala",
  emailSending: "Ipinapadala…",
  emailDone: "Salamat! Padadalhan ka namin ng checklist.",
  emailFailed: "Hindi naipadala. Subukan ulit mamaya.",
  guideTitle: "Gusto mo ng mas malalim na gabay?",
  guideLinkLabel: "Kunin ang ₱99 na gabay",

  placeholderOpen: PLACEHOLDER_OPEN,
  privacyTitle: PRIVACY_TITLE,
  privacyDraftBanner:
    "DRAFT — para sa pagsusuri ng abogado. Hindi pa ito pinal at hindi pa dapat ituring na opisyal na patakaran.",
  backToCalculator: "Balik sa calculator",
  privacyLinkLabel: "Patakaran sa Privacy",
  privacySections: (contactEmail) => [
    {
      heading: "Ano ang kinokolekta namin",
      paragraphs: [
        "Ang email address mo at ang oras ng pagpayag mo. Ibinibigay mo lang ang mga ito sa opsyonal na form sa calculator, at kinokolekta lang namin kung pumayag ka (naka-tsek ang kahon ng pagpayag). Iyon lang.",
      ],
    },
    {
      heading: "Ano ang hindi namin kinokolekta",
      paragraphs: [
        `${NO_STORAGE_NOTE} Ang pagkuwenta ay ginagawa sa device mo, at hindi kailanman isinasama ang mga numerong iyon sa email form.`,
        "Wala kaming account, at walang analytics o tracking sa site na ito. Ang site mismo ay hindi nagse-set ng cookies, at ang mga font ay galing sa sarili naming site, hindi sa ibang website.",
        "Kapag pinindot mo ang link sa SEC (sec.gov.ph), aalis ka sa site na ito at ang website ng SEC na ang may hawak ng pagbisita mo.",
      ],
    },
    {
      heading: "Bakit namin ito kinokolekta",
      paragraphs: [
        "Para ipadala ang libreng checklist at ang mga abiso tungkol sa bagong rules na hiniling mo, at para may talaan kami na pumayag ka.",
      ],
    },
    {
      heading: "Kanino napupunta ang email mo",
      paragraphs: [
        `Ipinapadala ito sa aming email service provider, ${blank("pangalan ng email service provider")}, para sila ang magpadala ng mga email. Ang ipinapadala lang ay ang email address at ang oras ng pagpayag mo.`,
        `Ang site na ito ay naka-host sa ${blank("pangalan ng hosting provider")}. ${blank("para sa abogado: ilarawan kung anong technical na detalye ng pagbisita, tulad ng IP address, ang maaaring itala ng hosting provider")}`,
      ],
    },
    {
      heading: "Gaano katagal namin itong iniingatan",
      paragraphs: [blank("gaano katagal iniingatan ang email at oras ng pagpayag")],
    },
    {
      heading: "Paano mag-unsubscribe o magpabura ng email",
      paragraphs: [
        `Gamitin ang unsubscribe link sa bawat email na matatanggap mo. ${blank("kumpirmahin na may unsubscribe link ang napiling email service provider")}`,
        `Puwede ka ring sumulat sa ${contactEmail || blank("email address para sa mga kahilingan")} at hihilingin naming burahin ang email mo.`,
      ],
    },
    {
      heading: "Ang mga karapatan mo",
      paragraphs: [blank("para sa abogado: ilagay dito ang mga karapatan ng user ayon sa batas at kung paano ito gagamitin")],
    },
    {
      heading: "Makipag-ugnayan",
      paragraphs: [
        `${blank("pangalan ng operator ng site")} · ${contactEmail || blank("email address ng contact")}`,
      ],
    },
  ],
  privacyHeadTitleDraft: `${PRIVACY_TITLE} (DRAFT) · Tunay na Interes`,
  privacyHeadTitleFinal: `${PRIVACY_TITLE} · Tunay na Interes`,

  errorHeading: "Something went wrong",
  errorFallback: "An unexpected error occurred. Try reloading the page.",
};
