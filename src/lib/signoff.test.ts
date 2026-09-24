/**
 * BUILD-STANDARD point 10: SIGNOFF.json is checked for structure, never for a snapshot of
 * who has signed so far. The real file must be sound whatever its state; a signed item
 * whose content has changed fails; and the workflow succeeding (everything signed) is
 * tested today, on a copy, while the real file is still unsigned.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";
import { analyzeLoan } from "./loan-math.ts";
import {
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
  PRIVACY_VERSION,
  remainingPlaceholders,
} from "./privacy-copy.ts";
import * as rules from "./rules.ts";
import {
  canonical,
  contentOf,
  currentHashes,
  hashContent,
  RULES_LOGIC_EXPORTS,
  SIGNER,
  SIGNOFF_IDS,
  type SignoffRecord,
  unsigned,
  validate,
} from "./signoff.ts";
import { sourceFiles, srcRoot } from "./test-utils/source-strings.ts";
import { COVERAGE_INPUTS, GOLDEN_INPUTS } from "./test-utils/loan-fixtures.ts";

const record = JSON.parse(
  readFileSync(new URL("../../SIGNOFF.json", import.meta.url), "utf8"),
) as SignoffRecord;
const current = currentHashes();
const NOW = new Date("2026-09-23T00:00:00Z");

/** A copy of the record with every item signed at the current hashes. */
const allSigned = (): SignoffRecord => ({
  items: SIGNOFF_IDS.map((id) => ({
    id,
    signature: { signer: SIGNER, date: "2026-09-23", hash: current[id] },
  })),
});

describe("SIGNOFF.json", () => {
  it("is sound: each id once, well-formed signatures, nothing changed since it was signed", () => {
    const problems = validate(record, current, new Date());
    assert.deepEqual(problems, [], problems.join("\n"));
  });

  it("reports what is still unsigned (a notice; npm run launch-check is the gate)", (t) => {
    const open = unsigned(record);
    if (open.length > 0) {
      t.diagnostic(`SIGNOFF: not signed yet: ${open.join(", ")}. See npm run signoff:hashes.`);
    }
  });

  it("the privacy page is never signed while it still has blanks", () => {
    const signed = record.items.find((i) => i.id === "privacy-page")?.signature != null;
    if (signed) assert.deepEqual(remainingPlaceholders(), []);
  });
});

describe("the workflow succeeding (point 10)", () => {
  it("everything signed at the current content passes", () => {
    assert.deepEqual(validate(allSigned(), current, NOW), []);
    assert.deepEqual(unsigned(allSigned()), []);
  });

  it("reviewedBy is optional, and accepted when given", () => {
    const r = allSigned();
    r.items[0].signature!.reviewedBy = "the lawyer (N17)";
    assert.deepEqual(validate(r, current, NOW), []);
  });

  it("a date one day ahead of UTC is accepted (Philippine time runs ahead)", () => {
    const r = allSigned();
    r.items[0].signature!.date = "2026-09-24";
    assert.deepEqual(validate(r, current, NOW), []);
  });
});

describe("the checker catches (point 6: each breakage, re-runnable)", () => {
  const problemsWith = (change: (r: SignoffRecord) => void) => {
    const r = allSigned();
    change(r);
    return validate(r, current, NOW);
  };
  const expectProblem = (change: (r: SignoffRecord) => void, pattern: RegExp) => {
    const problems = problemsWith(change);
    assert.ok(problems.some((p) => pattern.test(p)), `expected ${pattern}, got ${JSON.stringify(problems)}`);
  };

  it("content changed after signing", () => {
    for (const id of SIGNOFF_IDS) {
      const changed = { ...current, [id]: hashContent("something else") };
      const problems = validate(allSigned(), changed, NOW);
      assert.ok(
        problems.some((p) => p.startsWith(`${id} changed since ${SIGNER} signed it on 2026-09-23`)),
        JSON.stringify(problems),
      );
    }
  });

  it("a one-character change in the content changes its hash", () => {
    const content = canonical(contentOf("privacy-page"));
    const edited = JSON.parse(content.replace("Privacy", "Privacv"));
    assert.notEqual(hashContent(edited), current["privacy-page"]);
  });

  it("a duplicate, unknown or missing id", () => {
    expectProblem((r) => r.items.push({ ...r.items[0] }), /^privacy-page: listed 2 times$/);
    expectProblem((r) => r.items.push({ id: "about-page", signature: null }), /^about-page: unknown id/);
    expectProblem((r) => r.items.pop(), /^cap-values: missing$/);
  });

  it("a signature that is not well-formed", () => {
    const sig = (r: SignoffRecord) => r.items[0].signature!;
    expectProblem((r) => (sig(r).signer = "Claude"), /signer must be "Napoleon"/);
    expectProblem((r) => (sig(r).date = "2026-02-30"), /date must be a real date/);
    expectProblem((r) => (sig(r).date = "23 Sep 2026"), /date must be a real date/);
    expectProblem((r) => (sig(r).date = "2026-09-25"), /is in the future/);
    expectProblem((r) => (sig(r).hash = "sha256:abc"), /hash must be/);
    expectProblem((r) => (sig(r).hash = current["privacy-page"].toUpperCase()), /hash must be/);
    expectProblem((r) => (sig(r).reviewedBy = " "), /reviewedBy/);
    expectProblem(
      (r) => ((sig(r) as unknown as Record<string, unknown>).approved = true),
      /unknown signature field "approved"/,
    );
  });

  it("a record that is not a record", () => {
    assert.deepEqual(validate([], current, NOW), ['SIGNOFF.json must be { "items": [...] }']);
    assert.deepEqual(validate({ items: {} }, current, NOW), ['SIGNOFF.json must be { "items": [...] }']);
    assert.ok(validate({ items: [{ id: "privacy-page" }] }, current, NOW)[0].startsWith("not an item"));
  });
});

