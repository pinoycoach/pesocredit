import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CANNOT_COMPUTE_TEXT, formatDateFil, OLD_LOAN_NOTICE } from "./copy.ts";
import type { CannotComputeReason } from "./loan-math.ts";

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
