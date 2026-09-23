# RULES.md — peso.credit

Point 1: every fact from outside the code lives in exactly one sourced place. This file says where
each kind of fact lives. It does not repeat any of them.

## Legal numbers and caps → `src/lib/rules.ts`

Every legal number (which circular applies and from when, what loans it covers, and every ceiling)
lives only in [`src/lib/rules.ts`](src/lib/rules.ts), each with its source section.
`src/lib/rules-only.test.ts` fails if any other source file writes one out.

Do not copy any of those numbers here or anywhere else. To cite one, point to `rules.ts`.

## Lender-specific facts

Gated by DECISIONS.md N8 (legal review). **This section stays empty until N8 is RESOLVED.**

When it opens, each entry is one fact about one named company, with its source (document, date,
and where to find it) and the date it was last checked.

- (none)
