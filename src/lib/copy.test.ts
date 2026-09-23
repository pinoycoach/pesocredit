/**
 * Pins the wording of each language (DECISIONS N34): English, on screen, as approved in
 * docs/COPY-EN-PROPOSAL.md and changed by the independent review (N32); and the Filipino, kept
 * for the Tagalog version.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { computedRows, copy, headlineText, PENALTY_ROW_INDEX } from "./copy.ts";
import { en } from "./copy/en.ts";
import { fil } from "./copy/fil.ts";
import type { Copy } from "./copy/types.ts";
import {
  analyzeLoan,
  type CannotComputeReason,
  type CoverageReason,
  type LoanInput,
} from "./loan-math.ts";
import { OTHER_FEES_EXAMPLES, RULES_AS_OF, SOURCE } from "./rules.ts";
import { plainText, type Segments } from "./segments.ts";
import { srcRoot } from "./test-utils/source-strings.ts";

const base =(over: Partial<LoanInput> = {}): LoanInput => ({
  principal: 5_000,
  upfrontFee: 0,
  payment: 6_500,
  paymentCount: 1,
  frequency: "weekly",
  firstDueDays: 7,
  penalty: 0,
  unsecured: true,
  generalPurpose: true,
  lenderKind: "lending_or_financing",
  bookedOn: "2026-09-18",
  followUpDay: null,
  ...over,
});

function numbersFor(input: LoanInput) {
  const a = analyzeLoan(input);
  assert.notEqual(a.status, "cannot_compute");
  if (a.status === "cannot_compute") throw new Error("unreachable");
  return a.numbers;
}

const G6 = base({ principal: 10_000, payment: 2_560, paymentCount: 4 });
const G7 = base({ principal: 3_000, payment: 3_150, penalty: 2_900, frequency: "monthly", firstDueDays: 30 });

const capsIn = (segments: Segments) =>
  segments.filter((s) => typeof s !== "string").map((s) => plainText([s]));

const CANNOT_COMPUTE: CannotComputeReason[] = [
  "invalid_input",
  "invalid_date",
  "fee_not_less_than_principal",
  "payments_below_principal",
  "no_solution",
];

/** Each reason a loan may fall outside the ceilings, with sample numbers. */
const REASONS: CoverageReason[] = [
  { kind: "lender" },
  { kind: "secured" },
  { kind: "purpose" },
  { kind: "principal", principal: 10_001 },
  { kind: "tenorOver", tenorDays: 124 },
  { kind: "tenorMaybe", tenorDays: 121 },
];

/** Every cap-bearing text in a language, in a fixed order. */
const capsOf = (c: Copy) => [
  ...c.legalFoot.flatMap((p) => capsIn(p.segments)),
  ...capsIn(c.penaltyHint),
  ...capsIn(c.ceilingCapText.eir),
  ...capsIn(c.ceilingCapText.nominal),
  ...capsIn(c.ceilingCapText.totalCost),
  ...REASONS.flatMap((r) => capsIn(c.coverageReason(r))),
];

describe("the language on screen", () => {
  it("is English (N34), and the page says so", () => {
    assert.equal(copy, en);
    assert.equal(copy.htmlLang, "en");
  });
});

