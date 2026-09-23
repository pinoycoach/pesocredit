import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";
import {
  analyzeLoan,
  buildSchedule,
  irrDaily,
  type LoanAnalysis,
  type LoanInput,
} from "./loan-math.ts";
import { COVERAGE, DAYS_PER_MONTH, type Verdict } from "./rules.ts";
import { base, GOLDEN_INPUTS, single } from "./test-utils/loan-fixtures.ts";
import { sourceFiles, srcRoot } from "./test-utils/source-strings.ts";

function expectOk(input: LoanInput) {
  const analysis = analyzeLoan(input);
  assert.equal(analysis.status, "ok", `expected ok, got ${JSON.stringify(analysis)}`);
  if (analysis.status !== "ok") throw new Error("unreachable");
  return analysis;
}

const SEVERITY: Record<Verdict, number> = { WITHIN: 0, GRAY: 1, OVER: 2 };

/** Small deterministic PRNG so property checks are reproducible. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Golden cases: the table in GOLDEN-CASES.md is read and reproduced at the
// precision it prints. The loan inputs are in test-utils/loan-fixtures.ts.
// ---------------------------------------------------------------------------

/**
 * The G rows of GOLDEN-CASES.md. `found` lists every row in file order, so a second row
 * with the same id (which would otherwise silently replace the first) fails loudly.
 */
function goldenTable(): { rows: Map<string, string[]>; found: { id: string; line: number }[] } {
  const text = readFileSync(new URL("../../GOLDEN-CASES.md", import.meta.url), "utf8");
  const rows = new Map<string, string[]>();
  const found: { id: string; line: number }[] = [];
  text.split(/\r?\n/).forEach((line, index) => {
    const m = /^\|\s*(G\d+)\s*\|(.*)\|\s*$/.exec(line);
    if (!m) return;
    found.push({ id: m[1], line: index + 1 });
    if (!rows.has(m[1])) rows.set(m[1], m[2].split("|").map((cell) => cell.trim()));
  });
  return { rows, found };
}

/** "0.1944%" -> { text: "0.1944", digits: 4 } */
function printedPercent(cell: string) {
  const m = /^(-?\d+(?:\.(\d+))?)%$/.exec(cell);
  assert.ok(m, `not a percentage cell: ${cell}`);
  return { text: m[1], digits: (m[2] ?? "").length };
}

const asPercent = (fraction: number, digits: number) => (fraction * 100).toFixed(digits);

/** Independent of loan-math: bisection on the weekly rate of an annuity. */
function annuityDailyRate(principal: number, payment: number, count: number, intervalDays: number) {
  const presentValue = (rate: number) =>
    rate === 0 ? payment * count : (payment * (1 - Math.pow(1 + rate, -count))) / rate;
  let lo = 1e-9;
  let hi = 5;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (presentValue(mid) > principal) lo = mid;
    else hi = mid;
  }
  return Math.pow(1 + (lo + hi) / 2, 1 / intervalDays) - 1;
}

/** The golden loans as [id, input], in loan-fixtures.ts order. */
const GOLDEN_CASES = Object.entries(GOLDEN_INPUTS);

