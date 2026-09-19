/**
 * CLAUDE.md principle 1: never accuse. Fails if any on-screen string contains a banned
 * word or a lender name. Two independent checks:
 *  1. static: every string, template piece and JSX text in the source (rules.ts included);
 *  2. runtime: every string the calculator and copy.ts actually produce, across many loans.
 * The static scan cannot see a word assembled by concatenation ("sc" + "am"); the runtime
 * scan covers computed output.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { findBanned, LENDER_NAMES } from "./banned.ts";
import * as copy from "./copy.ts";
import { analyzeLoan, FREQUENCY_LABEL, PRESETS, type LoanInput } from "./loan-math.ts";
import * as rules from "./rules.ts";
import {
  isTestOrGenerated,
  literalsIn,
  sourceFiles,
  srcRoot,
} from "./test-utils/source-strings.ts";

/** Every string reachable inside a value. */
function stringsIn(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const item of value) stringsIn(item, out);
  else if (value && typeof value === "object") {
    for (const item of Object.values(value)) stringsIn(item, out);
  }
  return out;
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

describe("banned phrases: source", () => {
  const root = srcRoot();
  const files = sourceFiles(root, (p) => isTestOrGenerated(p) || p === "lib/banned.ts");
  const strings = files.flatMap((file) =>
    literalsIn(file, readFileSync(join(root, file), "utf8")).filter((l) => l.kind === "string"),
  );

  it("scans the real app source, not an empty list", () => {
    for (const expected of [
      "lib/loan-math.ts",
      "lib/copy.ts",
      "lib/rules.ts",
      "components/calculator.tsx",
      "components/result.tsx",
      "routes/index.tsx",
      "routes/__root.tsx",
    ]) {
      assert.ok(files.includes(expected), `${expected} is not being scanned`);
    }
    assert.ok(strings.length > 100, `only ${strings.length} strings scanned`);
  });

  it("no string in the source contains a banned word or a lender name", () => {
    const found = strings.flatMap((l) =>
      findBanned(l.text).map((hit) => `${l.file}:${l.line} "${l.text.slice(0, 70)}" contains "${hit}"`),
    );
    assert.deepEqual(found, [], found.join("\n"));
  });
});

describe("banned phrases: what the calculator produces", () => {
  it("no string it can show contains a banned word or a lender name", (t) => {
    const inputs: LoanInput[] = [
      base(),
      base({ payment: 5_300, frequency: "monthly", firstDueDays: 30 }),
      base({ upfrontFee: 65, payment: 5_070 }),
      base({ lenderKind: "bank" }),
      base({ unsecured: false }),
      base({ generalPurpose: false }),
      base({ principal: 10_001, payment: 10_500 }),
      base({ frequency: "daily", firstDueDays: 121, payment: 12_000 }),
      base({ frequency: "daily", firstDueDays: 124, payment: 12_000 }),
      base({ bookedOn: "2026-03-31" }),
      base({ bookedOn: "" }),
      base({ upfrontFee: 5_000 }),
      base({ payment: 100 }),
      base({ principal: NaN }),
    ];
    const rand = seeded(20260919);
    const frequencies = ["daily", "weekly", "biweekly", "monthly"] as const;
    for (let i = 0; i < 300; i++) {
      inputs.push(
        base({
          principal: Math.round(100 + rand() * 12_000),
          upfrontFee: rand() < 0.5 ? 0 : Math.round(rand() * 6_000),
          payment: Math.round(rand() * 14_000),
          paymentCount: 1 + Math.floor(rand() * 8),
          frequency: frequencies[Math.floor(rand() * frequencies.length)],
          firstDueDays: 1 + Math.floor(rand() * 150),
          penalty: rand() < 0.5 ? 0 : Math.round(rand() * 5_000),
          lenderKind: rand() < 0.15 ? "bank" : "lending_or_financing",
          bookedOn: rand() < 0.2 ? "2026-01-15" : "2026-09-18",
        }),
      );
    }

    const shown: string[] = [
      ...stringsIn(Object.values(copy).filter((v) => typeof v !== "function")),
      ...stringsIn(Object.values(rules)),
      ...stringsIn(FREQUENCY_LABEL),
      ...stringsIn(PRESETS),
    ];
    for (const input of inputs) {
      const analysis = analyzeLoan(input);
      shown.push(...stringsIn(analysis));
      if (analysis.status !== "cannot_compute") {
        shown.push(copy.headline(analysis.numbers));
        shown.push(...stringsIn(copy.howComputedRows(analysis.numbers)));
      }
    }

    assert.ok(shown.length > 1_000, `only ${shown.length} strings checked`);
    const found = [...new Set(shown)].flatMap((text) =>
      findBanned(text).map((hit) => `"${text.slice(0, 70)}" contains "${hit}"`),
    );
    assert.deepEqual(found, [], found.join("\n"));

    if (LENDER_NAMES.length === 0) {
      t.diagnostic(
        "LENDER_NAMES in src/lib/banned.ts is empty, so no lender name is being enforced. Add the names to enforce them.",
      );
    }
  });
});

describe("the matcher itself", () => {
  it("catches every banned word, in any case and with accents", () => {
    for (const text of [
      "Ito ay ilegal",
      "ILLEGAL na singil",
      "Ilégal ito",
      "isang scam",
      "SCAM",
      "scammer",
      "Fraud ito",
      "fraudulent",
      "parang loan shark",
      "Loan   Shark",
      "loan\nsharks",
    ]) {
      assert.ok(findBanned(text).length >= 1, `not caught: ${JSON.stringify(text)}`);
    }
  });

  it("does not flag ordinary wording, including what the app already says", () => {
    for (const text of [
      copy.GRAY_EIR_TEXT,
      copy.DISCLAIMER,
      copy.OLD_LOAN_NOTICE,
      "Hindi nagnangalan ng lender, hindi nagpapayo kung paano magbayad.",
      "Lampas sa ceiling",
      "the loan and the shark tank",
      "scale, scan, scarce",
    ]) {
      assert.deepEqual(findBanned(text), [], text);
    }
  });

  it("catches a lender name only as a whole word, ignoring case and accents", () => {
    const names = ["Acme Lending", "Bãnk Zed"];
    assert.deepEqual(findBanned("Utang mula sa ACME LENDING", names), ["Acme Lending"]);
    assert.deepEqual(findBanned("tingnan ang bank zed", names), ["Bãnk Zed"]);
    assert.deepEqual(findBanned("Acme Lendingsville", names), []);
    assert.deepEqual(findBanned("walang pangalan dito", names), []);
    assert.deepEqual(findBanned("Acme Lending", []), []);
  });
});