describe("en: headline", () => {
  it("states the reviewed headline: the estimated monthly cost, its method, the day and the total (G2)", () => {
    assert.equal(
      en.headline(numbersFor(base())),
      "Estimated cost: 114.58% a month (daily rate × 30). Total payments by day 7: ₱6,500.00.",
    );
  });

  it("counts the scheduled payments, all due by the last payment day (G6, G7)", () => {
    assert.equal(
      en.headline(numbersFor(G6)),
      "Estimated cost: 4.08% a month (daily rate × 30). Total payments by day 28: ₱10,240.00.",
    );
    assert.equal(
      en.headline(numbersFor(G7)),
      "Estimated cost: 4.88% a month (daily rate × 30). Total payments by day 30: ₱3,150.00.",
    );
  });

  it("says a late penalty in a sentence of its own, since it is paid after its due day (G7, N41)", () => {
    assert.equal(
      headlineText(numbersFor(G7), en),
      "Estimated cost: 4.88% a month (daily rate × 30). Total payments by day 30: ₱3,150.00. Plus the late penalty you entered: ₱2,900.00.",
    );
    // No penalty, no extra sentence (G2).
    assert.equal(headlineText(numbersFor(base()), en), en.headline(numbersFor(base())));
  });

  it("shows a late penalty in a row of its own, after the payments due by the last day; total cost keeps it (G7, N41)", () => {
    assert.deepEqual(computedRows(numbersFor(G7), en).slice(1, 4), [
      ["Total you pay (by day 30)", "₱3,150.00"],
      ["Late penalty you entered", "₱2,900.00"],
      ["Total cost (interest + fees + penalty)", "₱3,050.00 · 101.67% of the amount borrowed"],
    ]);
    // No penalty, no row (G2).
    assert.ok(!computedRows(numbersFor(base()), en).some(([label]) => label === en.penaltyRowLabel));
  });

  it("points to the compounded figure without repeating the headline's method (C45)", () => {
    assert.equal(en.headlineMethodNote, "The compounded version is under “How we calculated this”.");
  });

  it("leads with the simple monthly figure, not the compounded one (G3)", () => {
    const g3 = numbersFor(base({ upfrontFee: 65, payment: 5_070 }));
    assert.match(en.headline(g3), /^Estimated cost: 11\.59% a month \(daily rate × 30\)\./);
    assert.ok(!en.headline(g3).includes("12.26"));
  });
});

describe("en: the comparison with the published limit", () => {
  it("says each badge is about the number, and GRAY is a state of its own, never over (principle 2)", () => {
    assert.deepEqual(en.stateText, {
      WITHIN: "Your number is under the limit",
      GRAY: "Your number is close to the limit",
      OVER: "Your number is over the limit",
    });
  });

  it("names how each row's number is worked out (C58, C59, C79)", () => {
    // The EIR row shows the daily rate × 30, and its badge checks the compounded rate too
    // (rules.ts eirVerdict), so the label says both.
    assert.equal(en.ceilingLabel.eir, "EIR per month (daily rate × 30; the compounded rate is checked too)");
    assert.equal(en.ceilingLabel.nominal, "Nominal interest per month (from your payments)");
    const rows = en.howComputedRows(numbersFor(base())).map(([label]) => label);
    assert.ok(rows.includes("Nominal interest per month (from your payments)"));
  });

  it("explains GRAY with the approved sentence (C69)", () => {
    assert.equal(
      en.grayEirText,
      "Close to the limit. Worked out one way, your loan is under it. Worked out the other way, it is just over. The circular does not say which way to use.",
    );
  });

  it("says what the comparison does not tell (N1; N36, no false hope)", () => {
    assert.equal(
      en.comparisonNote,
      "This compares your numbers with a published limit. It does not tell you whether the loan or lender is safe, what you owe, or what happens next.",
    );
  });

  it("shows that note on the page: under the rows, whenever they are shown, above the disclaimer", () => {
    const card = readFileSync(join(srcRoot(), "components/result.tsx"), "utf8");
    const rows = card.indexOf("ROW_ORDER.map(");
    const note = card.indexOf("{copy.comparisonNote}");
    const disclaimer = card.indexOf("{copy.disclaimer}");
    assert.ok(rows > 0 && rows < note && note < disclaimer, "rows, then the note, then the disclaimer");
    assert.match(card, /\{coverage\.state !== "NOT_COVERED" && copy\.comparisonNote \? \(/, "shown with the rows");
    // Normal-size text, not small (review N32).
    const tag = /<p className="([^"]*)">\{copy\.comparisonNote\}<\/p>/.exec(card);
    assert.ok(tag, "the note is one paragraph");
    assert.doesNotMatch(tag[1], /\btext-(xs|sm)\b/, "the note is not small text");
  });

  it("disclaims legal advice and any specific lender (C71)", () => {
    assert.equal(
      en.disclaimer,
      "An illustration only. The lender's disclosure statement gives the official EIR. This is not legal advice and does not refer to any specific lender.",
    );
  });

  it("shows the basis line", () => {
    const basis = `${en.basisLead} ${SOURCE.id} · ${en.basisAsOf}`;
    assert.equal(basis, `Based on ${SOURCE.id} · as of ${RULES_AS_OF}`);
    assert.equal(basis, "Based on SEC MC No. 14, s. 2025 · as of 2026-09-19");
  });

  it("shows the exact notice for loans dated before the circular takes effect", () => {
    assert.equal(en.oldLoanNotice, "The limit comparison is for loans from 1 April 2026.");
  });

  it("builds the cap text from rules.ts", () => {
    assert.deepEqual(
      {
        eir: plainText(en.ceilingCapText.eir),
        nominal: plainText(en.ceilingCapText.nominal),
        totalCost: plainText(en.ceilingCapText.totalCost),
      },
      { eir: "12% a month", nominal: "6% a month", totalCost: "100% of the amount borrowed" },
    );
  });

  it("words the coverage reasons, marking the limits they mention", () => {
    assert.equal(plainText(en.coverageReason(REASONS[3])), "A principal of ₱10,001 is more than the ₱10,000 the limit covers.");
    assert.equal(plainText(en.coverageReason(REASONS[4])), "A term of 124 days is longer than 4 months.");
    assert.deepEqual(capsIn(en.coverageReason(REASONS[3])), ["₱10,000"]);
    assert.deepEqual(capsIn(en.coverageReason(REASONS[4])), ["4 months"]);
  });
});

