/**
 * CLAUDE.md: rules.ts is the ONLY place legal constants may exist. This reads every
 * source file except rules.ts and fails on any legal number written out in it, whether
 * as a number (0.12) or inside a sentence ("12% kada buwan"). The values to look for
 * are taken from rules.ts itself, so the list cannot drift from the law it guards.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { CEILINGS, COVERAGE, SOURCE } from "./rules.ts";
import {
  isTestOrGenerated,
  literalsIn,
  sourceFiles,
  srcRoot,
} from "./test-utils/source-strings.ts";

const percent = (fraction: number) => Number((fraction * 100).toFixed(2));

const [effectiveYear, , effectiveDay] = SOURCE.effective.split("-");

/** Numbers only rules.ts may write. */
const LEGAL_NUMBERS = new Set<number>([
  CEILINGS.nominalPerMonth,
  CEILINGS.effectivePerMonth,
  CEILINGS.penaltyPerMonth,
  COVERAGE.principalMax,
  COVERAGE.tenorDaysSurelyCovered,
  COVERAGE.tenorDaysMaybeCovered,
]);

/** The same values as they would be typed into a sentence. */
const LEGAL_TEXT: [label: string, pattern: RegExp][] = [
  ...[
    CEILINGS.nominalPerMonth,
    CEILINGS.effectivePerMonth,
    CEILINGS.penaltyPerMonth,
    CEILINGS.totalCostRatio,
  ].map(
    (fraction): [string, RegExp] => [
      `${percent(fraction)}%`,
      new RegExp(`(?<![\\d.])${percent(fraction)}(?:\\.0+)?\\s*%`),
    ],
  ),
  [
    `${COVERAGE.principalMax} pesos`,
    new RegExp(
      `(?<![\\d.,])(?:${COVERAGE.principalMax.toLocaleString("en-US")}|${COVERAGE.principalMax})(?!\\d)`,
    ),
  ],
  [
    `${COVERAGE.tenorDaysSurelyCovered} or ${COVERAGE.tenorDaysMaybeCovered} days`,
    new RegExp(`\\b(?:${COVERAGE.tenorDaysSurelyCovered}|${COVERAGE.tenorDaysMaybeCovered})\\b`),
  ],
  [COVERAGE.appliesToLoansFrom, new RegExp(COVERAGE.appliesToLoansFrom)],
  [SOURCE.effective, new RegExp(SOURCE.effective)],
  [
    "the effective date written out",
    new RegExp(`\\b${Number(effectiveDay)}\\s+\\p{L}+\\s+${effectiveYear}\\b`, "u"),
  ],
];

function violations(file: string, source: string): string[] {
  return literalsIn(file, source).flatMap((literal) => {
    if (literal.kind === "number") {
      return LEGAL_NUMBERS.has(literal.value as number)
        ? [`${file}:${literal.line} the number ${literal.text}`]
        : [];
    }
    return LEGAL_TEXT.filter(([, pattern]) => pattern.test(literal.text)).map(
      ([label]) => `${file}:${literal.line} "${literal.text.slice(0, 70)}" contains ${label}`,
    );
  });
}

describe("legal numbers live only in rules.ts", () => {
  const root = srcRoot();
  const files = sourceFiles(root, (p) => isTestOrGenerated(p) || p === "lib/rules.ts");

  it("scans the real app source, not an empty list", () => {
    for (const expected of [
      "lib/loan-math.ts",
      "lib/copy.ts",
      "components/calculator.tsx",
      "components/result.tsx",
      "routes/index.tsx",
    ]) {
      assert.ok(files.includes(expected), `${expected} is not being scanned`);
    }
    assert.ok(!files.includes("lib/rules.ts"));
  });

  it("no source file writes a legal number", () => {
    const found = files.flatMap((file) => violations(file, readFileSync(join(root, file), "utf8")));
    assert.deepEqual(found, [], `legal numbers outside rules.ts:\n${found.join("\n")}`);
  });

  it("loan-math.ts takes its caps from rules.ts", () => {
    const source = readFileSync(join(root, "lib/loan-math.ts"), "utf8");
    assert.match(source, /from "\.\/rules\.ts"/);
    for (const name of ["CEILINGS", "COVERAGE", "DAYS_PER_MONTH", "eirVerdict"]) {
      assert.ok(source.includes(name), `${name} is not used`);
    }
  });
});

describe("the scanner itself", () => {
  it("catches a legal number written as a number, in a sentence, or as a date", () => {
    const lines = [
      "const cap = 0.12;",
      "const nominal = 0.06;",
      "const max = 10_000;",
      'const a = "hanggang 12% kada buwan";',
      'const b = "6 %";',
      'const c = "hanggang 100% ng inutang";',
      "const d = `simula 1 Abril 2026`;",
      'const e = "2026-04-01";',
      'const f = "hanggang 120 araw";',
      'const g = "hanggang ₱10,000";',
    ];
    for (const line of lines) {
      assert.ok(violations("sample.ts", line).length >= 1, `not caught: ${line}`);
    }
  });

  it("catches a legal number inside JSX text", () => {
    const sample = "export const X = () => <p>Ang ceiling ay 12% kada buwan</p>;";
    assert.equal(violations("sample.tsx", sample).length, 1);
  });

  it("does not flag numbers that only look similar", () => {
    const sample = [
      "const n = 42; const half = 0.5;",
      'const s = "15% at 16% at 112% at 1200 at 100000";',
      'const t = "Kumusta ang araw mo";',
    ].join("\n");
    assert.deepEqual(violations("sample.ts", sample), []);
  });
});
