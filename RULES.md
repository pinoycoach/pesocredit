# RULES.md — peso.credit

Point 1: every fact from outside the code lives in exactly one sourced place. This file says where
each kind of fact lives. It does not repeat any of them.

## Legal numbers and caps → `src/lib/rules.ts`

Every legal number (which circular applies and from when, what loans it covers, and every ceiling)
lives only in [`src/lib/rules.ts`](src/lib/rules.ts), each with its source section.
`src/lib/rules-only.test.ts` fails if any other source file writes one out.

Do not copy any of those numbers here or anywhere else. To cite one, point to `rules.ts`.

**The one documented exception:** [`tools/golden/oracle.py`](tools/golden/oracle.py), the
independent oracle behind GOLDEN-CASES.md, writes out its own copy of the caps. That is
deliberate: it shares nothing with the app, so one wrong cap cannot pass both sides.
`tools/golden/check.py`, run by CI on every push, fails if the oracle's caps differ from
`rules.ts` or its output differs from GOLDEN-CASES.md (DECISIONS N28).

## Lender-specific facts

Gated by DECISIONS.md N8 (legal review). **This section stays empty until N8 is RESOLVED.**

When it opens, each entry is one fact about one named company, with its source (document, date,
and where to find it) and the date it was last checked.

- (none)