describe("en: the rest of the page", () => {
  it("formats dates as day, month in words, year", () => {
    assert.equal(en.formatDate("2026-04-01"), "1 April 2026");
    assert.equal(en.formatDate("2026-12-25"), "25 December 2026");
    assert.equal(en.formatDate("2027-01-09"), "9 January 2027");
  });

  it("ends the follow-up legend with a full stop, like the legend before it (C94)", () => {
    assert.equal(en.timelineLegendFollowUp(4), " Follow-up = day 4 (your optional note).");
  });

  it("says one payment, or several", () => {
    assert.equal(en.calendarSubtitle(7, 1), "7-day term · 1 payment");
    assert.equal(en.calendarSubtitle(28, 4), "28-day term · 4 payments");
  });

  it("has a message for every reason a loan cannot be computed", () => {
    assert.deepEqual(Object.keys(en.cannotCompute).sort(), [...CANNOT_COMPUTE].sort());
    for (const reason of CANNOT_COMPUTE) assert.ok(en.cannotCompute[reason].length > 10, reason);
  });

  it("says, exactly, that the numbers are neither saved nor sent", () => {
    assert.equal(en.noStorageNote, "We don't save or send the numbers you enter.");
  });

  it("names every fee listed in rules.ts so a borrower can recognize theirs", () => {
    for (const fee of OTHER_FEES_EXAMPLES) assert.ok(en.feeHint.includes(fee), fee);
  });

  it("shows both monthly figures and the daily rate (G3)", () => {
    const rows = new Map(en.howComputedRows(numbersFor(base({ upfrontFee: 65, payment: 5_070 }))));
    const values = [...rows.values()];
    assert.ok(values.includes("0.3863%"), "daily rate");
    assert.ok(values.includes("11.59%"), "simple");
    assert.ok(values.includes("12.26%"), "compounded");
    assert.ok([...rows.keys()].some((k) => k.startsWith("Per month, simple")));
    assert.ok([...rows.keys()].some((k) => k.startsWith("Per month, compounded")));
  });

  it("marks all four limits and both coverage limits in Sources, the circular itself as the first link", () => {
    assert.deepEqual(
      en.legalFoot.flatMap((p) => capsIn(p.segments)),
      ["₱10,000", "4 months", "6% a month", "12% a month", "100% of the amount borrowed", "5% a month"],
    );
    assert.equal(en.legalFoot[0].term, SOURCE.id);
    assert.equal(en.legalFoot[0].termIsSource, true);
    assert.ok(en.legalFoot.slice(1).every((p) => !p.termIsSource));
  });
});