describe("golden cases (GOLDEN-CASES.md)", () => {
  // Read inside the tests, never while the suite is set up (N39): if GOLDEN-CASES.md cannot be read,
  // every golden test fails, instead of the suite silently not running.
  let cached: ReturnType<typeof goldenTable> | undefined;
  const golden = () => (cached ??= goldenTable());

  it("the table has G1 to G7, each exactly once", () => {
    const { rows: table, found } = golden();
    const duplicates = found.filter((row, i) => found.findIndex((r) => r.id === row.id) !== i);
    assert.deepEqual(
      duplicates,
      [],
      `GOLDEN-CASES.md has more than one row for ${duplicates
        .map((d) => `${d.id} (again at line ${d.line})`)
        .join(", ")}: any table row whose first cell is a G-id is read as a golden case`,
    );
    assert.deepEqual(
      found.map((row) => row.id),
      ["G1", "G2", "G3", "G4", "G5", "G6", "G7"],
    );
    assert.deepEqual(Object.keys(GOLDEN_INPUTS), [...table.keys()]);
  });

  for (const [id, input] of GOLDEN_CASES) {
    it(`${id} reproduces every printed value`, () => {
      const { rows: table, found } = golden();
      assert.equal(found.filter((row) => row.id === id).length, 1, `${id} must have exactly one row`);
      const cells = table.get(id);
      assert.ok(cells && cells.length === 7, `${id}: expected 7 cells`);
      const [, daily, simple, compounded, nominal, totalCost, verdictText] = cells;

      const a = expectOk(input);
      const n = a.numbers;
      const check = (cell: string, actual: number, label: string) => {
        const printed = printedPercent(cell);
        assert.equal(asPercent(actual, printed.digits), printed.text, `${id} ${label}`);
      };
      check(daily, n.eirPerDay, "daily EIR");
      check(simple, n.eirPerMonthSimple, "x30 (simple)");
      check(compounded, n.eirPerMonthCompounded, "compounded");
      check(nominal, n.nominalPerMonth, "nominal per month");
      check(totalCost, n.totalCostRatio, "total cost");

      assert.equal(a.coverage.state, "COVERED", `${id} is inside the coverage box`);
      assert.equal(a.checks.nominal.state, /NIR over/i.test(verdictText) ? "OVER" : "WITHIN");
      assert.equal(
        a.checks.totalCost.state,
        /total-cost OVER/i.test(verdictText) ? "OVER" : "WITHIN",
      );
      const eir = /EIR (within|gray|over)/i.exec(verdictText);
      assert.ok(eir, `${id}: no EIR verdict in "${verdictText}"`);
      assert.equal(a.checks.eir.state, eir[1].toUpperCase());
    });
  }

  it("single-payment cases match the spreadsheet formula (payment / net proceeds) ^ (1 / days) - 1", () => {
    for (const id of ["G1", "G2", "G3", "G4", "G5", "G7"]) {
      const input = GOLDEN_INPUTS[id];
      const a = expectOk(input);
      const expected =
        Math.pow(input.payment / (input.principal - input.upfrontFee), 1 / a.numbers.tenorDays) - 1;
      assert.ok(Math.abs(a.numbers.eirPerDay - expected) < 1e-9, id);
    }
  });

  it("G6 matches the annuity rate (RATE) converted to a daily rate", () => {
    const a = expectOk(GOLDEN_INPUTS.G6);
    const expected = annuityDailyRate(10_000, 2_560, 4, 7);
    assert.ok(Math.abs(a.numbers.eirPerDay - expected) < 1e-9);
  });

  it("G3 is GRAY, never OVER: the daily rate is under the cap but its compounded month is over", () => {
    const a = expectOk(GOLDEN_INPUTS.G3);
    assert.equal(a.checks.eir.state, "GRAY");
    assert.ok(a.numbers.eirPerMonthSimple < a.checks.eir.cap);
    assert.ok(a.numbers.eirPerMonthCompounded > a.checks.eir.cap);
  });
});

// ---------------------------------------------------------------------------
// Boundary cases listed in GOLDEN-CASES.md
// ---------------------------------------------------------------------------

describe("boundary: principal", () => {
  it("is covered at the maximum and not covered one peso above it", () => {
    const at = expectOk(base({ principal: COVERAGE.principalMax, payment: 10_500 }));
    assert.equal(at.coverage.state, "COVERED");

    const above = expectOk(base({ principal: COVERAGE.principalMax + 1, payment: 10_500 }));
    assert.equal(above.coverage.state, "NOT_COVERED");
    assert.ok(above.coverage.reasons.length > 0);
    assert.equal(above.overall, null);
    for (const c of Object.values(above.checks)) assert.equal(c.state, null);
  });
});

