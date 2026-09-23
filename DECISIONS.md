# DECISIONS

The live record of open and resolved decisions for peso.credit. Both the planning conversation
and the coding tool read this before acting, and update it the moment something changes — never
just in chat scrollback. Keep it short: one line to open an item, one line to close it.

Format per item: `<ID> — <one-line question> — STATUS — <resolution, if any>`

Status is one of: **OPEN** (blocks nothing yet, but unresolved) · **BLOCKING** (a real gate can't
pass without this) · **RESOLVED** (decided, with the answer recorded) · **REVISIT** (decided once,
worth reconsidering if circumstances named here change).

---

## Open

- N9 — Hosting and environment (point 8). Builder: Napoleon's Windows machine. Build target already set to Vercel (Nitro "vercel" preset, kept in Phase 1); Vercel builds on Linux. Recommendation on record: Vercel over Railway (static pages + one serverless function, no DB). — OPEN — awaiting Napoleon's confirmation
- N10 — Affiliate programs/partners and disclosure wording — OPEN — needed before any monetized page goes live; not needed for the calculator launch
- N13 — Email provider for /api/subscribe, and whether it expects JSON or form-encoded — OPEN — resolve from the provider's live dashboard/docs (point 12). The key must be scoped to "create one contact in one list" (point 15): the provider must accept this; URL secret vs header key decides whether subscribe.ts changes. No code change until N13 is resolved.
- N14 — Payment link for the ₱99 guide — OPEN — needed before the guide sells, not before the calculator launches
- N15 — The ₱99 guide itself (content, shape) — OPEN — content; goes through independent content review (point 14) before sale
- N20 — Move to pinoycoach/pesocredit — OPEN — pushed and verified 2026-09-23: 23 commits, HEAD 6e975d1; CI #1 green on all 6 jobs (ubuntu, macOS, Windows × Node 22, 24). Remaining only: archive yarrow-gem-garden-rose. Local copy: C:\Users\PhiKi\Downloads\peso-credit-day1\peso-credit
- N16 — Lender names list in the calculator — OPEN — intentionally empty; fine to launch empty
- N22 — Point 10: privacy.test.ts:34, :74 and :81 assert the page's current DRAFT state, so they break the day N17 succeeds (DRAFT removed, contact email filled in) — OPEN — Group C step C4
- N23 — Point 10: no SIGNOFF record for the privacy page, the verdict wording and the cap values in rules.ts (signer, date, hash of the exact content; fails if signed content changes) — OPEN — Group C step C3, design first
- N24 — Point 6: a duplicate G-id in GOLDEN-CASES.md silently overwrites a real row in the golden-case test (loan-math.test.ts:102-104); an unexpected id already fails — OPEN — Group C step C5
- N25 — package.json lists test files by hand, so a new *.test.ts would silently not run — OPEN — Group C step C6: keep the list, add a test that fails if any test file under src/ is missing from it
- N26 — subscribe.test.ts:75 holds a literal NUL byte, so git treats the file as binary and hides its diffs from review — OPEN — Group C step C7
- N27 — Points 1 and 9: tools/golden/oracle.py is not run by CI, so the independent check of G1–G7 can go stale — OPEN — Group C step C8
- N28 — Point 1: oracle.py hardcodes its own caps, outside rules.ts — OPEN — keep them as the one documented exception (importing rules.ts would let one wrong cap pass both sides); say so in RULES.md and at the top of oracle.py; the C8 drift check keeps the two copies in agreement — Group C step C8
- N29 — Point 11: the bundle secret scan was done by hand (b0a9bdb, 6e975d1) and is not in CI — OPEN — Group C step C9: fresh build with a dummy secret, fail if it appears in client output
- N31 — Point 11: mobile layout last checked at 1e9c32e; seven UI commits since, and /privacy has never had a recorded mobile check — OPEN — re-run on the current UI before launch. ("UI hash" was the one-time Phase 1 SHA-256 before/after check that cleanup changed no pixels; not a standing check, nothing to re-run.)

## Blocking

- N8 — Legal review for factual claims about real lending companies: needed, and when? — BLOCKING — gate: no content naming a specific lender goes live until resolved. (Tunay na Interes names no lender, so this does not gate the calculator.)
- N17 — Nine privacy-policy placeholders filled, then reviewed in the hour with Napoleon's lawyer — BLOCKING — gate: the calculator does not go live with email capture until done (Data Privacy Act)
- N18 — Rate limiting on /api/subscribe via hosting firewall or email provider limits (same-origin check alone is not enough) — BLOCKING — gate: deploy
- N32 — Point 14: independent content review of all public-facing copy (Filipino and English) — BLOCKING — gate: launch (HANDOVER pre-launch gates); COPY-REVIEW.md is produced after Group C step C9 so reviewers can read every on-screen string cold

## Resolved

- N1 — Domain? — RESOLVED — peso.credit (2026-09-23)
- N2 — First content focus? — RESOLVED — online lending apps (OLA); informational content, not advocacy; positioned as a direct competitor to Moneymax, not merely modeled on it (2026-09-23)
- N3 — Revenue model? — RESOLVED — customer acquisition as an affiliate (2026-09-23)
- N4 — Tone? — RESOLVED — informational and factual; faster and less gated than politically-sensitive content, but not a crusade against any specific lender (2026-09-23)
- N5 — Second content focus (later)? — RESOLVED — credit cards and general money handling (2026-09-23)
- N6 — Sequencing? — RESOLVED — fengshui.mom shipped first and is live; peso.credit is the second project (2026-09-23)
- N11 — Reuse the SuperGrok OLA codebase or start clean? — RESOLVED — reused and reworked: yarrow-gem-garden-rose audited, then Phases 1 (cleanup), 2 (correctness), 3 (trust) approved and pushed (2026-09-22)
- N7 — Is the peso.credit calculator Tunay na Interes or a new one, and where does it go live? — RESOLVED — Tunay na Interes IS peso.credit's first product and goes live at peso.credit; repo is now pinoycoach/pesocredit (moved from yarrow-gem-garden-rose, N20) (2026-09-23)
- N12 — Original points 1–7 missing from docs/BUILD-STANDARD.md — RESOLVED — full text of 1–7 added above 8–17 (2026-09-23)
- N19 — Merge these planning files into the repo: its existing CLAUDE.md (from Phase 1) and existing single rules-constants file (from Phase 3) are kept and extended, not overwritten — RESOLVED — Phase 4 step group A: planning files added (f6bd87e), CLAUDE.md merged (e451c8b), RULES.md points to src/lib/rules.ts with no overlap (e1ff0fb), GOLDEN-CASES.md records each case's independent check with tools/golden/oracle.py (2026-09-23)
- N30 — Point 15: HANDOVER.md step group D asks for a send-only email key, but /api/subscribe only adds a contact — RESOLVED — HANDOVER.md step group D now asks for a key scoped to "create one contact in one list"; the provider question moved into N13 (2026-09-23)

## Revisit

- N21 — Principle 1 "Never name a lender" and the banned-phrase test apply project-wide — REVISIT — kept as-is for launch (2026-09-23); scope both to the calculator before any lender-naming content is written, which can only happen after N8 is RESOLVED
- N33 — Point 9: guard proofs ("N deliberate breakages were all caught") were done by hand and live only in commit messages — REVISIT — hand-done guard proofs become one re-runnable build-then-test script; after launch

---

*When Claude Code (or any coding tool) reports "still open" items in a phase report, they should
match this file exactly — if they don't, this file is stale and gets fixed first, before more work
lands on top of a decision nobody can see the current status of.*