describe("both languages", () => {
  it("put the penalty row right after the payments due by the last day, where they have one (N41)", () => {
    const n = numbersFor(G7);
    for (const c of [en, fil]) {
      if (!c.penaltyRowLabel) continue;
      assert.equal(c.howComputedRows(n)[PENALTY_ROW_INDEX - 1][1], "₱3,150.00", `${c.htmlLang}: the row before it`);
    }
  });

  it("link the same caps and limits, with the same figures (only the words differ)", () => {
    const figures = (caps: string[]) => caps.map((c) => c.match(/₱?[\d,.]+%?/)?.[0] ?? `no figure in "${c}"`);
    assert.deepEqual(figures(capsOf(en)), figures(capsOf(fil)));
    assert.ok(capsOf(en).length >= 12, `only ${capsOf(en).length} caps compared`);
  });
});

describe("fil: copy", () => {
  it("shows the exact notice for loans dated before the circular takes effect", () => {
    assert.equal(fil.oldLoanNotice, "Ang tool na ito ay para sa loans simula 1 Abril 2026.");
  });

  it("formats dates in Filipino month names", () => {
    assert.equal(fil.formatDate("2026-04-01"), "1 Abril 2026");
    assert.equal(fil.formatDate("2026-12-25"), "25 Disyembre 2026");
    assert.equal(fil.formatDate("2027-01-09"), "9 Enero 2027");
  });

  it("has a message for every reason a loan cannot be computed", () => {
    assert.deepEqual(Object.keys(fil.cannotCompute).sort(), [...CANNOT_COMPUTE].sort());
    for (const reason of CANNOT_COMPUTE) assert.ok(fil.cannotCompute[reason].length > 10, reason);
  });

  it("has no wording approved yet for the note under the comparison (N1)", () => {
    assert.equal(fil.comparisonNote, null);
  });
});

describe("fil: headline", () => {
  it("states the true monthly cost, the day, and the total to pay (G2)", () => {
    assert.equal(
      fil.headline(numbersFor(base())),
      "Ang totoong gastos mo: 114.58% kada buwan. Sa araw 7, ₱6,500.00 ang kabuuang babayaran mo.",
    );
  });

  it("uses the last payment day and the total of every payment, penalty included (G6, G7)", () => {
    assert.equal(
      fil.headline(numbersFor(G6)),
      "Ang totoong gastos mo: 4.08% kada buwan. Sa araw 28, ₱10,240.00 ang kabuuang babayaran mo.",
    );
    assert.equal(
      fil.headline(numbersFor(G7)),
      "Ang totoong gastos mo: 4.88% kada buwan. Sa araw 30, ₱6,050.00 ang kabuuang babayaran mo.",
    );
  });

  it("leads with the simple monthly figure, not the compounded one (G3)", () => {
    const g3 = numbersFor(base({ upfrontFee: 65, payment: 5_070 }));
    assert.match(fil.headline(g3), /^Ang totoong gastos mo: 11\.59% kada buwan\./);
    assert.ok(!fil.headline(g3).includes("12.26"));
  });
});

describe("fil: Paano kinuwenta rows", () => {
  it("shows both monthly figures and the daily rate (G3)", () => {
    const rows = new Map(fil.howComputedRows(numbersFor(base({ upfrontFee: 65, payment: 5_070 }))));
    const values = [...rows.values()];
    assert.ok(values.includes("0.3863%"), "daily rate");
    assert.ok(values.includes("11.59%"), "simple");
    assert.ok(values.includes("12.26%"), "compounded");
    assert.ok([...rows.keys()].some((k) => k.startsWith("Kada buwan, simple")));
    assert.ok([...rows.keys()].some((k) => k.startsWith("Kada buwan, compounded")));
  });
});

