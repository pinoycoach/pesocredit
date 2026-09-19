# peso.credit — Tunay na Interes calculator

## What this is
A free, Filipino-language calculator. A borrower enters the numbers from their own loan;
the app shows the true cost: **"Ang totoong gastos mo: X% kada buwan. Sa araw Z, ₱Y ang kabuuang babayaran mo."**
The comparison to the published SEC ceiling appears underneath, as a fact with its source.

## Non-negotiable principles
1. **Inform, never accuse.** Never name a lender. Never say "ilegal", "scam", "illegal", "fraud", "loan shark". State the number next to the published rule.
2. **Accuracy over confidence.** Where the law is ambiguous, show GRAY ("malapit sa ceiling"), never OVER. See `src/lib/rules.ts`.
3. **Nothing the borrower types leaves their phone.** All loan math runs client-side. No loan numbers are stored or sent, ever.
4. **Email capture is optional, separate, and never gates a result.** Email is never sent together with loan numbers.
5. **Not legal advice.** Describe rules and where to file; never tell someone what they should do or promise an outcome.

## Where things live
- `src/lib/rules.ts` — every legal number, with its source section. The ONLY place legal constants may exist.
- `src/lib/loan-math.ts` — the math. Must import all caps from `rules.ts`.
- `GOLDEN-CASES.md` — hand-verified cases. Tests must reproduce them exactly.

## Testing standard (all must pass before any commit)
- `npm test` runs ALL tests, including `src/lib/loan-math.test.ts`.
- Golden cases G1–G7 reproduced to 4 decimals.
- Boundary cases listed in GOLDEN-CASES.md.
- Property checks: a bigger deducted fee always raises the EIR; total cost is never negative.
- Banned-phrase test: fails if any on-screen string contains a banned word (list above) or any lender name.
- `npm run typecheck`, `npm run lint`, `npm run build` all pass.

## Working rules for Claude
- Plan first; wait for approval before code. One commit per step.
- Cite file:line for findings. Mark anything unverified as UNVERIFIED. Never invent a regulatory fact.
- When you make a mistake the user corrects, add the lesson to this file.

## Lessons
- SEC circular numbers restart every year: MC 14 s. 2025 (lending caps) ≠ MC 14 s. 2026 (umbrella funds). Always cite number AND series.
- "Up to four months" ≠ 120 days.
