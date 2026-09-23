/**
 * CLAUDE.md principle 1: never accuse. Fails if any on-screen string contains a banned
 * word or a lender name. Two independent checks:
 *  1. static: every string, template piece and JSX text in the source (rules.ts included);
 *  2. runtime: every string the calculator and each language file actually produce, across
 *     many loans (the language kept for later too: it must never accuse either).
 * The static scan cannot see a word assembled by concatenation ("sc" + "am"); the runtime
 * scan covers computed output.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { findBanned, LENDER_NAMES } from "./banned.ts";
import { computedRows, copy, type Copy, headlineText } from "./copy.ts";
import { en } from "./copy/en.ts";
import { fil } from "./copy/fil.ts";
import { analyzeLoan, type CoverageReason, type LoanInput } from "./loan-math.ts";
import * as rules from "./rules.ts";
import { plainText } from "./segments.ts";
import {
  isTestOrGenerated,
  type Literal,
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

/** Every language file, on screen or kept for later. */
const LANGUAGES: Record<string, Copy> = { en, fil };

/** The name of every template (a function) in the copy. */
type TemplateKey = {
  [K in keyof Copy]: NonNullable<Copy[K]> extends (...args: never[]) => unknown ? K : never;
}[keyof Copy];

/**
 * One output of every template, with sample arguments. The type lists every template, so a
 * new one fails typecheck until it is added here. headline, howComputedRows and
 * coverageReason are also run on every loan below.
 */
function templateSamples(c: Copy): Record<TemplateKey, unknown> {
  const analysis = analyzeLoan(base());
  if (analysis.status !== "ok") throw new Error("the base loan must compute");
  const reasons: CoverageReason[] = [
    { kind: "lender" },
    { kind: "secured" },
    { kind: "purpose" },
    { kind: "principal", principal: 12_000 },
    { kind: "tenorOver", tenorDays: 130 },
    { kind: "tenorMaybe", tenorDays: 121 },
  ];
  return {
    formatDate: c.formatDate("2026-04-01"),
    coverageReason: reasons.map((reason) => plainText(c.coverageReason(reason))),
    headline: c.headline(analysis.numbers),
    penaltySentence: c.penaltySentence?.("₱2,900.00") ?? null,
    howComputedRows: c.howComputedRows(analysis.numbers),
    calendarSubtitle: [c.calendarSubtitle(7, 1), c.calendarSubtitle(28, 4)],
    timelineReceived: c.timelineReceived("₱5,000.00"),
    timelineDay: c.timelineDay(7),
    timelinePayment: c.timelinePayment(1, "₱6,500.00"),
    timelineLegendFollowUp: c.timelineLegendFollowUp(4),
    privacySections: [c.privacySections(""), c.privacySections("contact@example.com")],
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
  // Read inside the tests, never while the suite is set up (N39).
  let cached: { files: string[]; strings: Literal[] } | undefined;
  const source = () => {
    if (cached) return cached;
    const root = srcRoot();
    const files = sourceFiles(root, (p) => isTestOrGenerated(p) || p === "lib/banned.ts");
    const strings = files.flatMap((file) =>
      literalsIn(file, readFileSync(join(root, file), "utf8")).filter((l) => l.kind === "string"),
    );
    return (cached = { files, strings });
  };

  it("scans the real app source, not an empty list", () => {
    const { files, strings } = source();
    for (const expected of [
      "lib/loan-math.ts",
      "lib/copy.ts",
      "lib/copy/en.ts",
      "lib/copy/fil.ts",
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
    const found = source().strings.flatMap((l) =>
      findBanned(l.text).map((hit) => `${l.file}:${l.line} "${l.text.slice(0, 70)}" contains "${hit}"`),
    );
    assert.deepEqual(found, [], found.join("\n"));
  });
});

describe("banned phrases: what the calculator produces", () => {
  it("checks every language file", () => {
    const files = readdirSync(join(srcRoot(), "lib/copy"))
      .filter((f) => f.endsWith(".ts") && f !== "types.ts")
      .map((f) => f.replace(/\.ts$/, ""));
    assert.deepEqual(Object.keys(LANGUAGES).sort(), files.sort(), "add the new language to LANGUAGES");
    assert.equal(copy, LANGUAGES[copy.htmlLang], "the language on screen is among them");
  });

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
      ...Object.values(LANGUAGES).flatMap((c) => [...stringsIn(c), ...stringsIn(templateSamples(c))]),
      ...stringsIn(Object.values(rules)),
    ];
    for (const input of inputs) {
      const analysis = analyzeLoan(input);
      shown.push(...stringsIn(analysis));
      for (const c of Object.values(LANGUAGES)) {
        if (analysis.status !== "cannot_compute") {
          shown.push(headlineText(analysis.numbers, c));
          shown.push(...stringsIn(computedRows(analysis.numbers, c)));
        }
        if (analysis.status === "ok") {
          shown.push(...analysis.coverage.reasons.map((r) => plainText(c.coverageReason(r))));
        }
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
      copy.grayEirText,
      copy.disclaimer,
      copy.oldLoanNotice,
      "It names no lender and gives no advice on how to pay.",
      "Above the limit",
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