describe("boundary: tenor", () => {
  const overLoan = { principal: 5_000, payment: 12_000 };
  const stateAt = (days: number) => expectOk(single(days, overLoan));

  it("120 days is covered", () => {
    assert.equal(stateAt(COVERAGE.tenorDaysSurelyCovered).coverage.state, "COVERED");
  });

  it("121 to 123 days is MAYBE covered", () => {
    for (let d = COVERAGE.tenorDaysSurelyCovered + 1; d <= COVERAGE.tenorDaysMaybeCovered; d++) {
      const a = stateAt(d);
      assert.equal(a.coverage.state, "MAYBE", `${d} days`);
      assert.ok(a.coverage.reasons.length > 0);
    }
  });

  it("124 days is not covered", () => {
    const a = stateAt(COVERAGE.tenorDaysMaybeCovered + 1);
    assert.equal(a.coverage.state, "NOT_COVERED");
    assert.equal(a.overall, null);
  });

  it("uncertain coverage softens OVER to GRAY, and covered coverage keeps it", () => {
    const covered = stateAt(COVERAGE.tenorDaysSurelyCovered);
    assert.equal(covered.overall, "OVER");
    assert.equal(covered.checks.eir.state, "OVER");

    const maybe = stateAt(COVERAGE.tenorDaysSurelyCovered + 1);
    assert.equal(maybe.checks.eir.raw, "OVER", "the numbers alone are still over");
    assert.equal(maybe.checks.eir.state, "GRAY");
    assert.equal(maybe.overall, "GRAY");
  });

  it("uncertain coverage never makes a within-cap loan look worse", () => {
    const a = expectOk(single(COVERAGE.tenorDaysSurelyCovered + 1, { payment: 5_050 }));
    assert.equal(a.coverage.state, "MAYBE");
    assert.equal(a.overall, "WITHIN");
  });
});

describe("boundary: contract date", () => {
  it("dated the day before the circular takes effect gives numbers but no ceiling comparison", () => {
    assert.equal(
      COVERAGE.appliesToLoansFrom,
      "2026-04-01",
      "the dates in this test follow rules.ts",
    );
    const a = analyzeLoan(base({ bookedOn: "2026-03-31" }));
    assert.equal(a.status, "before_effective_date");
    if (a.status !== "before_effective_date") return;
    assert.ok(a.numbers.eirPerMonthSimple > 0);
    assert.ok(!("checks" in a) && !("coverage" in a));
  });

  it("dated on the effective date is compared", () => {
    assert.equal(
      expectOk(base({ bookedOn: COVERAGE.appliesToLoansFrom })).coverage.state,
      "COVERED",
    );
  });

  it("does not depend on the time zone of the machine", () => {
    const before = process.env.TZ;
    try {
      const results = ["Pacific/Kiritimati", "Pacific/Pago_Pago"].map((tz) => {
        process.env.TZ = tz;
        return [
          analyzeLoan(base({ bookedOn: "2026-03-31" })).status,
          analyzeLoan(base({ bookedOn: "2026-04-01" })).status,
        ];
      });
      for (const r of results) assert.deepEqual(r, ["before_effective_date", "ok"]);
    } finally {
      if (before === undefined) delete process.env.TZ;
      else process.env.TZ = before;
    }
  });

  it("rejects dates that are not real calendar dates", () => {
    for (const bookedOn of [
      "",
      "2026-02-30",
      "2026-13-01",
      "26-04-01",
      "April 1 2026",
      "2026-4-1",
    ]) {
      const a = analyzeLoan(base({ bookedOn }));
      assert.deepEqual(
        a,
        { status: "cannot_compute", reason: "invalid_date" },
        JSON.stringify(bookedOn),
      );
    }
  });
});

