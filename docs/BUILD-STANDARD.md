# The Build Standard

A repeatable way to run any project where Claude Code does the engineering and a human makes the
calls that carry real consequences (legal, financial, or otherwise irreversible).

## 1. Four files exist before Claude Code writes a line

- **CLAUDE.md** — the project's standing memory. Principles ("inform, never accuse"), the testing
  bar, working rules ("plan first, one commit per step"), and a Lessons section that only grows
  when something is corrected, so the same mistake never repeats.
- **rules.ts (or RULES.md)** — every fact that comes from outside the code (a law, a price, a
  business rule) lives in exactly one place, each tagged with where it came from. Nothing else in
  the codebase may hardcode a number that belongs here.
- **GOLDEN-CASES.md** — real worked examples, computed by an implementation independent of the app,
  so the app is checked against something other than its own logic. Boundary cases included.
- **HANDOVER.md** — the actual prompt pasted into Claude Code, broken into phases, each ending in a
  stop for review.

Nothing important lives only in a chat that will eventually scroll out of reach.

## 2. Work happens in phases, never as one pass

Each phase is proposed in plan mode and approved before code moves, lands as one commit per step
(not one per phase), and ends with a stop. Nothing is pushed or deployed without the human saying so.

## 3. Two kinds of decisions get named separately

Every plan visibly splits "yours" from "mine, flagged for approval." Judgment calls Claude Code
makes on its own are surfaced as a short question with a recommendation, never baked in silently.

## 4. Every commit passes the same gate

Typecheck, lint, test, build, every time, on more than one platform when the tool matters
cross-platform. A commit that can't pass green is reported honestly, not smoothed over.

## 5. Principles get turned into things that fail on their own

A rule in CLAUDE.md is a promise; a test that fails when the rule is broken is proof (banned-word
scans, "every legal number comes from rules.ts," a compile error if a cap renders outside its
source link).

## 6. Guards get proven, not just written

Before trusting a test, break the thing it should catch on purpose, confirm it fails, then restore.

*Amended after peso.credit:* the same goes for measurements and scripts, not only tests. Before
trusting a check's pass, run it on the known-bad state and confirm it fails. On peso.credit, the
first layout measurement tested each quick-fill line against its button instead of the button
against its grid cell, and it passed on the broken layout too; only re-running it with the old
classes showed it was measuring the wrong thing (docs/RETRO.md, row 18). A breakage proof passes
only if the run exits non-zero, not because an error appears on screen (row 8).

## 7. Every phase report tells three things

What was verified (and how), what deviated from the plan and why, and what's still open. Nothing is
marked done by omission.

*One line: facts live in one sourced file, tests are checked against an independent answer,
judgment calls get named out loud, principles become tests, and nothing ships without a stop.*

---

# The Build Standard, v2

The original seven points (facts in one sourced file, phases with stops, judgment calls named,
every commit gated, principles become tests, guards proven not just written, three-part phase
reports) held up completely on fengshui.mom. Nothing in them needs walking back. What follows is
what the seven points didn't cover — found because a real build hit each gap, not guessed in
advance. Use this alongside the original, not instead of it.

## 8. State the environment before anything is built

**The rule:** name the builder's OS, the runner's OS, and the deploy target's OS in CLAUDE.md,
explicitly, before Claude Code writes a line. If builder and runner differ, nothing is "done"
until it's been run on both.