describe("fil: every cap and limit on screen is a cap segment (so it links to the source)", () => {
  it("the Batayan text marks all four ceilings and both coverage limits", () => {
    const caps = fil.legalFoot.flatMap((paragraph) => capsIn(paragraph.segments));
    assert.deepEqual(caps, [
      "₱10,000",
      "4 na buwan",
      "6% kada buwan",
      "12% kada buwan",
      "100% ng inutang",
      "5% kada buwan",
    ]);
  });

  it("the circular itself is the link in the first Batayan paragraph", () => {
    assert.equal(fil.legalFoot[0].term, SOURCE.id);
    assert.equal(fil.legalFoot[0].termIsSource, true);
    assert.ok(fil.legalFoot.slice(1).every((p) => !p.termIsSource));
  });

  it("the penalty hint marks its 100% cap", () => {
    assert.deepEqual(capsIn(fil.penaltyHint), ["100%"]);
  });

  it("coverage reasons mark the peso and tenor limits they mention", () => {
    const big = analyzeLoan(base({ principal: 10_001, payment: 10_500 }));
    assert.equal(big.status, "ok");
    if (big.status !== "ok") return;
    assert.deepEqual(capsIn(fil.coverageReason(big.coverage.reasons[0])), ["₱10,000"]);
    assert.equal(plainText(fil.coverageReason(big.coverage.reasons[0])), "Ang principal na ₱10,001 ay lampas sa ₱10,000 na saklaw.");

    const long = analyzeLoan(base({ frequency: "daily", firstDueDays: 124, payment: 12_000 }));
    assert.equal(long.status, "ok");
    if (long.status !== "ok") return;
    assert.equal(plainText(fil.coverageReason(long.coverage.reasons[0])), "Ang tenor na 124 araw ay lampas sa 4 na buwan.");
    assert.deepEqual(capsIn(fil.coverageReason(long.coverage.reasons[0])), ["4 na buwan"]);
  });
});

describe("fil: the privacy promise under the calculator", () => {
  it("says, exactly, that the numbers are neither saved nor sent", () => {
    assert.equal(
      fil.noStorageNote,
      "Hindi namin sine-save o ipinapadala ang mga numerong inilagay mo.",
    );
  });
});

describe("fil: fee field", () => {
  it("names every fee listed in rules.ts so a borrower can recognize theirs", () => {
    assert.ok(OTHER_FEES_EXAMPLES.length > 0);
    for (const fee of OTHER_FEES_EXAMPLES) assert.ok(fil.feeHint.includes(fee), fee);
  });
});

describe("fil: ceiling wording", () => {
  it("builds the cap text from rules.ts", () => {
    assert.deepEqual(
      {
        eir: plainText(fil.ceilingCapText.eir),
        nominal: plainText(fil.ceilingCapText.nominal),
        totalCost: plainText(fil.ceilingCapText.totalCost),
      },
      { eir: "12% kada buwan", nominal: "6% kada buwan", totalCost: "100% ng inutang" },
    );
  });

  it("shows the basis line exactly as specified", () => {
    const basis = `${fil.basisLead} ${SOURCE.id} · ${fil.basisAsOf}`;
    assert.equal(basis, `Batay sa ${SOURCE.id} · as of ${RULES_AS_OF}`);
    assert.equal(basis, "Batay sa SEC MC No. 14, s. 2025 · as of 2026-09-19");
  });

  it("uses the exact GRAY sentence for the effective rate", () => {
    assert.equal(
      fil.grayEirText,
      "Malapit sa ceiling — depende kung paano kinukuwenta ang buwanang rate. Hindi malinaw sa circular.",
    );
  });

  it("says a loan is over a ceiling only as a plain statement about the number", () => {
    assert.deepEqual(fil.stateText, {
      WITHIN: "Nasa loob ng ceiling",
      GRAY: "Malapit sa ceiling",
      OVER: "Lampas sa ceiling",
    });
  });
});
