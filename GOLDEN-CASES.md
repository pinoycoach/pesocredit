# Golden test cases — peso.credit calculator

Computed 19 Sep 2026 by an **independent Python implementation** (not the app's code): `tools/golden/oracle.py`.
Cross-checked: the app's `loan-math.ts` matches every value below to 4 decimals.
Rules: SEC MC No. 14, s. 2025. Three-state EIR verdict per `rules.ts`.

| ID | Loan | Daily EIR | ×30 (simple) | Compounded | Nominal/mo | Total cost | Verdict |
|---|---|---|---|---|---|---|---|
| G1 | ₱5,000 · 30 araw · isang bayad ₱5,300 · walang fee | 0.1944% | 5.83% | 6.00% | 6.00% | 6.0% | EIR within |
| G2 | ₱5,000 · 7 araw · isang bayad ₱6,500 | 3.8192% | 114.58% | 207.84% | 128.57% | 30.0% | NIR over, EIR OVER |
| G3 | ₱5,000 · ₱65 fee binawas · 7 araw · ₱5,070 | 0.3863% | 11.59% | 12.26% | 6.00% | 2.7% | EIR GRAY |
| G4 | ₱5,000 · ₱800 fee binawas · 7 araw · ₱5,500 | 3.9275% | 117.83% | 217.62% | 42.86% | 26.0% | NIR over, EIR OVER |
| G5 | ₱3,000 · ₱450 fee binawas · 14 araw · ₱3,000 | 1.1676% | 35.03% | 41.66% | 0.00% | 15.0% | EIR OVER |
| G6 | ₱10,000 · 4 lingguhang hulog na ₱2,560 | 0.1359% | 4.08% | 4.16% | 2.57% | 2.4% | EIR within |
| G7 | ₱3,000 · 30 araw · ₱3,150 + ₱2,900 penalty | 0.1628% | 4.88% | 5.00% | 5.00% | 101.7% | EIR within, total-cost OVER |

## Why each case exists

- **G1** — Sits exactly at the 6%/month nominal cap. Tests the boundary (must be WITHIN, not OVER).
- **G2** — The app's default example. Clearly over on everything; any change that makes it pass is a bug.
- **G3** — The gray zone: daily EIR 0.386% is under the SEC's "~0.40%/day", but compounds to 12.26%. Must show GRAY, never OVER.
- **G4** — A deducted fee drives the EIR far above the headline rate.
- **G5** — **"0% interest" loan with a deducted fee.** Nominal 0%, EIR 35%/month. The best teaching example we have.
- **G6** — Multi-installment loan at the ₱10,000 coverage boundary (₱10,000 is covered; ₱10,001 is not).
- **G7** — EIR fine, but penalties push total cost past 100% of the amount borrowed.

## Check them yourself in Excel / Google Sheets (third, independent check)

Single payment (G1–G5, G7): daily EIR = `=(payment/(principal-fee))^(1/days)-1`
e.g. G3: `=(5070/(5000-65))^(1/7)-1` → 0.3863%

Installments (G6): weekly rate `=RATE(4,-2560,10000)`, then daily `=(1+weekly)^(1/7)-1` → 0.1359%

Monthly: simple `=daily*30`, compounded `=(1+daily)^30-1`

## Independent check behind each case

The table above is read by `src/lib/loan-math.test.ts` (`goldenTable()`), which requires exactly
the rows G1–G7 with 7 cells each. Record checks here, never as a new table column.

| Cases | Values checked | Independent check | Where it runs |
|---|---|---|---|
| All seven | every column, including Nominal/mo and total cost | Independent Python implementation (bisection), [`tools/golden/oracle.py`](tools/golden/oracle.py): written 19 Sep 2026, recovered from the Day 1 chat 23 Sep 2026 | CI, every push: `python tools/golden/check.py` runs the oracle and compares all 49 cells with this table, and the oracle's own caps with `rules.ts`. First re-run 23 Sep 2026 (Python 3.14.0, Windows): all match |
| G1–G5, G7 | daily EIR | Spreadsheet formula `(payment / (principal − fee))^(1/days) − 1`, written out in the test, not taken from `loan-math.ts` | `loan-math.test.ts`, "single-payment cases match the spreadsheet formula", every `npm test` |
| G6 only | daily EIR | Annuity rate found by bisection (the `RATE` check), then converted to daily; written in the test, not taken from `loan-math.ts` | `loan-math.test.ts`, `annuityDailyRate` + "G6 matches the annuity rate", every `npm test` |
| G3 only | EIR verdict GRAY | Simple month under the cap, compounded month over it | `loan-math.test.ts`, "G3 is GRAY, never OVER", every `npm test` |

×30 and compounded follow from daily EIR by the formulas above. **Nominal/mo and total cost are
checked independently only by `oracle.py`**; `npm test` compares them to this table, nothing else.

## Boundary cases (all tested in `src/lib/loan-math.test.ts`)
- Principal ₱10,000 (covered) vs ₱10,001 (not covered: no ceiling comparison) — `boundary: principal`
- Tenor 120 days (covered) · 121–123 days (GRAY coverage, "maaaring sakop": an OVER result is shown as GRAY) · 124 days (not covered) — `boundary: tenor`
- Contract dated 31 Mar 2026 (numbers shown, no ceiling comparison, notice "Ang tool na ito ay para sa loans simula 1 Abril 2026.") vs 1 Apr 2026 (compared); no time-zone dependence — `boundary: contract date`
- Fee ≥ principal returns "cannot compute", does not crash — `boundary: cannot compute`
- Payments totaling less than principal returns "cannot compute" — `boundary: cannot compute`. Interpretation: scheduled payments below the net proceeds received (a penalty does not rescue them); with a deducted fee, payments below principal but at or above the net proceeds are a valid loan. Your original line named no expected result, so change this if you meant something else.

Also tested: a loan exactly on the effective-rate cap is WITHIN, not GRAY (floating-point tolerance); exactly on the nominal and total-cost caps is WITHIN; property checks (a bigger deducted fee always raises the EIR; total cost is never negative; a higher payment never lowers the verdict).

Also tested, not listed above until now: payments equal to the net proceeds are a zero-cost loan, not an error; dates that are not real calendar dates are rejected; bad numbers return "cannot compute" with a reason; a lender type, security or purpose outside the circular's coverage gives no ceiling comparison; a penalty raises total cost but never the EIR; uncertain coverage never makes a within-cap loan look worse; uncertain coverage never yields OVER, and uncovered loans never yield a verdict.
