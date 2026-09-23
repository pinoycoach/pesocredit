/**
 * Every word the app shows, as one typed object per language (DECISIONS N34). The live
 * language is chosen in one place, src/lib/copy.ts. A language file that misses a field, or
 * gets its shape wrong, fails typecheck, so a language kept for later cannot drift.
 *
 * Caps and limits from rules.ts stay Segments, so they can only be shown as links to the
 * published circular (segments.ts). No legal number is ever written in a language file: they
 * are built from rules.ts (rules-only.test.ts).
 */
import type {
  CannotComputeReason,
  CheckId,
  Coverage,
  CoverageReason,
  Frequency,
  LoanNumbers,
  PresetId,
} from "../loan-math.ts";
import type { Verdict } from "../rules.ts";
import type { Segments } from "../segments.ts";

export type PrivacySection = { heading: string; paragraphs: string[] };

export type LegalFootParagraph = { term: string; termIsSource?: boolean; segments: Segments };

export type Copy = {
  /** The <html lang> code. */
  htmlLang: string;
  /** A date written YYYY-MM-DD, as a reader in this language writes it. */
  formatDate: (iso: string) => string;

  // The page and its head tags.
  documentTitle: string;
  metaDescription: string;
  eyebrow: string;
  pageTitle: string;
  pageIntro: string;

  // The loan inputs.
  inputsTitle: string;
  inputsDescription: string;
  presets: Record<PresetId, { label: string; hint: string }>;
  principalLabel: string;
  principalHint: string;
  feeLabel: string;
  feeHint: string;
  paymentLabel: string;
  paymentHint: string;
  countLabel: string;
  firstDueLabel: string;
  firstDueHint: string;
  frequencyHeading: string;
  frequency: Record<Frequency, string>;
  penaltyLabel: string;
  penaltyHint: Segments;
  followUpLabel: string;
  followUpHint: string;
  followUpDayLabel: string;
  coverageHeading: string;
  lenderToggle: string;
  unsecuredToggle: string;
  dateLabel: string;
  dateHint: string;
  noStorageNote: string;

  // The result.
  cannotCompute: Record<CannotComputeReason, string>;
  headline: (n: LoanNumbers) => string;
  /**
   * Added to the headline when a late penalty is entered (N41): the headline's total counts only
   * the scheduled payments, all due by the day it names, and a penalty is paid late. Null where
   * no wording is approved yet; that language's headline then still counts the penalty itself.
   */
  penaltySentence: ((penalty: string) => string) | null;
  headlineMethodNote: string;
  oldLoanNotice: string;
  comparisonTitle: string;
  basisLead: string;
  basisAsOf: string;
  coverageText: Record<Coverage, string>;
  coverageReason: (reason: CoverageReason) => Segments;
  ceilingLabel: Record<CheckId, string>;
  stateText: Record<Verdict, string>;
  unsureCoverageBadge: string;
  rowNumberLabel: string;
  rowCeilingLabel: string;
  ceilingCapText: Record<CheckId, Segments>;
  grayEirText: string;
  unsureCoverageText: string;
  /**
   * Under the nominal row, which shows no verdict (N42): the limit applies to the rate in the
   * contract, and this number comes from the payments. Null where no wording is approved yet.
   */
  nominalNote: string | null;
  /**
   * Under the comparison rows: what the comparison does and does not tell (N36, no false
   * hope). Null where no wording is approved yet; then nothing is shown.
   */
  comparisonNote: string | null;
  disclaimer: string;

  // How it was calculated.
  howTitle: string;
  howComputedRows: (n: LoanNumbers) => [label: string, value: string][];
  /** The row that follows the payments due by the last day when a late penalty is entered (N41). Null as above. */
  penaltyRowLabel: string | null;
  howMethodText: string;

  // The loan calendar and the schedule.
  calendarTitle: string;
  calendarSubtitle: (days: number, payments: number) => string;
  timelineDay0: string;
  timelineReceived: (amount: string) => string;
  timelineDay: (day: number) => string;
  timelinePayment: (n: number, amount: string) => string;
  timelineFollowUp: string;
  timelineDayCell: string;
  timelineCellReceived: string;
  timelineCellDue: string;
  timelineCellFollowUp: string;
  timelineLegend: string;
  timelineLegendFollowUp: (day: number) => string;
  scheduleTitle: string;
  scheduleDay: string;
  schedulePayment: string;
  scheduleRelease: string;

  // The sources.
  legalFootTitle: string;
  legalFoot: LegalFootParagraph[];

  // The optional email form and guide link.
  emailHeading: string;
  emailNote: string;
  emailLabel: string;
  consentBefore: string;
  consentAfter: string;
  emailSubmit: string;
  emailSending: string;
  emailDone: string;
  emailFailed: string;
  guideTitle: string;
  guideLinkLabel: string;

  // The privacy page.
  placeholderOpen: string;
  privacyTitle: string;
  privacyDraftBanner: string;
  backToCalculator: string;
  privacyLinkLabel: string;
  /** The sections, with the page's one contact address (empty until supplied). */
  privacySections: (contactEmail: string) => PrivacySection[];
  privacyHeadTitleDraft: string;
  privacyHeadTitleFinal: string;

  // The error page.
  errorHeading: string;
  errorFallback: string;
};
