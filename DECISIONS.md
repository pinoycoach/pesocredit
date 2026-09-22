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
- N13 — Email provider for /api/subscribe, and whether it expects JSON or form-encoded — OPEN — resolve from the provider's live dashboard/docs (point 12)
- N14 — Payment link for the ₱99 guide — OPEN — needed before the guide sells, not before the calculator launches
- N15 — The ₱99 guide itself (content, shape) — OPEN — content; goes through independent content review (point 14) before sale
- N19 — Merge these planning files into the repo: its existing CLAUDE.md (from Phase 1) and existing single rules-constants file (from Phase 3) are kept and extended, not overwritten — OPEN — first step of Phase 4
- N20 — Move to pinoycoach/pesocredit — OPEN — pushed and verified 2026-09-23: 23 commits, HEAD 6e975d1; CI #1 green on all 6 jobs (ubuntu, macOS, Windows × Node 22, 24). Remaining only: archive yarrow-gem-garden-rose. Local copy: C:\Users\PhiKi\Downloads\peso-credit-day1\peso-credit
- N16 — Lender names list in the calculator — OPEN — intentionally empty; fine to launch empty

## Blocking

- N8 — Legal review for factual claims about real lending companies: needed, and when? — BLOCKING — gate: no content naming a specific lender goes live until resolved. (Tunay na Interes names no lender, so this does not gate the calculator.)
- N17 — Nine privacy-policy placeholders filled, then reviewed in the hour with Napoleon's lawyer — BLOCKING — gate: the calculator does not go live with email capture until done (Data Privacy Act)
- N18 — Rate limiting on /api/subscribe via hosting firewall or email provider limits (same-origin check alone is not enough) — BLOCKING — gate: deploy

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

## Revisit

- (none yet)

---

*When Claude Code (or any coding tool) reports "still open" items in a phase report, they should
match this file exactly — if they don't, this file is stale and gets fixed first, before more work
lands on top of a decision nobody can see the current status of.*