describe("what each signature covers", () => {
  it("hashes ignore key order", () => {
    assert.equal(hashContent({ a: 1, b: { c: 2, d: 3 } }), hashContent({ b: { d: 3, c: 2 }, a: 1 }));
  });

  it("cap-values: every exported value of rules.ts, the examples from the circular included", () => {
    const covered = contentOf("cap-values") as Record<string, unknown>;
    const values = Object.keys(rules).filter((name) => !RULES_LOGIC_EXPORTS.includes(name));
    assert.deepEqual(Object.keys(covered).sort(), values.sort());
    for (const name of ["CEILINGS", "COVERAGE", "SOURCE", "OTHER_FEES_EXAMPLES", "CIRCUMVENTION_EXAMPLES"]) {
      assert.ok(name in covered, name);
    }
  });

  it("cap-values: a new function in rules.ts must be classified before it can be left out", () => {
    const functions = Object.entries(rules)
      .filter(([, value]) => typeof value === "function")
      .map(([name]) => name);
    assert.deepEqual(functions.sort(), [...RULES_LOGIC_EXPORTS].sort());
  });

  it("verdict-wording: the loans reach every verdict and every coverage outcome", () => {
    const loans = { ...GOLDEN_INPUTS, ...COVERAGE_INPUTS };
    const verdicts = new Set<string>();
    const coverage = new Set<string>();
    const statuses = new Set<string>();
    for (const input of Object.values(loans)) {
      const a = analyzeLoan(input);
      statuses.add(a.status);
      if (a.status !== "ok") continue;
      coverage.add(a.coverage.state);
      for (const check of Object.values(a.checks)) if (check.state) verdicts.add(check.state);
    }
    assert.deepEqual([...verdicts].sort(), ["GRAY", "OVER", "WITHIN"]);
    assert.deepEqual([...coverage].sort(), ["COVERED", "MAYBE", "NOT_COVERED"]);
    assert.ok(statuses.has("before_effective_date"));
  });

  it("verdict-wording: one loan for each reason a loan is not covered", () => {
    const reasons = Object.values(COVERAGE_INPUTS).flatMap((input) => {
      const a = analyzeLoan(input);
      return a.status === "ok" && a.coverage.state === "NOT_COVERED" ? a.coverage.reasons : [];
    });
    assert.equal(reasons.length, 5, "bank, secured, purpose, principal, tenor");
  });

  it("privacy-page: the live version, every section, the last-updated line, and not the DRAFT banner", () => {
    const content = contentOf("privacy-page") as { version: string; lastUpdated: string | null; sections: unknown[] };
    assert.equal(content.version, PRIVACY_VERSION, "which version is signed (N45)");
    assert.deepEqual(content.sections, PRIVACY_SECTIONS, "the live page's sections");
    assert.equal(content.lastUpdated, PRIVACY_LAST_UPDATED);
    assert.ok(canonical(content).includes("\"Contact\""), "the Contact section");
    assert.ok(!canonical(content).includes("DRAFT"));
  });

  it("privacy-page: switching version changes the hash, so a signed v1 does not carry over (N45)", () => {
    const content = contentOf("privacy-page") as Record<string, unknown>;
    const other = { ...content, version: content.version === "v1" ? "full" : "v1" };
    assert.notEqual(hashContent(other), current["privacy-page"]);
  });
});

describe("signoff.ts never reaches the site", () => {
  it("no app file imports it: only tests, test-utils and tools/signoff.ts", () => {
    const root = srcRoot();
    const importers = sourceFiles(root, (p) => /\.test\.tsx?$/.test(p)).filter((file) => {
      const sf = ts.createSourceFile(file, readFileSync(join(root, file), "utf8"), ts.ScriptTarget.Latest, true);
      return sf.statements.some(
        (s) =>
          ts.isImportDeclaration(s) &&
          ts.isStringLiteral(s.moduleSpecifier) &&
          /(^|\/)signoff(\.ts)?$/.test(s.moduleSpecifier.text),
      );
    });
    assert.deepEqual(importers, []);
  });
});
