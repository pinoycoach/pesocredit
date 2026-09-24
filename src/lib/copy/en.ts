/**
 * The English copy, on screen first (DECISIONS N34), as approved in docs/COPY-EN-PROPOSAL.md
 * and then changed by the independent review (N32).
 * Written first for people already struggling with online-lending-app debt (N36): calm, plain,
 * short sentences; no shame or blame; no false hope; no advice; no accusation. Every legal
 * number is built from rules.ts, never typed here.
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
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-04-01" becomes "1 April 2026". */
function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

// Caps and limits from rules.ts, in these words.
const NOMINAL_CAP_TEXT = `${capPercent(CEILINGS.nominalPerMonth)} a month`;
const EIR_CAP_TEXT = `${capPercent(CEILINGS.effectivePerMonth)} a month`;
const TOTAL_COST_CAP_TEXT = `${capPercent(CEILINGS.totalCostRatio)} of the amount borrowed`;
const PENALTY_CAP_TEXT = `${capPercent(CEILINGS.penaltyPerMonth)} a month`;
const PRINCIPAL_LIMIT_TEXT = pesoWhole(COVERAGE.principalMax);
const TENOR_LIMIT_TEXT = `${COVERAGE.tenorMonthsMax} months`;

const NO_STORAGE_NOTE = "We don't save or send the numbers you enter.";
const PLACEHOLDER_OPEN = "[FILL IN:";
const blank = (what: string) => `${PLACEHOLDER_OPEN} ${what}]`;
const PRIVACY_TITLE = "Privacy Policy";
// Shared by the full privacy page and the v1 page (N45), word for word.
const PRIVACY_NOT_COLLECTED_HEADING = "What we don't collect";
const PRIVACY_NO_TRACKING =
  "We have no accounts, and no analytics or tracking on this site. The site itself sets no cookies, and our fonts come from our own site, not from other websites.";
const PRIVACY_SEC_LINK =
  "If you tap the link to the SEC (sec.gov.ph), you leave this site, and the SEC's website handles your visit.";
const PRIVACY_CONTACT_HEADING = "Contact";

function coverageReason(reason: CoverageReason): Segments {
  switch (reason.kind) {
    case "lender":
      return ["The SEC limits are for lending and financing companies, not banks."];
    case "secured":
      return ["The SEC limits are for unsecured loans."];
    case "purpose":
      return ["The SEC limits are for general-purpose loans."];
    case "principal":
      return [
        `A principal of ${pesoWhole(reason.principal)} is more than the `,
        cap(PRINCIPAL_LIMIT_TEXT),
        " the SEC limits cover.",
      ];
    case "tenorOver":
      return [`A term of ${reason.tenorDays} days is longer than `, cap(TENOR_LIMIT_TEXT), "."];
    case "tenorMaybe":
      return [
        `A term of ${reason.tenorDays} days may still be within `,
        cap(TENOR_LIMIT_TEXT),
        ", depending on the calendar. The SEC limits may apply.",
      ];
  }
}

