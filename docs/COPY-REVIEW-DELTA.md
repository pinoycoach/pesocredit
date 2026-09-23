# COPY-REVIEW-DELTA — peso.credit

What changed on screen since the independent review of the English copy (BUILD-STANDARD point 14;
DECISIONS N32). It is for a second look by a reviewer who has not seen the changes, and it reads
cold: you need only this file, and `COPY-REVIEW.md` for everything else.

## How this was made

- **What the reviewers saw:** `COPY-REVIEW.md` as of commit `8462728` (2026-09-23), the last commit
  before the review's changes went in. It is the English text on screen after step F3, with every ID.
  UNVERIFIED: the repository does not record which copy of the file each reviewer was sent. `8462728`
  is the last version before their changes, and its text is the same as the F3 commit `0c429be`
  (only C115's "where" note differs).
- **What is on screen now:** `COPY-REVIEW.md` as of commit `3118ddd`.
- **Method:** the two files were compared row by row, by ID: 144 IDs then, 147 now. The text below is
  copied from those files, never retyped. Nothing here is a proposal.
- **Result:** 20 texts changed and 3 were added. Nothing was removed. No other ID changed in its
  text, its place or the conditions it shows under, except the four things listed under "Changes with
  no new text" at the end. The Filipino copy (`fil.ts`) is not on screen and is not part of this (N40).
- **Who has seen what:** 17 of the 20 changed texts are ones the reviewers asked for. They saw the old
  wording, not the new. Eight entries also hold something no reviewer has seen in any form: C17, C44
  (its {₱Y} now leaves out a late penalty), C45, C48, C94 (its full stop), C116, C117 and C118.
- Entries in 1.3 to 1.5 belong to the verdict wording that `verdict-wording` in `SIGNOFF.json`
  covers, which is not yet signed.
- `{…}` marks a part that varies (a number, a day). <u>Underlined</u> is a link to the SEC circular
  (SEC MC No. 14, s. 2025). IDs are the same as in `COPY-REVIEW.md` and never change.
- This file is a snapshot. `tools/copy-review.ts` does not regenerate it and `npm test` does not
  check it. `COPY-REVIEW.md` stays the complete, tested list.

## For reviewers

The site is in English, written first for people already struggling with online-lending-app debt
(N36): calm, plain, short sentences; no shame or blame; no false hope; no advice; no accusation.
For each entry, please note, by ID:

1. Anything that overclaims, accuses, or could be read as naming or judging a lender.
2. Anything that reads as advice ("you should…") or promises an outcome.
3. Any term used incorrectly, or wording a borrower could misread.
4. Anything unclear, awkward, or inconsistent with the rest, including with the other entries here.

The rules this copy must keep: inform, never accuse; never name a lender; never say ilegal, illegal,
scam, fraud or loan shark; where the law is unclear, say so, never say "over"; not legal advice.

Each entry gives **Where** it shows on screen, **Reviewers saw** (nothing, when the line is new),
**Now**, and **Why** it changed.


## 1.1 Page header

### C03

- **Where:** always
- **Reviewers saw:**
  > Enter what you borrowed, each payment, and how many payments. 7-day loans work too. This tool works out the effective interest rate (EIR) and checks whether the published SEC limit covers your loan. It names no lender and gives no advice on how to pay.
- **Now:**
  > Enter what you borrowed, each payment, and how many payments. 7-day loans work too. This tool estimates the effective interest rate (EIR) from your numbers, and checks whether the published SEC limit applies to your loan and how your numbers compare with it. It names no lender and gives no advice on how to pay.
- **Why:** Asked for by one reviewer (its middle sentence): the tool estimates, and says how the numbers compare with the limit. Applied in N32.


## 1.2 Loan inputs card

### C17

- **Where:** field hint (fee names come from rules.ts OTHER_FEES_EXAMPLES)
- **Reviewers saw:**
  > For example: processing fee, service fee, notarial fee, origination fee, transfer charge, documentary stamp tax, disbursement fee. Enter the total of everything deducted. Enter 0 if you received the full amount. Included in the EIR.
- **Now:**
  > For example: processing fee, service fee, notarial fee, origination fee, transfer charge, documentary stamp tax, disbursement fee, handling fee, verification fee. Enter the total of everything deducted. Enter 0 if you received the full amount. Included in the EIR.
- **Why:** New since the review. The circular's Sec. 3(2) also names handling and verification fees among the fees the EIR includes (N42). The fee names come from `rules.ts`.

### C31

- **Where:** switch hint
- **Reviewers saw:**
  > Optional. The day you were first called or messaged about paying. For example, day 4 of a 7-day loan. This is not interest, and it does not accuse anyone.
- **Now:**
  > Optional, and not part of the calculation. The day you were first called or messaged about paying. For example, day 4 of a 7-day loan.
- **Why:** Asked for by all three reviewers. Applied in N32: the note is not part of the calculation, and the "does not accuse anyone" tail is gone.


## 1.3 When the numbers cannot be used

### C39

- **Where:** principal or payment missing, or not a usable number
- **Reviewers saw:**
  > Enter the amount borrowed and a payment to see the true cost.
- **Now:**
  > Enter the amount borrowed and a payment to see the cost.
- **Why:** Asked for by two reviewers. Applied in N32: "the true cost" became "the cost", since it is an estimate.

### C41

- **Where:** the deducted fee is equal to or more than the amount borrowed
- **Reviewers saw:**
  > We can't calculate this: the deducted fees can't be equal to or more than the amount borrowed. Please check the numbers.
- **Now:**
  > This tool can't calculate a rate when the deducted fees are equal to or more than the amount borrowed. Please check the numbers.
- **Why:** Asked for by one reviewer. Applied in N32: the message says what the tool cannot do, instead of "we can't".


## 1.4 Result headline

### C44

- **Where:** template; e.g. G2: "Estimated cost: 114.58% a month (daily rate × 30). Total payments by day 7: ₱6,500.00."; with a late penalty, G7: "Estimated cost: 4.88% a month (daily rate × 30). Total payments by day 30: ₱3,150.00. Plus the late penalty you entered: ₱2,900.00."
- **Reviewers saw:**
  > Your true cost: {X%} a month. By day {Z}, you pay {₱Y} in total.
- **Now:**
  > Estimated cost: {X%} a month (daily rate × 30). Total payments by day {Z}: {₱Y}.
- **Why:** Asked for by two reviewers. Applied in N32, and the template has not changed since. New since the review (N41): {₱Y} now counts only the scheduled payments, which are all due by day {Z}. A late penalty, if entered, goes in its own sentence (C116).

### C116

- **Where:** added to the headline only when a late penalty is entered (N41)
- **Reviewers saw:** nothing. This line did not exist.
- **Now:**
  > Plus the late penalty you entered: {₱P}.
- **Why:** New since the review (N41). A late penalty is paid after its due day, so it cannot sit inside "by day {Z}".

### C45

- **Where:** under the headline
- **Reviewers saw:**
  > This is the daily rate × 30. The compounded version is under “How we calculated this”.
- **Now:**
  > The compounded version is under “How we calculated this”.
- **Why:** Changed after the review, approved by Napoleon. The headline (C44) now says "daily rate × 30" itself, so this line keeps only its second sentence.


## 1.5 Comparison with the published limit

### C46

- **Where:** instead of this whole card, when the contract is dated before the circular applies
- **Reviewers saw:**
  > This tool is for loans from 1 April 2026.
- **Now:**
  > The limit comparison is for loans from 1 April 2026.
- **Why:** Asked for by one reviewer. Applied in N32: only the limit comparison is date-limited, not the whole tool.

### C48

- **Where:** card subtitle; also at the end of Sources (1.9)
- **Reviewers saw:**
  > Based on <u>SEC MC No. 14, s. 2025</u> · as of 2026-09-19
- **Now:**
  > Based on <u>SEC MC No. 14, s. 2025</u> · as of 2026-09-23
- **Why:** New since the review. The date follows `RULES_AS_OF` in `rules.ts`, which moved when every value was checked against the circular itself (N42). The same line also ends the Sources card (1.9).

### C49

- **Where:** coverage badge: COVERED
- **Reviewers saw:**
  > The limit applies to this loan.
- **Now:**
  > Based on your answers, the limit applies to this loan.
- **Why:** Asked for by two reviewers. Applied in N32: the badge says it rests on the borrower's answers.

### C51

- **Where:** coverage badge: NOT_COVERED
- **Reviewers saw:**
  > The limit does not apply to this loan.
- **Now:**
  > Based on your answers, the limit does not apply to this loan.
- **Why:** Asked for by two reviewers. Applied in N32: same as C49.

### C58

- **Where:** row label (eir)
- **Reviewers saw:**
  > Effective interest rate (EIR) per month
- **Now:**
  > EIR per month (daily rate × 30; the compounded rate is checked too)
- **Why:** Asked for by two reviewers. Applied in N32: the row shows the daily rate × 30, and its badge also checks the compounded rate (`eirVerdict` in `rules.ts`), so the label names both.

### C59

- **Where:** row label (nominal)
- **Reviewers saw:**
  > Nominal interest per month
- **Now:**
  > Nominal interest per month (from your payments)
- **Why:** Asked for by one reviewer. Applied in N32. See also the note under this row, C118.

### C61

- **Where:** row badge: WITHIN
- **Reviewers saw:**
  > Within the limit
- **Now:**
  > Your number is under the limit
- **Why:** Asked for by all three reviewers. Applied in N32: the badge is about the borrower's number, not about the loan or the lender. The nominal row no longer shows any of the three badges (see C118, and "Changes with no new text" below).

### C62

- **Where:** row badge: GRAY
- **Reviewers saw:**
  > Close to the limit
- **Now:**
  > Your number is close to the limit
- **Why:** Asked for by all three reviewers. Applied in N32. This is the wording of the gray state that principle 2 of `CLAUDE.md` names.

### C63

- **Where:** row badge: OVER
- **Reviewers saw:**
  > Above the limit
- **Now:**
  > Your number is over the limit
- **Why:** Asked for by all three reviewers. Applied in N32: "over the limit" is about a number, not a finding about the lender (N36: no false hope, no accusation).

### C118

- **Where:** under the nominal row, always; that row shows no verdict (N42)
- **Reviewers saw:** nothing. This line did not exist.
- **Now:**
  > This limit applies to the interest rate written in your contract. Your number is worked out from your payments, so it can include fees added to them.
- **Why:** New since the review (N42, option D). The 6% limit applies to the rate written in the contract, and this tool works its figure out from the payments. So the nominal row shows its figure and the limit, no verdict, and this note.

### C115

- **Where:** directly under the rows, whenever they are shown, in normal-size text (added in step F3)
- **Reviewers saw:**
  > This compares your numbers with a published limit. It does not tell you what you owe or what happens next.
- **Now:**
  > This compares your numbers with a published limit. It does not tell you whether the loan or lender is safe, what you owe, or what happens next.
- **Why:** Asked for by all three reviewers. Applied in N32: it also says the comparison does not tell whether the loan or lender is safe, and it is now normal-size text, not small.


## 1.6 How we calculated this (expander)

### C117

- **Where:** row label, only when a late penalty is entered (N41); the penalty beside it
- **Reviewers saw:** nothing. This line did not exist.
- **Now:**
  > Late penalty you entered
- **Why:** New since the review (N41). One extra row in the calculation, only when the borrower entered a late penalty; the penalty amount is shown beside it.

### C79

- **Where:** row label; value beside it
- **Reviewers saw:**
  > Nominal interest per month
- **Now:**
  > Nominal interest per month (from your payments)
- **Why:** Asked for by one reviewer. Applied in N32: same as C59.


## 1.7 Loan calendar

### C94

- **Where:** legend, when a follow-up day is set
- **Reviewers saw:**
  > Follow-up = day {day} (your optional note: not a charge, and not a judgment of the lender).
- **Now:**
  > Follow-up = day {day} (your optional note).
- **Why:** Asked for by all three reviewers. Applied in N32: the "not a charge, and not a judgment of the lender" tail is gone. A later commit, approved by Napoleon, added the closing full stop.


## 3.1 Titles and description

### T01

- **Where:** tab title, calculator page
- **Reviewers saw:**
  > Tunay na Interes · The true cost of your loan
- **Now:**
  > Tunay na Interes · Check your loan against the SEC limit
- **Why:** Asked for by two reviewers. Applied in N32: the tab title says what the page does, and "the true cost" is gone.


## Changes with no new text

These IDs read the same as when the reviewers saw them, but what the borrower sees has changed.

- **The nominal-interest row has no verdict badge (N42).** The reviewers saw this row carry one of
  the badges C61 to C63 (or C64). Now it shows its figure, the limit (C67) and the note C118, and no
  badge. The EIR row and the total-cost row are as before.
- **C74 "Total you pay (by day {Z})" (N41).** The label is unchanged. The value beside it, like {₱Y}
  in the headline C44, now counts only the scheduled payments; a late penalty is no longer in it.
  C75 "Total cost (interest + fees + penalty)" still includes the penalty, because the 100% total-cost
  limit counts it.
- **C107, the consent checkbox in the email form.** The text is unchanged. The whole email form
  (C104 to C111) now appears only once the privacy page is final (`PRIVACY_STATUS`), on top of the
  Resend settings (N32, `public-config.ts`). The page is a draft today, so the form is off.
- **C115** is now normal-size text, not small (also in its entry above).

Not on screen, so not part of this review: `COPY-REVIEW.md` also lists the circular's avoidance
practices (`rules.ts`), kept for later content. One item there now reads "imposition of disguised
charges", as the circular writes it. Nothing renders it.
