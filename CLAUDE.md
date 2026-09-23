# CLAUDE.md — peso.credit

## Read first, every session

1. `docs/BUILD-STANDARD.md`
2. `DECISIONS.md`
3. `HANDOVER.md` (which phase we are in, and where it stops)

## Standard

**This project follows `docs/BUILD-STANDARD.md` in full — points 1–7 and points 8–17. Not just the
original seven.**

Two points matter more here than they did on fengshui.mom, because peso.credit is
**content-first, not calculation-first**:

- **Point 16 — the decisions log.** `DECISIONS.md` is the only source of truth for what is open,
  blocking, or resolved. Never carry status from chat memory. Any "still open" list in a phase
  report must match `DECISIONS.md` exactly; if it doesn't, fix `DECISIONS.md` before doing
  anything else.
- **Point 14 — independent content review.** Most of what this project ships is *judgment*
  (how a claim about a lender is worded, whether a description overclaims, whether a term is used
  correctly), not arithmetic. Independent content review by reviewers with no stake in the work is
  mandatory before sign-off on any public-facing copy — not optional, not "if time allows."
  Independent calculation review still applies to anything that is a calculation.

## What this project is (as decided — see DECISIONS.md N1–N6)

- Domain: peso.credit
- First focus: online lending apps (OLA) in the Philippines. Informational, not advocacy.
  Direct competitor to Moneymax.
- Revenue: affiliate customer acquisition.
- Tone: factual and informational. Not a crusade against any specific lender.
- Later focus: credit cards and general money handling.
- Second project after fengshui.mom (live).
- First product: the Tunay na Interes calculator, live at peso.credit (N7).
  Repo: pinoycoach/pesocredit (moved from yarrow-gem-garden-rose). It names no lender, by design.

## First product: Tunay na Interes calculator

A free, Filipino-language calculator. A borrower enters the numbers from their own loan;
the app shows the true cost: **"Ang totoong gastos mo: X% kada buwan. Sa araw Z, ₱Y ang kabuuang babayaran mo."**
The comparison to the published SEC ceiling appears underneath, as a fact with its source.

## Non-negotiable principles
1. **Inform, never accuse.** Never name a lender. Never say "ilegal", "scam", "illegal", "fraud", "loan shark". State the number next to the published rule.
2. **Accuracy over confidence.** Where the law is ambiguous, show GRAY ("malapit sa ceiling"), never OVER. See `src/lib/rules.ts`.
3. **Nothing the borrower types leaves their phone.** All loan math runs client-side. No loan numbers are stored or sent, ever.
4. **Email capture is optional, separate, and never gates a result.** Email is never sent together with loan numbers.
5. **Not legal advice.** Describe rules and where to file; never tell someone what they should do or promise an outcome.

## Standing gates

- **No content naming a specific lender goes live until DECISIONS.md N8 (legal review) is
  RESOLVED.**
- Every factual claim about a real company traces to a sourced entry in `RULES.md` →
  "Lender-specific facts", which stays empty until N8 is RESOLVED. Legal numbers and caps live
  only in `src/lib/rules.ts`; `RULES.md` points to it and never repeats them (point 1: each fact
  in exactly one sourced place).

## Where things live
- `src/lib/rules.ts` — every legal number, with its source section. The ONLY place legal constants may exist.
- `src/lib/loan-math.ts` — the math. Must import all caps from `rules.ts`.
- `GOLDEN-CASES.md` — hand-verified cases. Tests must reproduce them exactly.
- `RULES.md` — points to `rules.ts` for legal numbers; holds lender-specific facts (empty until N8).
- `DECISIONS.md` — open, blocking, and resolved decisions (point 16).
- `docs/BUILD-STANDARD.md` — the build standard, points 1–17.
- `HANDOVER.md` — phases and their stops (point 2).

## Environment (point 8) — INCOMPLETE, see DECISIONS.md N9

| Role          | OS / platform |
|---------------|---------------|
| Builder       | Napoleon's Windows machine, PowerShell (confirmed 2026-09-23) |
| Runner (tests)| Napoleon: Windows (per BUILD-STANDARD point 8) — confirm |
| Deploy target | Vercel (Linux) — recommended, build preset already "vercel"; awaiting confirmation (N9) |

Until this table is filled in, nothing is "done." If builder and runner differ, nothing is done
until it has run on both. Known Windows traps from fengshui.mom: CRLF churn, `\` vs `/` paths,
`multiprocessing` needing a `__main__` guard (spawn, not fork).

## Credentials (point 15)

Decide scopes before writing any integration. The key in the live request path gets the
narrowest scope possible; broader keys are separate and used rarely, ideally by a human.
No integrations are defined yet.

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

## Current phase

Phase 0 done. Now: Phase 4, step group B in HANDOVER.md (bring the calculator up to v2, then
deploy). Every step group stops for review.

## Lessons

(Carried forward from fengshui.mom via BUILD-STANDARD points 8–17. Add peso.credit's own lessons
here during the final retro phase — point 17.)

- SEC circular numbers restart every year: MC 14 s. 2025 (lending caps) ≠ MC 14 s. 2026 (umbrella funds). Always cite number AND series.
- "Up to four months" ≠ 120 days.