export const en: Copy = {
  htmlLang: "en",
  formatDate,

  documentTitle: "Tunay na Interes · Check your loan against the SEC limits",
  metaDescription:
    "Free. Enter the loan amount, each payment and the number of payments. See the EIR next to the published limits in the Philippines.",
  eyebrow: `Philippines · ${SOURCE.id}`,
  pageTitle: "Tunay na Interes",
  pageIntro:
    "Enter what you borrowed, each payment, and how many payments. 7-day loans work too. This tool estimates the effective interest rate (EIR) from your numbers, and checks whether the published SEC limits apply to your loan and how your numbers compare with it. It names no lender and gives no advice on how to pay.",

  inputsTitle: "Your loan numbers",
  inputsDescription:
    "Take them from your disclosure statement, receipt or app screen, not from an ad.",
  presets: {
    "7d": { label: "7 days", hint: "One payment on day 7" },
    "14d": { label: "14 days", hint: "One payment on day 14" },
    "30d": { label: "30 days · 1 payment", hint: "One payment at the end of the month" },
    "4w": { label: "4 payments", hint: "Weekly, four payments" },
  },
  principalLabel: "Amount borrowed (principal)",
  principalHint: "The amount on your contract, not what you received if something was deducted.",
  feeLabel: "Fees deducted from what you received",
  feeHint: `For example: ${OTHER_FEES_EXAMPLES.join(", ")}. Enter the total of everything deducted. Enter 0 if you received the full amount. Included in the EIR.`,
  paymentLabel: "Amount of each payment",
  paymentHint: "As written on your schedule. Just one number if you pay once at the end.",
  countLabel: "Number of payments",
  firstDueLabel: "First payment due (day)",
  firstDueHint: "7 = due on day 7",
  frequencyHeading: "How often you pay",
  frequency: {
    daily: "Daily",
    weekly: "Every 7 days",
    biweekly: "Every 14 days",
    monthly: `Monthly (~${DAYS_PER_MONTH} days)`,
  },
  penaltyLabel: "Late penalty charged (if any)",
  penaltyHint: [
    "Not part of the EIR. It counts toward the ",
    cap(capPercent(CEILINGS.totalCostRatio)),
    " total-cost limit.",
  ],
  followUpLabel: "Note: first follow-up",
  followUpHint:
    "Optional, and not part of the calculation. The day you were first called or messaged about paying. For example, day 4 of a 7-day loan.",
  followUpDayLabel: "Day of the first follow-up",
  coverageHeading: "Do the SEC limits apply?",
  lenderToggle: "Lending or financing company (not a bank)",
  unsecuredToggle: "Unsecured, general-purpose loan",
  dateLabel: "Contract or renewal date",
  dateHint: `For loans taken out, restructured or renewed from ${formatDate(COVERAGE.appliesToLoansFrom)}.`,
  noStorageNote: NO_STORAGE_NOTE,

  cannotCompute: {
    invalid_input: "Enter the amount borrowed and a payment to see the cost.",
    invalid_date: "Enter the contract date to see the result.",
    fee_not_less_than_principal:
      "This tool can't calculate a rate when the deducted fees are equal to or more than the amount borrowed. Please check the numbers.",
    payments_below_principal:
      "We can't calculate this: your payments add up to less than what you received. Please check the numbers.",
    no_solution: "We can't work out a rate from these numbers. Please check them.",
  },
  headline: (n) =>
    `Estimated interest rate: ${formatPct(n.eirPerMonthSimple)} a month (daily rate × ${DAYS_PER_MONTH}). Total payments by day ${n.tenorDays}: ${formatPeso(n.scheduledPayments)}.`,
  penaltySentence: (penalty) => `Plus the late penalty you entered: ${penalty}.`,
  headlineMethodNote: "The compounded version is under “How we calculated this”.",
  oldLoanNotice: `The limit comparison is for loans taken out, restructured or renewed from ${formatDate(COVERAGE.appliesToLoansFrom)}.`,
  comparisonTitle: "Compared with the published limits",
  basisLead: "Based on",
  basisAsOf: `as of ${formatDate(RULES_AS_OF)}`,
  coverageText: {
    COVERED: "Based on your answers, the SEC limits apply to this loan.",
    MAYBE: "The SEC limits may apply to this loan.",
    NOT_COVERED: "Based on your answers, the SEC limits do not apply to this loan.",
  },
  coverageReason,
  ceilingLabel: {
    eir: `EIR per month (daily rate × ${DAYS_PER_MONTH}; the compounded rate is checked too)`,
    nominal: "Nominal interest per month (from your payments)",
    totalCost: "Total cost compared with the amount borrowed",
  },
  stateText: {
    WITHIN: "Your number is lower than the limit",
    GRAY: "Your number is close to the limit",
    OVER: "Your number is higher than the limit",
  },
  unsureCoverageBadge: "Not sure the limit applies",
  rowNumberLabel: "Your number:",
  rowCeilingLabel: "Limit:",
  ceilingCapText: {
    eir: [cap(EIR_CAP_TEXT)],
    nominal: [cap(NOMINAL_CAP_TEXT)],
    totalCost: [cap(TOTAL_COST_CAP_TEXT)],
  },
  grayEirText:
    "Close to the limit. Worked out one way, your number is lower than the limit. Worked out the other way, it is just higher. The circular does not say which way to use.",
  unsureCoverageText:
    "Your number may be higher than the limit, but it is not certain that the SEC limits apply to this loan.",
  nominalNote:
    "The nominal-interest limit applies to the interest rate written in your contract. Your number is worked out from your payments, so it can include fees added to them.",
  comparisonNote:
    "This compares your numbers with published limits. It does not tell you whether the loan or lender is safe, what you owe, or what happens next.",
  disclaimer:
    "An illustration only. The lender's disclosure statement gives the official EIR. This is not legal advice and does not refer to any specific lender.",

  howTitle: "How we calculated this",
  howComputedRows: (n) => [
    ["What you received (net proceeds)", formatPeso(n.netProceeds)],
    [`Total you pay (by day ${n.tenorDays})`, formatPeso(n.scheduledPayments)],
    [
      "Total cost (interest + fees + penalty)",
      `${formatPeso(n.totalCost)} · ${formatPct(n.totalCostRatio)} of the amount borrowed`,
    ],
    ["Daily rate (EIR)", formatPct(n.eirPerDay, 4)],
    [`Per month, simple (daily rate × ${DAYS_PER_MONTH})`, formatPct(n.eirPerMonthSimple)],
    [
      `Per month, compounded ((1 + daily rate) ^ ${DAYS_PER_MONTH} − 1)`,
      formatPct(n.eirPerMonthCompounded),
    ],
    ["Nominal interest per month (from your payments)", formatPct(n.nominalPerMonth)],
  ],
  penaltyRowLabel: "Late penalty you entered",
  howMethodText: `The EIR is the daily rate that balances what you received with everything you pay, not counting late penalties. The circular does not say how to turn the daily rate into a monthly one, ×${DAYS_PER_MONTH} or compounded, so we show both.`,

  calendarTitle: "Loan calendar",
  calendarSubtitle: (days, payments) =>
    `${days}-day term · ${payments} ${payments === 1 ? "payment" : "payments"}`,
  timelineDay0: "Day 0",
  timelineReceived: (amount) => `Received · ${amount}`,
  timelineDay: (day) => `Day ${day}`,
  timelinePayment: (n, amount) => `Payment ${n} · ${amount}`,
  timelineFollowUp: "First follow-up (your note)",
  timelineDayCell: "Day",
  timelineCellReceived: "Received",
  timelineCellDue: "Due",
  timelineCellFollowUp: "Follow-up",
  timelineLegend: "Day 0 = the day you got the money. Due = a payment day, as you entered it.",
  timelineLegendFollowUp: (day) =>
    ` Follow-up = day ${day} (your optional note).`,
  scheduleTitle: "Schedule",
  scheduleDay: "Day",
  schedulePayment: "Payment",
  scheduleRelease: "Received",

  legalFootTitle: "Sources",
  legalFoot: [
    {
      term: SOURCE.id,
      termIsSource: true,
      segments: [
        `In effect from ${formatDate(SOURCE.effective)}. For unsecured, general-purpose loans from lending and financing companies of up to `,
        cap(PRINCIPAL_LIMIT_TEXT),
        " and up to ",
        cap(TENOR_LIMIT_TEXT),
        ".",
      ],
    },
    {
      term: "The limits",
      segments: [
        "(the circular calls them ceilings) Nominal interest ",
        cap(NOMINAL_CAP_TEXT),
        ", EIR ",
        cap(EIR_CAP_TEXT),
        ", and a total cost of no more than ",
        cap(TOTAL_COST_CAP_TEXT),
        ".",
      ],
    },
    {
      term: "This tool does not check",
      segments: [
        "the late-penalty limit (",
        cap(PENALTY_CAP_TEXT),
        "), because that needs the number of days late.",
      ],
    },
    {
      term: "RA No. 3765 (Truth in Lending Act)",
      segments: [
        `The basis for calculating the EIR, according to the circular. The circular does not say whether the monthly rate is ×${DAYS_PER_MONTH} or compounded, so we show both.`,
      ],
    },
  ],

  emailHeading: "Want a free checklist, and a note when the rules change?",
  emailNote:
    "Optional. You don't need it to see your result, and none of the numbers you entered are included.",
  emailLabel: "Email",
  consentBefore: "I agree to get emails with the checklist and updates. I have read the ",
  consentAfter: ".",
  emailSubmit: "Send",
  emailSending: "Sending…",
  emailDone: "Thank you. We'll email you the checklist.",
  emailFailed: "It didn't go through. Please try again later.",
  guideTitle: "Want a fuller guide?",
  guideLinkLabel: "Get the ₱99 guide (in Tagalog)",

  placeholderOpen: PLACEHOLDER_OPEN,
  privacyTitle: PRIVACY_TITLE,
  privacyDraftBanner: "DRAFT. This is not final and is not yet our official policy.",
  backToCalculator: "Back to the calculator",
  privacyLinkLabel: "Privacy Policy",
  privacySections: (contactEmail) => [
    {
      heading: "What we collect",
      paragraphs: [
        "Your email address and the time you agreed. You give these only in the optional form on the calculator, and we collect them only if you agree (the consent box is ticked). That's all.",
      ],
    },
    {
      heading: PRIVACY_NOT_COLLECTED_HEADING,
      paragraphs: [
        `${NO_STORAGE_NOTE} The calculation happens on your device, and those numbers are never included in the email form.`,
        PRIVACY_NO_TRACKING,
        PRIVACY_SEC_LINK,
      ],
    },
    {
      heading: "Why we collect it",
      paragraphs: [
        "To send you the free checklist and the updates about new rules that you asked for, and to keep a record that you agreed.",
      ],
    },
    {
      heading: "Who receives your email address",
      paragraphs: [
        "When you send the form, our email service provider, Resend, emails your address and the time you agreed to the site's operator. The operator then adds your address to our mailing list, which is also kept with Resend, and Resend sends our emails. Only your email address and the time you agreed are sent.",
        `This site is hosted by Netlify. ${blank("for the lawyer: describe what technical details of a visit, such as the IP address, the hosting provider may record")}`,
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [blank("how long the email address and consent time are kept")],
    },
    {
      heading: "How to unsubscribe or have your email address deleted",
      paragraphs: [
        `Use the unsubscribe link in every email you receive. ${blank("confirm that emails sent through Resend include an unsubscribe link")}`,
        `You can also write to ${contactEmail || blank("email address for requests")} to ask us to delete your email address.`,
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [blank("for the lawyer: the user's rights under the law, and how to use them")],
    },
    {
      heading: PRIVACY_CONTACT_HEADING,
      paragraphs: [
        `${blank("name of the site operator")} · ${contactEmail || blank("contact email address")}`,
      ],
    },
  ],
  privacyV1: {
    lastUpdated: (isoDate) => `Last updated: ${formatDate(isoDate)}`,
    sections: (contactEmail) => [
      {
        heading: PRIVACY_NOT_COLLECTED_HEADING,
        paragraphs: [
          `${NO_STORAGE_NOTE} The calculation happens on your device.`,
          PRIVACY_NO_TRACKING,
          PRIVACY_SEC_LINK,
        ],
      },
      {
        heading: "Who hosts this site",
        paragraphs: [
          "This site is hosted by Netlify. Like any web host, Netlify records technical details of each visit, such as your IP address, to deliver and protect the site.",
        ],
      },
      {
        heading: PRIVACY_CONTACT_HEADING,
        paragraphs: [`Questions about this page: ${contactEmail || blank("contact email address")}.`],
      },
    ],
  },
  privacyHeadTitleDraft: `${PRIVACY_TITLE} (DRAFT) · Tunay na Interes`,
  privacyHeadTitleFinal: `${PRIVACY_TITLE} · Tunay na Interes`,

  errorHeading: "Something went wrong",
  errorFallback: "An unexpected error occurred. Try reloading the page.",
};