describe("boundary: cannot compute", () => {
  it("a fee equal to or above the principal returns cannot-compute and does not throw", () => {
    for (const upfrontFee of [5_000, 5_001, 50_000]) {
      assert.deepEqual(analyzeLoan(base({ upfrontFee })), {
        status: "cannot_compute",
        reason: "fee_not_less_than_principal",
      });
    }
  });

  it("payments totaling less than what was received return cannot-compute", () => {
    assert.deepEqual(analyzeLoan(base({ payment: 4_000 })), {
      status: "cannot_compute",
      reason: "payments_below_principal",
    });
    assert.deepEqual(analyzeLoan(base({ payment: 1_000, paymentCount: 3 })), {
      status: "cannot_compute",
      reason: "payments_below_principal",
    });
  });

  it("a penalty cannot rescue payments that are below what was received", () => {
    const a = analyzeLoan(base({ payment: 4_000, penalty: 5_000 }));
    assert.deepEqual(a, { status: "cannot_compute", reason: "payments_below_principal" });
  });

  it("payments equal to what was received are a zero-cost loan, not an error", () => {
    const a = expectOk(base({ payment: 5_000 }));
    assert.equal(a.numbers.eirPerDay, 0);
    assert.equal(a.numbers.totalCost, 0);
    assert.equal(a.overall, "WITHIN");
  });

  it("payments below the principal but above the net proceeds are valid (a fee was deducted)", () => {
    const a = expectOk(base({ upfrontFee: 800, payment: 4_500 }));
    assert.equal(a.numbers.netProceeds, 4_200);
    assert.ok(a.numbers.eirPerDay > 0);
    assert.ok(a.numbers.totalCost > 0);
  });

  it("bad numbers return cannot-compute with a reason", () => {
    const bad: Partial<LoanInput>[] = [
      { principal: NaN },
      { principal: 0 },
      { principal: -1 },
      { principal: Infinity },
      { payment: NaN },
      { payment: -1 },
      { upfrontFee: NaN },
      { upfrontFee: -1 },
      { penalty: NaN },
      { penalty: -1 },
      { paymentCount: 0 },
      { paymentCount: NaN },
    ];
    for (const over of bad) {
      assert.deepEqual(
        analyzeLoan(base(over)),
        { status: "cannot_compute", reason: "invalid_input" },
        JSON.stringify(over),
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Ceiling behaviour
// ---------------------------------------------------------------------------

describe("ceilings", () => {
  it("a loan sitting exactly on the effective-rate cap is WITHIN, not GRAY", () => {
    // The daily rate solves to a number a hair above the cap once compounded
    // (about 1e-15 over); the tolerance in loan-math.ts absorbs that noise.
    const a = expectOk(base({ principal: 10_000, payment: 11_200 }));
    assert.ok(Math.abs(a.numbers.eirPerMonthCompounded - a.checks.eir.cap) < 1e-9);
    assert.equal(a.checks.eir.state, "WITHIN");
    // The nominal rate of this loan is a separate check and is over its own cap.
    assert.equal(a.checks.nominal.state, "OVER");
  });

  it("a loan clearly over both readings of the monthly rate is OVER", () => {
    const a = expectOk(base({ principal: 10_000, payment: 13_000 }));
    assert.equal(a.checks.eir.state, "OVER");
  });

  it("the nominal cap is two-state: at the cap is WITHIN, above it is OVER", () => {
    assert.equal(expectOk(base({ payment: 5_300 })).checks.nominal.state, "WITHIN");
    assert.equal(expectOk(base({ payment: 5_301 })).checks.nominal.state, "OVER");
  });

  it("the total-cost cap is two-state: exactly 100% is WITHIN, above it is OVER", () => {
    assert.equal(
      expectOk(base({ principal: 1_000, payment: 1_000, penalty: 1_000 })).checks.totalCost.state,
      "WITHIN",
    );
    assert.equal(
      expectOk(base({ principal: 1_000, payment: 1_000, penalty: 1_001 })).checks.totalCost.state,
      "OVER",
    );
  });

  it("a penalty raises total cost but never the effective rate", () => {
    const without = expectOk(base({ payment: 5_300, penalty: 0 }));
    const withPenalty = expectOk(base({ payment: 5_300, penalty: 400 }));
    assert.equal(withPenalty.numbers.eirPerDay, without.numbers.eirPerDay);
    assert.equal(withPenalty.numbers.nominalPerMonth, without.numbers.nominalPerMonth);
    assert.equal(withPenalty.numbers.totalCost, without.numbers.totalCost + 400);
  });

  it("lender, security and purpose outside the box mean no ceiling comparison", () => {
    for (const over of [
      { lenderKind: "bank" as const },
      { unsecured: false },
      { generalPurpose: false },
    ]) {
      const a = expectOk(base({ payment: 9_000, ...over }));
      assert.equal(a.coverage.state, "NOT_COVERED", JSON.stringify(over));
      assert.equal(a.overall, null);
    }
  });

  it("reports both monthly figures, the simple one never above the compounded one", () => {
    const a = expectOk(GOLDEN_INPUTS.G2);
    assert.equal(a.numbers.eirPerMonthSimple, a.numbers.eirPerDay * DAYS_PER_MONTH);
    assert.ok(a.numbers.eirPerMonthCompounded > a.numbers.eirPerMonthSimple);
  });
});

describe("schedule and irrDaily", () => {
  it("builds four weekly payments on days 7, 14, 21 and 28", () => {
    const { schedule, tenorDays } = buildSchedule(GOLDEN_INPUTS.G6);
    assert.deepEqual(
      schedule.map((p) => p.day),
      [7, 14, 21, 28],
    );
    assert.equal(tenorDays, 28);
  });

  it("prices a single 30-day payment at its period rate", () => {
    const r = irrDaily([
      { day: 0, amount: 10_000, label: "in" },
      { day: 30, amount: -11_500, label: "out" },
    ]);
    assert.ok(r !== null);
    assert.ok(Math.abs(Math.pow(1 + r, 30) - 1 - 1_500 / 10_000) < 1e-6);
  });
});

// ---------------------------------------------------------------------------
// Property checks (seeded, so a failure reproduces)
// ---------------------------------------------------------------------------

describe("properties", () => {
  it("a bigger deducted fee always raises the EIR", () => {
    const rand = seeded(20260919);
    for (let i = 0; i < 400; i++) {
      const principal = Math.round(1_000 + rand() * 9_000);
      const count = 1 + Math.floor(rand() * 6);
      const days = 1 + Math.floor(rand() * 60);
      // Total payments always at least the principal, so every case is computable.
      const payment = Math.ceil((principal * (1 + rand() * 1.5)) / count);
      const feeLow = Math.floor(rand() * principal * 0.3);
      const feeHigh = feeLow + 1 + Math.floor(rand() * principal * 0.3);
      const shape = {
        principal,
        payment,
        paymentCount: count,
        frequency: "daily" as const,
        firstDueDays: days,
      };

      const low = expectOk(base({ ...shape, upfrontFee: feeLow }));
      const high = expectOk(base({ ...shape, upfrontFee: feeHigh }));
      assert.ok(
        high.numbers.eirPerDay > low.numbers.eirPerDay,
        `fee ${feeLow} -> ${feeHigh} on ${JSON.stringify(shape)}`,
      );
    }
  });

  it("total cost is never negative, and every number is finite", () => {
    const rand = seeded(19092026);
    const frequencies = ["daily", "weekly", "biweekly", "monthly"] as const;
    for (let i = 0; i < 600; i++) {
      const input = base({
        principal: Math.round(100 + rand() * 12_000),
        upfrontFee: rand() < 0.5 ? 0 : Math.round(rand() * 6_000),
        payment: Math.round(rand() * 14_000),
        paymentCount: 1 + Math.floor(rand() * 8),
        frequency: frequencies[Math.floor(rand() * frequencies.length)],
        firstDueDays: 1 + Math.floor(rand() * 150),
        penalty: rand() < 0.5 ? 0 : Math.round(rand() * 5_000),
        bookedOn: rand() < 0.2 ? "2026-01-15" : "2026-09-18",
      });
      const a: LoanAnalysis = analyzeLoan(input);
      if (a.status === "cannot_compute") continue;
      const n = a.numbers;
      assert.ok(n.totalCost >= 0, JSON.stringify(input));
      assert.ok(n.totalCostRatio >= 0);
      for (const v of [
        n.netProceeds,
        n.totalPayments,
        n.eirPerDay,
        n.eirPerMonthSimple,
        n.eirPerMonthCompounded,
        n.nominalPerMonth,
      ]) {
        assert.ok(Number.isFinite(v), JSON.stringify(input));
      }
      assert.ok(n.eirPerDay >= 0, "a computable loan never has a negative rate");
      assert.ok(n.eirPerMonthCompounded >= n.eirPerMonthSimple - 1e-12);
    }
  });

  it("raising the payment never lowers the verdict", () => {
    for (const days of [7, 30, 90]) {
      let worst = -1;
      for (let payment = 5_000; payment <= 20_000; payment += 250) {
        const a = expectOk(single(days, { payment }));
        const level = a.overall === null ? -1 : SEVERITY[a.overall];
        assert.ok(level >= worst, `${days} days, payment ${payment}`);
        worst = level;
      }
    }
  });

  it("uncertain coverage never yields OVER, and uncovered loans never yield a verdict", () => {
    const rand = seeded(424242);
    for (let i = 0; i < 200; i++) {
      const days = 1 + Math.floor(rand() * 200);
      const a = expectOk(single(days, { payment: Math.round(5_000 + rand() * 12_000) }));
      if (a.coverage.state === "MAYBE") {
        for (const c of Object.values(a.checks)) assert.notEqual(c.state, "OVER");
      }
      if (a.coverage.state === "NOT_COVERED") assert.equal(a.overall, null);
    }
  });
});

// ---------------------------------------------------------------------------
// The test list. package.json names every test file explicitly, so a new one that
// is not added would silently never run. This lives here, in the test file CLAUDE.md
// names, because a guard in a file of its own could itself be left off the list.
// ---------------------------------------------------------------------------

/** The test files npm test runs, as package.json lists them. */
function listedTests(): string[] {
  return (
    JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
      scripts: Record<string, string>;
    }
  ).scripts.test
    .split(/\s+/)
    .filter((token) => /\.test\.tsx?$/.test(token))
    .sort();
}

/** The test files under src/, as paths from the repository root. */
function testFilesOnDisk(): string[] {
  return sourceFiles(srcRoot(), (p) => !/\.test\.tsx?$/.test(p))
    .map((p) => `src/${p}`)
    .sort();
}

describe("npm test runs every test file", () => {
  it("every *.test.ts under src/ is in the test script", () => {
    const listed = listedTests();
    const missing = testFilesOnDisk().filter((file) => !listed.includes(file));
    assert.deepEqual(missing, [], `add to "test" in package.json: ${missing.join(" ")}`);
  });

  it("every file in the test script exists", () => {
    const onDisk = testFilesOnDisk();
    const gone = listedTests().filter((file) => !onDisk.includes(file));
    assert.deepEqual(gone, [], `listed in package.json but not found: ${gone.join(" ")}`);
  });

  it("finds the test files it guards, not an empty list", () => {
    const onDisk = testFilesOnDisk();
    assert.ok(onDisk.includes("src/lib/loan-math.test.ts"));
    assert.ok(onDisk.length >= 12, `only ${onDisk.length} test files found`);
  });
});

// ---------------------------------------------------------------------------
// No code runs while a describe() body is built. When code there throws, Node 24 lists the
// error but counts no failure and exits 0 (N39), so a guard computed there could stop
// running while npm test passes. This lives here for the same reason as the test list.
// ---------------------------------------------------------------------------

/** Calls that only register a suite, a test or a hook. */
const REGISTERS = new Set(["describe", "suite", "it", "test", "before", "after", "beforeEach", "afterEach"]);

/** "it" for it(...), it.skip(...) or it.only(...); undefined for any other node. */
function registration(node: ts.Node): string | undefined {
  if (!ts.isCallExpression(node)) return undefined;
  const callee = ts.isPropertyAccessExpression(node.expression) ? node.expression.expression : node.expression;
  return ts.isIdentifier(callee) && REGISTERS.has(callee.text) ? callee.text : undefined;
}

/** Whether evaluating the node runs code: a call, `new`, a tagged template or `await` outside any function in it. */
function runsCode(node: ts.Node): boolean {
  if (ts.isFunctionLike(node)) return false;
  if (ts.isCallExpression(node) || ts.isNewExpression(node) || ts.isTaggedTemplateExpression(node) || ts.isAwaitExpression(node)) {
    return true;
  }
  return ts.forEachChild(node, (child) => (runsCode(child) ? true : undefined)) ?? false;
}

/**
 * Statements of a describe() body that run code while the suite is built. Allowed: registering
 * suites, tests and hooks (their names and options computed without a call), declaring functions
 * and values that need no call, and looping over an existing value to register one test each.
 * Property reads are allowed; keep them to values that exist.
 */
function eagerStatements(statements: readonly ts.Statement[]): ts.Statement[] {
  return statements.filter((s) => {
    if (ts.isFunctionDeclaration(s) || ts.isEmptyStatement(s)) return false;
    if (ts.isVariableStatement(s)) {
      return s.declarationList.declarations.some((d) => d.initializer !== undefined && runsCode(d.initializer));
    }
    if (ts.isExpressionStatement(s) && ts.isCallExpression(s.expression) && registration(s.expression)) {
      return s.expression.arguments.some((arg) => !ts.isFunctionLike(arg) && runsCode(arg));
    }
    if (ts.isForOfStatement(s)) {
      const body = ts.isBlock(s.statement) ? s.statement.statements : [s.statement];
      return runsCode(s.expression) || eagerStatements(body).length > 0;
    }
    return true;
  });
}

/** Every statement in a file's describe() bodies that runs code, as "file:line code". */
export function eagerCode(file: string, source: string): string[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const found: string[] = [];
  const report = (node: ts.Node) => {
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
    found.push(`${file}:${line} ${node.getText(sf).split("\n")[0].slice(0, 100)}`);
  };
  const visit = (node: ts.Node): void => {
    const kind = registration(node);
    if ((kind === "describe" || kind === "suite") && ts.isCallExpression(node)) {
      const body = [...node.arguments].reverse().find(ts.isFunctionLike);
      if (body && (ts.isArrowFunction(body) || ts.isFunctionExpression(body))) {
        if (ts.isBlock(body.body)) eagerStatements(body.body.statements).forEach(report);
        else if (!registration(body.body) || runsCode(body.body)) report(body.body);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

describe("no code runs while a describe() body is built (N39)", () => {
  it("every test file computes inside it() or a hook, never in a describe() body", () => {
    const root = srcRoot();
    const files = sourceFiles(root, (p) => !/\.test\.tsx?$/.test(p));
    assert.ok(files.length >= 12, `only ${files.length} test files read`);
    const found = files.flatMap((file) => eagerCode(file, readFileSync(join(root, file), "utf8")));
    assert.deepEqual(found, [], `move this into it() or a before() hook:\n${found.join("\n")}`);
  });

  it("the check itself: flags code that runs, allows what only registers tests", () => {
    const sample = [
      'import { before, describe, it } from "node:test";',
      'describe("s", () => {',
      "  const files = sourceFiles(root);",
      "  const read = (f: string) => readFileSync(f);",
      "  let cached: string[] | undefined;",
      "  const LIMIT = 3;",
      "  function helper() { return compute(); }",
      "  before(() => { compute(); });",
      '  it("t", () => { compute(); });',
      "  it(`${name()}`, () => {});",
      "  for (const [id] of CASES) { it(id, () => {}); }",
      "  for (const [id] of Object.entries(X)) { it(id, () => {}); }",
      '  if (LIMIT > 2) it("u", () => {});',
      "  compute();",
      '  describe("inner", () => { const x = new Thing(); it("v", () => {}); });',
      "});",
    ].join("\n");
    const lines = eagerCode("sample.test.ts", sample).map((f) => Number(/:(\d+) /.exec(f)?.[1]));
    assert.deepEqual(lines, [3, 10, 12, 13, 14, 15]);
  });
});
