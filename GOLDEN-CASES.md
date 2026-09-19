# Golden test cases — peso.credit calculator

Computed 19 Sep 2026 by an **independent Python implementation** (not the app's code).
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

## Boundary cases still to add as tests
- Principal ₱10,000 (covered) vs ₱10,001 (not covered)
- Tenor 120 days (covered) · 121–123 days (GRAY coverage) · 124 days (not covered)
- Contract dated 31 Mar 2026 vs 1 Apr 2026
- Fee ≥ principal (must return "cannot compute", not crash)
- Payments totaling less than principal