**Why this is now a rule, not a suggestion:** I built the first version of fengshui.mom's tooling
on Linux. Napoleon runs Windows. That single mismatch caused three separate bugs before it was
named as a standing risk: CRLF line-ending churn in the golden-case generator, a path-separator
bug in the sitemap test (`\` vs `/`), and a `multiprocessing` re-exec bug (Windows uses `spawn`,
not `fork`, so code outside a `__main__` guard ran once per CPU core). All three were real,
all three shipped before anyone caught them, and all three trace to one unstated fact.

## 9. The verification harness must run the real pipeline, not a shortcut of it

**The rule:** a test-of-tests (a guard-proof, a mutation harness, anything that proves "the tests
can fail") must invoke the exact same sequence a real deploy does — build, then test — never test
alone against whatever happens to already be built.

**Why:** `guard-proof.mjs` initially ran `test.mjs` only. A mutation to `rules.json` or
`day-masters.json` only reaches the live behavior through a rebuild, so the harness was silently
validating a stale, already-committed bundle. Two real mutations went undetected before this was
caught. Fixed by making the harness call `build.mjs && test.mjs`, matching the actual gate.

## 10. A test written around a human workflow must simulate the workflow succeeding

**The rule:** when a test encodes a *current state* of a human process (nothing is signed yet, no
one has responded yet, the list is empty), also write the test for what happens when that state
changes as intended — don't just test the starting condition and assume it's permanent.

**Why:** the first sign-off test asserted "every required id is currently unsigned." That's true
on day one and false the moment anyone signs anything — meaning the test was guaranteed to break
the gate the first time the human workflow it existed to support actually worked. Rewritten to
check structure (every id present once, no unknown ids, signed entries carry signer/timestamp/hash)
instead of a snapshot of an empty state.

## 11. A verified constraint must be re-verified after any feature that touches the same surface

**The rule:** when a new feature is added to something that already passed a check (a layout fits,
a size floor holds, a page prints correctly), that check is not still valid by default. Re-run it
against the new state before calling the feature done.

**Why:** the card's text-size floor was measured and approved. Then a year-animal line was added to
the same card. Nobody re-measured until the mobile-audit tool was pointed at the *new* card and
found the printed version had grown past its target size. The fix (reposition the line, don't
shrink text) was cheap. Not re-checking would not have been.

## 12. Trust the live screen over the documentation, for anything account-specific

**The rule:** for third-party dashboards (DNS providers, email senders, hosting platforms),
treat searched documentation as a plausible starting guess, and the actual screen the person is
looking at as ground truth. When they conflict, the live screen wins, every time, without
argument.

**Why:** documentation review said Resend's subdomain verification needed "MX and TXT records."
The actual live Resend screen showed one TXT (DKIM) and two CNAME records — no MX at all, because
Receiving was off. Docs describe the general case; a specific account's actual configuration can
differ in ways that matter. Ask to see the real screen before writing instructions based on search
results alone.

## 13. When a check and a human disagree, the human wins, and the check gets investigated

**The rule:** if an automated verification tool reports one thing and a person looking directly
at the artifact reports another, believe the person, say so plainly, and treat the tool's
disagreement as a bug to find, not a result to defend.

**Why:** after a content fix deployed successfully (confirmed by commit hash on the live Netlify
build), an automated fetch check reported the old text, three times in a row, including with a
cache-busting query string. The honest move was to say the fetch tool looked untrustworthy, not
to declare the deploy broken. A private-browser check by the person confirmed the fix was live —
the fetch tool had been the wrong signal the whole time.

## 14. Independent content review is the same discipline as independent calculation review — just for judgment instead of arithmetic

**The rule:** anything in the build that is a *fact* (a calculation, a date, a formula) gets
checked against an independent implementation, per the original standard. Anything that is
*judgment* (how a claim is worded, whether a description overclaims, whether a term is used
correctly) gets checked against independent reviewers who have no stake in the work looking
finished. Both steps are mandatory before sign-off, not just the first one.

**Why:** the BaZi math was checked against an independent library across every possible day —
airtight. But the *wording* around the calculation (calling something a "supporting element,"
phrasing temperament descriptions as advice) had no equivalent check until three separate AI
reviewers were asked to critique it cold. All three converged on the same two real problems,
independently, that a single close reader — even a careful one — had missed. This is cheap
(minutes, not a build phase) and belongs in every project with public-facing copy, not just this
one.

## 15. The least-privileged credential goes in the live code path; anything broader is separate and rare

**The rule:** decide this before writing the integration, not after a limitation is discovered.
The API key embedded in code that runs on every request gets the narrowest scope the task allows.
Any action needing broader privilege (managing a mailing list, writing to an admin endpoint) uses
a second, separate credential, used rarely, ideally by a human directly rather than by the
always-running code path.

**Why:** the send function needed a Resend key scoped only to sending, from one verified
subdomain. It was created that way from the start on this project, but only after nearly reusing
a broader key out of convenience. Naming this as a standing rule removes the moment of temptation
next time.

## 16. Keep a single, live decisions log in the repo — not just in chat scrollback

**The rule:** open decisions (things blocking a gate, waiting on a person, or still under
discussion) live in one file in the project, e.g. `DECISIONS.md`, that both the planning
conversation and the coding tool read and update. Don't rely on carrying "N5 is still open, N9 is
resolved" by re-typing it into every instruction block from memory.

**Why:** across this build, several open items (N9's resolution, a stale wording claim on the
About page) were dropped from one instruction and had to be manually re-added later, purely
because they lived only in conversation history rather than a file either side could check. A
`DECISIONS.md` with one line per open item, and its resolution the moment it resolves, removes an
entire category of "did I actually tell it that" risk. Template in `templates/DECISIONS.md`.

*Amended after peso.credit:* decision IDs and statuses are assigned only in the repo's
`DECISIONS.md`, never in chat. On peso.credit, the planning conversation assigned N35 while the
repo had already assigned its own N35, and the two collided (docs/RETRO.md, row 3). The
conversation proposes a decision; the file gives it its number and its status.

## 17. End every build with a retro, before calling it done — not after someone asks

**The rule:** add a final phase to `HANDOVER.md`: after launch, list what actually broke during
the build (not what the plan predicted), what caught each thing, and what would have caught it
sooner. Fold the real answers into `CLAUDE.md`'s Lessons section as part of finishing, not as an
afterthought weeks later.

**Why:** this exact document is that retro, done properly for the first time on this project,
several days after launch, only because it was asked for directly. Doing it as a formal last phase
means the lessons are still fresh, and means the next project starts with them already folded in,
rather than repeating the discovery.

---

# The Build Standard, v3

What peso.credit's build (Tunay na Interes v1, launched 2026-09-24) found that points 1–17 did not
cover. The full retro, with every incident, is `docs/RETRO.md`; each point below cites its row.

## 18. A review covers exactly what it saw

**The rule:** record the exact commit (or file) sent to each review. Before anything reviewed is
signed, list every change made since that commit, however small, and send those back for review,
with the approved lines around them so reviewers can see the context.

**Why:** on peso.credit, eight on-screen texts changed after the first independent review, some by
a single full stop, and none had been re-reviewed; a generated delta file found them, but it could
not say for certain which version the reviewers had seen, because nothing recorded it (docs/RETRO.md,
row 11). And a review file that showed only the changed lines drew two "missing" findings about
things the unchanged lines already said (row 16).

## 19. A claim about a vendor is a fact like a regulatory number

**The rule:** anything the product says about a third party (a host, an email provider, a payment
processor) is sourced like a legal number: quote the vendor's own current document, with its date,
before the claim goes on screen. If no document supports it, soften it until one does, or leave it
out.

**Why:** peso.credit's privacy page first said Netlify "records technical details of each visit …
to deliver and protect the site", which sounded generic. Netlify's Data Processing Agreement
supports only that it processes visitors' IP addresses as needed to perform its service; nothing
said it records each visit, or does so to protect the site (docs/RETRO.md, row 15).

## 20. Static checks see only what the server sends

**The rule:** a check that fetches pages and reads their HTML and CSS cannot see what is added at
runtime, by JavaScript or by the host itself. The first deploy
of anything with a privacy claim also gets a real-browser pass: the Network tab and the stored
data, on the live address.

**Why:** peso.credit's no-tracking tool passed 6/6 on the preview and on production, while a
Netlify banner, with a request of its own, showed on both; only the browser's developer tools saw
it (docs/RETRO.md, row 21; DECISIONS N46).

---

*Points 1–7 are the original standard, unchanged. Points 8–17 are what fengshui.mom's actual build
taught, and points 18–20, with the amendments to points 6 and 16, are what peso.credit's taught,
kept in the same evidence-cited form: a rule, and the real incident that made it a rule. When the
next build finds something these twenty don't cover, add it the same way — a plain rule, one
paragraph of why, cited against something that actually happened.*
