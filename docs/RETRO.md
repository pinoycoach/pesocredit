# Retro — peso.credit, Tunay na Interes v1

The final phase of the build (BUILD-STANDARD point 17; HANDOVER.md "Final phase — Retro"), done on
2026-09-24, the day v1 launched at https://peso.credit: the calculator alone, with the v1 privacy
page and no email form (DECISIONS N45).

What actually broke during the build, not what the plan predicted; what caught each thing; and what
would have caught it sooner. Evidence: the git history from 6e975d1 (the repo move, N20) to the
launch, DECISIONS.md, and the build sessions themselves. Rows are roughly in the order they
happened. Rows a–e were added by Napoleon in review of the first draft.

## What broke, what caught it, what would have caught it sooner

| # | What broke | What caught it | What would have caught it sooner |
|---|---|---|---|
| 1 (a) | The golden-case oracle (the independent check behind G1–G7) lived only in a chat sandbox, outside the repo | Step A4, which asked for each golden case's independent check (recovered in 73378f5) | Point 1: the independent check's code goes into the repo the day it is written |
| 2 (b) | Planning asked for a "send-only" email key before a provider was chosen; Resend has no key scoped to "add one contact", which forced the send-to-inbox design (N30, N13) | Choosing Resend and reading its real key scopes (N13) | Points 12 and 15: read the provider's actual key scopes on its own screen before writing the credential plan |
| 3 (c) | Decision ID N35 was assigned in the planning chat and collided with the N35 assigned in the repo | Napoleon, when the two met | IDs and statuses assigned only in DECISIONS.md, never in chat (now point 16) |
| 4 | Privacy tests asserted the page's DRAFT state, so they would have broken the day it was signed (N22) | Step group B audit, point 10 | Point 10 from the start; the tests predated it |
| 5 | Inherited test gaps: a duplicate G-id silently overwrote a row (N24), a new test file could silently not run (N25), a NUL byte hid a file's diffs (N26), the oracle and the secret scan were not in CI (N27, N29) | Step group B audit against points 6, 9 and 11 | Points 8–17 applied when the calculator was first built; they were written after it |
| 6 | Breakage proofs restored with `git checkout`: uncommitted edits to privacy-copy.ts were wiped, and injected signatures stayed in the untracked SIGNOFF.json (step C4) | Noticed afterwards | Back up every touched file and byte-compare on restore (CLAUDE.md Lessons) |
| 7 (d) | The email form promised a free checklist that did not exist (C104, C110; N37) | Napoleon's review of the English copy (F1) | Every promise in the copy points at something that exists (CLAUDE.md Lessons) |
| 8 | A guard stopped running unseen: when a `describe()` body throws, Node prints ✖ but exits 0 (N39) | A breakage run in step F3 that showed ✖ and exited 0 | Checking the exit code in every breakage proof (CLAUDE.md Lessons; loan-math.test.ts enforces it) |
| 9 | The headline's "by day Z" total included a late penalty, which is paid after day Z (N41) | Independent review (N32) | A golden case with a penalty that asserts the headline sentence (G7 now does) |
| 10 | Two facts about the circular were unverified: the 6% nominal cap applies to the contract's rate; documentary stamp tax is among the listed fees (N42) | Independent review; the circular could not be read at the time | The circular's PDF in the repo from day one (added in 52f2f97, after the review) |
| 11 | Eight on-screen texts changed after the first review without being reviewed (C17, C44's total, C45, C48, C94, C116–C118), and the repo did not record which file reviewers had been sent | docs/COPY-REVIEW-DELTA.md (5a158d2), which marked its baseline UNVERIFIED | Point 18: record the commit sent to reviewers, and send every later change back before sign-off |
| 12 | The reviewer brief's "never say over" was read as banning the word (N44) | Two reviewers' notes | Treat the reviewer brief as copy (CLAUDE.md Lessons) |
| 13 | A hand edit to SIGNOFF.json left out a comma, so the file was not valid JSON | The gate, before commit | Nothing needed: the gate caught it before anything was committed |
| 14 | The v1 privacy work was built before Napoleon approved the proposal | Napoleon | Stop after a proposal (CLAUDE.md Lessons) |
| 15 | P27 said Netlify "records" each visit "to deliver and protect the site"; Netlify's own documents support neither | Napoleon asking for the passage that supports it; the DPA supports only processing IP addresses to perform the service (N45) | Point 19: quote the vendor's own document before a claim about it goes on screen |
| 16 | A review file that showed only the new lines drew two "missing" findings that P08 already covered (N45) | Napoleon's dismissal | Point 18: send changed lines with the approved lines around them |
| 17 | tools/check-no-tracking.mjs exited 127 on Windows, with every check passing (`process.exit()` while fetch's sockets were closing) | The tool's own proof run, on the builder's OS, before commit | Nothing needed: running a new tool on the builder's OS (point 8) caught it |
| 18 | The first layout measurement checked each quick-fill line against its button, not the button against its grid cell, and passed on the broken layout too | Re-running it with the old classes restored | Point 6 (amended): prove a check fails on the known-bad state before trusting its pass |
| 19 | The quick-fill cards did not wrap; the "30 days" card ran into the next one, on the live preview (0e44cf9) | Napoleon's screenshot | The mobile re-check (N31) run before the first public preview; it had been open since step group B (CLAUDE.md Lessons) |
| 20 | The loan calendar's "Received" and "Follow-up" were wider than their day cells at 320 and 375 px (fb6c4b8) | The measured re-check at five widths (N31) | Same as 19 |
| 21 | A Netlify banner, with a "hud?variant=public" request, shows on the preview and on peso.credit (N46, open) | Napoleon's browser; not check-no-tracking, which reads only the HTML the server sends | Point 20: a real-browser pass on the first deploy, for anything added at runtime |
| 22 (e) | The gate could not run: the build crashed (0xC0000409), node could not start (out of memory), and an orphaned `vite build` from the crashed run held memory. Root cause: drive C: was nearly full, so Windows could not grow its page file | Gate exit codes; Napoleon found the disk | After a crashed build, check free disk space, free memory and orphaned processes before re-running (CLAUDE.md Lessons) |
| 23 | Quoting broke commands: a PowerShell here-string turned a commit message into path arguments, so nothing was committed; shell heredocs mangled escapes in two helper scripts | Reading the output before moving on | Commit with `git commit -F <file>`; write helper scripts to files (CLAUDE.md Lessons) |

## What changed as a result

**docs/BUILD-STANDARD.md**
- New point 18: a review covers exactly what it saw (rows 11, 16).
- New point 19: a claim about a vendor is a fact like a regulatory number (row 15).
- New point 20: static checks see only what the server sends (row 21).
- Point 6 amended: measurements and scripts are proven too, not only tests (rows 8, 18).
- Point 16 amended: decision IDs and statuses are assigned only in the repo (row 3).

**CLAUDE.md**
- Lessons: every promise in the copy points at something that exists (row 7); the reviewer brief is
  copy (row 12); the layout measurement runs before the first public preview (rows 19, 20);
  commit with `-F` and write scripts to files (row 23); after a crashed build, check disk, memory
  and orphaned processes (row 22).
- Environment (point 8): complete.

## Verified at the close (2026-09-24)

- **Live site:** https://peso.credit/privacy serves the signed v1 page: title "Privacy Policy · Tunay
  na Interes", no DRAFT banner, no `noindex`, "Last updated: 24 September 2026" (checked with curl).
- **CI:** GitHub Actions, all 40 runs since the repo move: 38 succeeded, 2 were cancelled (9447151,
  5cb3d31, each followed by a newer push), none failed; the run on 2e0628e, the launch records,
  succeeded (read from the public Actions API).
- **Sign-off:** `npm run launch-check` passes: privacy-page, verdict-wording and cap-values signed,
  content unchanged since (N23).
- **Production checks (N45, N18, N31):** no cookies and nothing from other origins on / and /privacy,
  by tool and in the browser; the /api/subscribe rate limit proven; the mobile check done on a phone.

## Still open (as DECISIONS.md lists them)

- **Open:** N10 (affiliate programs and disclosure), N14 (₱99 guide payment link), N15 (the ₱99
  guide), N16 (lender names list, empty by design), N20 (archive the old repo), N40 (the Filipino
  copy), N46 (the Netlify banner: a known bug to fix after launch, not blocking "done").
- **Blocking, for later features, not v1:** N8 (legal review before any lender is named), N17 (the
  full privacy page with counsel), N37 (the checklist the email form promises), N38 (the ₱99 guide
  link).
- **Revisit:** N9 (Netlify vs Vercel), N21 (scope of "never name a lender"), N33 (guard proofs as a
  re-runnable script), N35 (the rate limit's size), N43 (a field for the contract's own rate).
