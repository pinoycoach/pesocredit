import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeLoan, irrDaily, type LoanInput } from "./loan-math.ts";

const base = (over: Partial<LoanInput> = {}): LoanInput => ({
  principal: 10_000,
  upfrontFee: 0,
  payment: 11_200,
  paymentCount: 1,
  frequency: "monthly",
  firstDueDays: 30,
  penalty: 0,
  unsecured: true,
  generalPurpose: true,
  lenderKind: "lending_or_financing",
  bookedOn: "2026-09-18",
  followUpDay: null,
  ...over,
});

describe("irrDaily", () => {
  it("prices a 30-day single payment at the period rate", () => {
    const r = irrDaily([
      { day: 0, amount: 10_000, label: "in" },
      { day: 30, amount: -11_500, label: "out" },
    ]);
    assert.ok(r !== null);
    const month = Math.pow(1 + r!, 30) - 1;
    assert.ok(Math.abs(month - 0.15) < 1e-6);
  });
});

describe("analyzeLoan", () => {
  it("flags 12% monthly EIR cap under MC 14", () => {
    const ok = analyzeLoan(base({ payment: 11_200 }));
    assert.ok(ok);
    assert.equal(ok!.covered, true);
    assert.ok(Math.abs(ok!.eirPerMonth - 0.12) < 1e-6);
    assert.equal(ok!.hits.find((h) => h.id === "eir")?.over, false);

    const high = analyzeLoan(base({ payment: 11_500 }));
    assert.ok(high);
    assert.ok(high!.eirPerMonth > 0.12);
    assert.equal(high!.hits.find((h) => h.id === "eir")?.over, true);
  });

  it("uses 15% EIR cap for covered loans booked before 1 Apr 2026", () => {
    const r = analyzeLoan(base({ payment: 11_500, bookedOn: "2026-03-01" }));
    assert.ok(r);
    assert.equal(r!.eirCap, 0.15);
    assert.equal(r!.hits.find((h) => h.id === "eir")?.over, false);
  });

  it("passes when both 6% nominal and 12% EIR hold", () => {
    const r = analyzeLoan(base({ payment: 10_600 }));
    assert.ok(r);
    assert.equal(r!.anyOver, false);
    assert.ok(r!.nominalPerMonth <= 0.06 + 1e-6);
  });

  it("does not apply numeric caps to banks or oversize loans", () => {
    const bank = analyzeLoan(base({ lenderKind: "bank", payment: 20_000 }));
    assert.equal(bank!.covered, false);
    assert.equal(bank!.anyOver, false);

    const big = analyzeLoan(base({ principal: 20_000, payment: 30_000 }));
    assert.equal(big!.covered, false);
  });


  it("computes a 7-day payday cash-flow EIR", () => {
    const r = analyzeLoan(
      base({
        principal: 5_000,
        payment: 6_500,
        frequency: "weekly",
        firstDueDays: 7,
        paymentCount: 1,
      }),
    );
    assert.ok(r);
    assert.equal(r!.tenorDays, 7);
    assert.ok(r!.eirPerMonth > 0.12);
    assert.equal(r!.hits.find((h) => h.id === "eir")?.over, true);
    assert.equal(r!.netProceeds, 5_000);
  });

  it("treats deducted fees as lower net proceeds (higher EIR)", () => {
    const r = analyzeLoan(
      base({
        principal: 5_000,
        upfrontFee: 800,
        payment: 5_500,
        frequency: "weekly",
        firstDueDays: 7,
        paymentCount: 1,
      }),
    );
    assert.ok(r);
    assert.equal(r!.netProceeds, 4_200);
    assert.ok(r!.eirPerMonth > 0.12);
  });
});
