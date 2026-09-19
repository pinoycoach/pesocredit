import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CANNOT_COMPUTE_TEXT,
  CEILING_CAP_TEXT,
  COMPARISON_SOURCE,
  formatDateFil,
  GRAY_EIR_TEXT,
  headline,
  howComputedRows,
  OLD_LOAN_NOTICE,
  STATE_TEXT,
} from "./copy.ts";
import { analyzeLoan, type CannotComputeReason, type LoanInput } from "./loan-math.ts";
import { SOURCE } from "./rules.ts";

const base = (over: Partial<LoanInput> = {}): LoanInput => ({
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

describe("copy", () => {
  it("shows the exact notice for loans dated before the circular takes effect", () => {
    assert.equal(OLD_LOAN_NOTICE, "Ang tool na ito ay para sa loans simula 1 Abril 2026.");
  });

  it("formats dates in Filipino month names", () => {
    assert.equal(formatDateFil("2026-04-01"), "1 Abril 2026");
    assert.equal(formatDateFil("2026-12-25"), "25 Disyembre 2026");
    assert.equal(formatDateFil("2027-01-09"), "9 Enero 2027");
  });

  it("has a message for every reason a loan cannot be computed", () => {
    const reasons: CannotComputeReason[] = [
      "invalid_input",
      "invalid_date",
      "fee_not_less_than_principal",
      "payments_below_principal",
      "no_solution",
    ];
    assert.deepEqual(Object.keys(CANNOT_COMPUTE_TEXT).sort(), [...reasons].sort());
    for (const reason of reasons) assert.ok(CANNOT_COMPUTE_TEXT[reason].length > 10, reason);
  });
});

describe("headline", () => {
  it("states the true monthly cost, the day, and the total to pay (G2)", () => {
    assert.equal(
      headline(numbersFor(base())),
      "Ang totoong gastos mo: 114.58% kada buwan. Sa araw 7, ₱6,500.00 ang kabuuang babayaran mo.",
    );
  });

  it("uses the last payment day and the total of every payment, penalty included (G6, G7)", () => {
    const g6 = base({ principal: 10_000, payment: 2_560, paymentCount: 4 });
    assert.equal(
      headline(numbersFor(g6)),
      "Ang totoong gastos mo: 4.08% kada buwan. Sa araw 28, ₱10,240.00 ang kabuuang babayaran mo.",
    );
    const g7 = base({
      principal: 3_000,
      payment: 3_150,
      penalty: 2_900,
      frequency: "monthly",
      firstDueDays: 30,
    });
    assert.equal(
      headline(numbersFor(g7)),
      "Ang totoong gastos mo: 4.88% kada buwan. Sa araw 30, ₱6,050.00 ang kabuuang babayaran mo.",
    );
  });

  it("leads with the simple monthly figure, not the compounded one (G3)", () => {
    const g3 = numbersFor(base({ upfrontFee: 65, payment: 5_070 }));
    assert.match(headline(g3), /^Ang totoong gastos mo: 11\.59% kada buwan\./);
    assert.ok(!headline(g3).includes("12.26"));
  });
});

describe("Paano kinuwenta rows", () => {
  it("shows both monthly figures and the daily rate (G3)", () => {
    const rows = new Map(howComputedRows(numbersFor(base({ upfrontFee: 65, payment: 5_070 }))));
    const values = [...rows.values()];
    assert.ok(values.includes("0.3863%"), "daily rate");
    assert.ok(values.includes("11.59%"), "simple");
    assert.ok(values.includes("12.26%"), "compounded");
    assert.ok([...rows.keys()].some((k) => k.startsWith("Kada buwan, simple")));
    assert.ok([...rows.keys()].some((k) => k.startsWith("Kada buwan, compounded")));
  });
});

describe("ceiling wording", () => {
  it("builds the cap text from rules.ts", () => {
    assert.deepEqual(CEILING_CAP_TEXT, {
      eir: "12% kada buwan",
      nominal: "6% kada buwan",
      totalCost: "100% ng inutang",
    });
  });

  it("names the published source", () => {
    assert.equal(COMPARISON_SOURCE, `Ayon sa ${SOURCE.id}`);
  });

  it("uses the exact GRAY sentence for the effective rate", () => {
    assert.equal(
      GRAY_EIR_TEXT,
      "Malapit sa ceiling — depende kung paano kinukuwenta ang buwanang rate. Hindi malinaw sa circular.",
    );
  });

  it("says a loan is over a ceiling only as a plain statement about the number", () => {
    assert.deepEqual(STATE_TEXT, {
      WITHIN: "Nasa loob ng ceiling",
      GRAY: "Malapit sa ceiling",
      OVER: "Lampas sa ceiling",
    });
  });
});
