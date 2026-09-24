# COPY-REVIEW — peso.credit

Every string a visitor can see, verbatim, grouped by screen, for independent content review
(BUILD-STANDARD point 14; DECISIONS N32). Reviewers need nothing else to read it cold.

- **Generated from the source by `tools/copy-review.ts`.** Text is taken from the app's own
  values or straight from the source, never retyped; line numbers are looked up. `npm test`
  fails if this file is out of date or leaves out an on-screen string.
- **Language on screen: English** (`src/lib/copy/en.ts`, chosen in `src/lib/copy.ts`).
- **Nothing here is a proposal.** No copy was rewritten for this document.
- `{…}` marks a part that varies (a number, a date, the borrower's own figure). Where it helps,
  an example follows in the "Shown when" column.
- <u>Underlined</u> text is a link to the SEC circular (SEC MC No. 14, s. 2025). **Bold** is bold on screen.
- IDs (C01, P01, …) are for review notes: "C14: …". They never change: a line added later takes
  the next free number of its screen, so a section's IDs can be out of order.

## For reviewers

The site is in English, written first for people already struggling with online-lending-app
debt (DECISIONS N36): calm, plain, short sentences; no shame or blame; no false hope; no advice;
no accusation. The brand, “Tunay na Interes”, stays Filipino, and the fee names are the
circular's own words. Read it as a borrower would. Please note, by ID:

1. Anything that overclaims, accuses, or could be read as naming or judging a lender.
2. Anything that reads as advice ("you should…") or promises an outcome.
3. Any term used incorrectly, or wording a borrower could misread.
4. Anything unclear, awkward, or inconsistent with the rest.

The rules this copy must keep: inform, never accuse; never name a lender; never say ilegal,
illegal, scam, fraud or loan shark; when the law is unclear (the methods disagree), the result
shows "close to the limit", never "over"; not legal advice.

This review is what Napoleon signs on (SIGNOFF.json, `reviewedBy`). What each signature covers:
`verdict-wording` is sections 1.3–1.5; `privacy-page` is section 2 except P03 (the DRAFT banner
goes when the page is signed); `cap-values` is the numbers inside the underlined caps, checked
against the circular itself rather than in this review.

## 1. Calculator page (peso.credit/)

The page a borrower lands on. Top to bottom.

### 1.1 Page header

| ID | Text | Where | Shown when |
|---|---|---|---|
| C01 | Philippines · SEC MC No. 14, s. 2025 | `src/lib/copy/en.ts:88` | always (small caps above the title) |
| C02 | Tunay na Interes | `src/lib/copy/en.ts:89` | always (page title) |
| C03 | Enter what you borrowed, each payment, and how many payments. 7-day loans work too. This tool estimates the effective interest rate (EIR) from your numbers, and checks whether the published SEC limits apply to your loan and how your numbers compare with it. It names no lender and gives no advice on how to pay. | `src/lib/copy/en.ts:91` | always |

### 1.2 Loan inputs card

| ID | Text | Where | Shown when |
|---|---|---|---|
| C04 | Your loan numbers | `src/lib/copy/en.ts:93` | card title |
| C05 | Take them from your disclosure statement, receipt or app screen, not from an ad. | `src/lib/copy/en.ts:95` | card description |
| C06 | 7 days | `src/lib/copy/en.ts:97` | quick-fill button, top line |
| C07 | One payment on day 7 | `src/lib/copy/en.ts:97` | quick-fill button, second line |
| C08 | 14 days | `src/lib/copy/en.ts:98` | quick-fill button, top line |
| C09 | One payment on day 14 | `src/lib/copy/en.ts:98` | quick-fill button, second line |
| C10 | 30 days · 1 payment | `src/lib/copy/en.ts:99` | quick-fill button, top line |
| C11 | One payment at the end of the month | `src/lib/copy/en.ts:99` | quick-fill button, second line |
| C12 | 4 payments | `src/lib/copy/en.ts:100` | quick-fill button, top line |
| C13 | Weekly, four payments | `src/lib/copy/en.ts:100` | quick-fill button, second line |
| C14 | Amount borrowed (principal) | `src/lib/copy/en.ts:102` | field label |
| C15 | The amount on your contract, not what you received if something was deducted. | `src/lib/copy/en.ts:103` | field hint |
| C16 | Fees deducted from what you received | `src/lib/copy/en.ts:104` | field label |
| C17 | For example: processing fee, service fee, notarial fee, origination fee, transfer charge, documentary stamp tax, disbursement fee, handling fee, verification fee. Enter the total of everything deducted. Enter 0 if you received the full amount. Included in the EIR. | `src/lib/copy/en.ts:105` | field hint (fee names come from rules.ts OTHER_FEES_EXAMPLES) |
| C18 | Amount of each payment | `src/lib/copy/en.ts:106` | field label |
| C19 | As written on your schedule. Just one number if you pay once at the end. | `src/lib/copy/en.ts:107` | field hint |
| C20 | Number of payments | `src/lib/copy/en.ts:108` | field label |
| C21 | First payment due (day) | `src/lib/copy/en.ts:109` | field label |
| C22 | 7 = due on day 7 | `src/lib/copy/en.ts:110` | field hint |
| C23 | How often you pay | `src/lib/copy/en.ts:111` | label above the four frequency buttons |
| C24 | Daily | `src/lib/copy/en.ts:113` | frequency button |
| C25 | Every 7 days | `src/lib/copy/en.ts:114` | frequency button |
| C26 | Every 14 days | `src/lib/copy/en.ts:115` | frequency button |
| C27 | Monthly (~30 days) | `src/lib/copy/en.ts:116` | frequency button |
| C28 | Late penalty charged (if any) | `src/lib/copy/en.ts:118` | field label |
| C29 | Not part of the EIR. It counts toward the <u>100%</u> total-cost limit. | `src/lib/copy/en.ts:119` | field hint |
| C30 | Note: first follow-up | `src/lib/copy/en.ts:124` | switch label (optional note) |
| C31 | Optional, and not part of the calculation. The day you were first called or messaged about paying. For example, day 4 of a 7-day loan. | `src/lib/copy/en.ts:126` | switch hint |
| C32 | Day of the first follow-up | `src/lib/copy/en.ts:127` | field label, only when the switch is on |
| C33 | Do the SEC limits apply? | `src/lib/copy/en.ts:128` | small caps heading |
| C34 | Lending or financing company (not a bank) | `src/lib/copy/en.ts:129` | switch |
| C35 | Unsecured, general-purpose loan | `src/lib/copy/en.ts:130` | switch |
| C36 | Contract or renewal date | `src/lib/copy/en.ts:131` | date field label |
| C37 | For loans taken out, restructured or renewed from 1 April 2026. | `src/lib/copy/en.ts:132` | date field hint |
| C38 | We don't save or send the numbers you enter. | `src/lib/copy/en.ts:51` | always, directly under the inputs card |

### 1.3 When the numbers cannot be used

Shown in place of the whole result.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C39 | Enter the amount borrowed and a payment to see the cost. | `src/lib/copy/en.ts:136` | principal or payment missing, or not a usable number |
| C40 | Enter the contract date to see the result. | `src/lib/copy/en.ts:137` | contract date missing or not a real date |
| C41 | This tool can't calculate a rate when the deducted fees are equal to or more than the amount borrowed. Please check the numbers. | `src/lib/copy/en.ts:139` | the deducted fee is equal to or more than the amount borrowed |
| C42 | We can't calculate this: your payments add up to less than what you received. Please check the numbers. | `src/lib/copy/en.ts:141` | the payments add up to less than what was received |
| C43 | We can't work out a rate from these numbers. Please check them. | `src/lib/copy/en.ts:142` | no rate fits these numbers |

### 1.4 Result headline

| ID | Text | Where | Shown when |
|---|---|---|---|
| C44 | Estimated interest rate: {X%} a month (daily rate × 30). Total payments by day {Z}: {₱Y}. | `src/lib/copy/en.ts:145` | template; e.g. G2: "Estimated interest rate: 114.58% a month (daily rate × 30). Total payments by day 7: ₱6,500.00."; with a late penalty, G7: "Estimated interest rate: 4.88% a month (daily rate × 30). Total payments by day 30: ₱3,150.00. Plus the late penalty you entered: ₱2,900.00." |
| C116 | Plus the late penalty you entered: {₱P}. | `src/lib/copy/en.ts:146` | added to the headline only when a late penalty is entered (N41) |
| C45 | The compounded version is under “How we calculated this”. | `src/lib/copy/en.ts:147` | under the headline |

### 1.5 Comparison with the published limit

| ID | Text | Where | Shown when |
|---|---|---|---|
| C46 | The limit comparison is for loans taken out, restructured or renewed from 1 April 2026. | `src/lib/copy/en.ts:148` | instead of this whole card, when the contract is dated before the circular applies |
| C47 | Compared with the published limits | `src/lib/copy/en.ts:149` | card title |
| C48 | Based on <u>SEC MC No. 14, s. 2025</u> · as of 23 September 2026 | `src/components/source-link.tsx:43` | card subtitle; also at the end of Sources (1.9) |
| C49 | Based on your answers, the SEC limits apply to this loan. | `src/lib/copy/en.ts:153` | coverage badge: COVERED |
| C50 | The SEC limits may apply to this loan. | `src/lib/copy/en.ts:154` | coverage badge: MAYBE |
| C51 | Based on your answers, the SEC limits do not apply to this loan. | `src/lib/copy/en.ts:155` | coverage badge: NOT_COVERED |
| C52 | The SEC limits are for lending and financing companies, not banks. | `src/lib/copy/en.ts:59` | reason under the coverage badge |
| C53 | The SEC limits are for unsecured loans. | `src/lib/copy/en.ts:61` | reason under the coverage badge |
| C54 | The SEC limits are for general-purpose loans. | `src/lib/copy/en.ts:63` | reason under the coverage badge |
| C55 | A principal of ₱10,001 is more than the <u>₱10,000</u> the SEC limits cover. | `src/lib/copy/en.ts:65` | reason under the coverage badge (example: the number varies) |
| C56 | A term of 124 days is longer than <u>4 months</u>. | `src/lib/copy/en.ts:71` | reason under the coverage badge (example: the number varies) |
| C57 | A term of 121 days may still be within <u>4 months</u>, depending on the calendar. The SEC limits may apply. | `src/lib/copy/en.ts:73` | reason under the coverage badge (example: the number varies) |
| C58 | EIR per month (daily rate × 30; the compounded rate is checked too) | `src/lib/copy/en.ts:159` | row label (eir) |
| C59 | Nominal interest per month (from your payments) | `src/lib/copy/en.ts:160` | row label (nominal) |
| C60 | Total cost compared with the amount borrowed | `src/lib/copy/en.ts:161` | row label (totalCost) |
| C61 | Your number is lower than the limit | `src/lib/copy/en.ts:164` | row badge: WITHIN |
| C62 | Your number is close to the limit | `src/lib/copy/en.ts:165` | row badge: GRAY |
| C63 | Your number is higher than the limit | `src/lib/copy/en.ts:166` | row badge: OVER |
| C64 | Not sure the limit applies | `src/lib/copy/en.ts:168` | row badge when the number is over but coverage is uncertain |
| C65 | Your number: {the borrower's figure} · Limit: {cap, linked} | `src/lib/copy/en.ts:169` | every row; the cap text is below (words from rowNumberLabel and rowCeilingLabel) |
| C66 | <u>12% a month</u> | `src/lib/copy/en.ts:172` | cap in the eir row (links to the circular) |
| C67 | <u>6% a month</u> | `src/lib/copy/en.ts:173` | cap in the nominal row (links to the circular) |
| C68 | <u>100% of the amount borrowed</u> | `src/lib/copy/en.ts:174` | cap in the totalCost row (links to the circular) |
| C69 | Close to the limit. Worked out one way, your number is lower than the limit. Worked out the other way, it is just higher. The circular does not say which way to use. | `src/lib/copy/en.ts:177` | under the EIR row when the EIR is GRAY |
| C70 | Your number may be higher than the limit, but it is not certain that the SEC limits apply to this loan. | `src/lib/copy/en.ts:179` | under a row that is over while coverage is uncertain |
| C118 | The nominal-interest limit applies to the interest rate written in your contract. Your number is worked out from your payments, so it can include fees added to them. | `src/lib/copy/en.ts:181` | under the nominal row, always; that row shows no verdict (N42) |
| C115 | This compares your numbers with published limits. It does not tell you whether the loan or lender is safe, what you owe, or what happens next. | `src/lib/copy/en.ts:183` | directly under the rows, whenever they are shown, in normal-size text (added in step F3) |
| C71 | An illustration only. The lender's disclosure statement gives the official EIR. This is not legal advice and does not refer to any specific lender. | `src/lib/copy/en.ts:185` | always, bottom of the card |

### 1.6 How we calculated this (expander)

| ID | Text | Where | Shown when |
|---|---|---|---|
| C72 | How we calculated this | `src/lib/copy/en.ts:187` | expander title |
| C73 | What you received (net proceeds) | `src/lib/copy/en.ts:189` | row label; value beside it |
| C74 | Total you pay (by day {Z}) | `src/lib/copy/en.ts:190` | row label; value beside it |
| C117 | Late penalty you entered | `src/lib/copy/en.ts:203` | row label, only when a late penalty is entered (N41); the penalty beside it |
| C75 | Total cost (interest + fees + penalty) | `src/lib/copy/en.ts:192` | row label; value beside it |
| C76 | Daily rate (EIR) | `src/lib/copy/en.ts:195` | row label; value beside it |
| C77 | Per month, simple (daily rate × 30) | `src/lib/copy/en.ts:196` | row label; value beside it |
| C78 | Per month, compounded ((1 + daily rate) ^ 30 − 1) | `src/lib/copy/en.ts:198` | row label; value beside it |
| C79 | Nominal interest per month (from your payments) | `src/lib/copy/en.ts:201` | row label; value beside it |
| C80 | {₱ total cost} · {%} of the amount borrowed | `src/lib/copy/en.ts:193` | value of the total-cost row |
| C81 | The EIR is the daily rate that balances what you received with everything you pay, not counting late penalties. The circular does not say how to turn the daily rate into a monthly one, ×30 or compounded, so we show both. | `src/lib/copy/en.ts:204` | below the rows |

### 1.7 Loan calendar

| ID | Text | Where | Shown when |
|---|---|---|---|
| C82 | Loan calendar | `src/lib/copy/en.ts:206` | card title |
| C83 | {days}-day term · {number of payments} payments | `src/lib/copy/en.ts:207` | card subtitle; with one payment: "{days}-day term · 1 payment" |
| C84 | Day 0 | `src/lib/copy/en.ts:209` | loans over 16 days: list, first row |
| C85 | Received · {₱ received} | `src/lib/copy/en.ts:210` | list, first row |
| C86 | Day {day} | `src/lib/copy/en.ts:211` | list, one row per payment |
| C87 | Payment {n} · {₱ amount} | `src/lib/copy/en.ts:212` | list, one row per payment |
| C88 | First follow-up (your note) | `src/lib/copy/en.ts:213` | list, when a follow-up day is set |
| C89 | Day | `src/lib/copy/en.ts:214` | loans of 16 days or less: day grid, every cell |
| C90 | Received | `src/lib/copy/en.ts:215` | grid cell, day 0 |
| C91 | Due | `src/lib/copy/en.ts:216` | grid cell, a due day |
| C92 | Follow-up | `src/lib/copy/en.ts:217` | grid cell, the follow-up day |
| C93 | Day 0 = the day you got the money. Due = a payment day, as you entered it. | `src/lib/copy/en.ts:218` | legend under the grid |
| C94 | Follow-up = day {day} (your optional note). | `src/lib/copy/en.ts:219` | legend, when a follow-up day is set |

### 1.8 Schedule

| ID | Text | Where | Shown when |
|---|---|---|---|
| C95 | Schedule | `src/lib/copy/en.ts:221` | card title |
| C96 | Day | `src/lib/copy/en.ts:222` | column heading |
| C97 | Payment | `src/lib/copy/en.ts:223` | column heading |
| C98 | Received | `src/lib/copy/en.ts:224` | first row (day 0) |

### 1.9 Sources

Terms in bold; linked text underlined.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C99 | Sources | `src/lib/copy/en.ts:226` | card title |
| C100 | **<u>SEC MC No. 14, s. 2025</u>** In effect from 1 April 2026. For unsecured, general-purpose loans from lending and financing companies of up to <u>₱10,000</u> and up to <u>4 months</u>. | `src/lib/copy/en.ts:229` | paragraph |
| C101 | **The limits** (the circular calls them ceilings) Nominal interest <u>6% a month</u>, EIR <u>12% a month</u>, and a total cost of no more than <u>100% of the amount borrowed</u>. | `src/lib/copy/en.ts:240` | paragraph |
| C102 | **This tool does not check** the late-penalty limit (<u>5% a month</u>), because that needs the number of days late. | `src/lib/copy/en.ts:252` | paragraph |
| C103 | **RA No. 3765 (Truth in Lending Act)** The basis for calculating the EIR, according to the circular. The circular does not say whether the monthly rate is ×30 or compounded, so we show both. | `src/lib/copy/en.ts:260` | paragraph |

### 1.10 Email form

Only once the privacy page is final (PRIVACY_STATUS) and the Resend settings are set (RESEND_API_KEY, SUBSCRIBE_NOTIFY_TO, SUBSCRIBE_FROM); always below the whole result.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C104 | Want a free checklist, and a note when the rules change? | `src/lib/copy/en.ts:267` | card title |
| C105 | Optional. You don't need it to see your result, and none of the numbers you entered are included. | `src/lib/copy/en.ts:269` | card description |
| C106 | Email | `src/lib/copy/en.ts:270` | field label |
| C107 | I agree to get emails with the checklist and updates. I have read the <u>Privacy Policy</u>. | `src/lib/copy/en.ts:271` | consent checkbox label; the link opens /privacy (link text from privacyLinkLabel) |
| C108 | Send | `src/lib/copy/en.ts:273` | button |
| C109 | Sending… | `src/lib/copy/en.ts:274` | button, while sending |
| C110 | Thank you. We'll email you the checklist. | `src/lib/copy/en.ts:275` | replaces the form after success |
| C111 | It didn't go through. Please try again later. | `src/lib/copy/en.ts:276` | beside the button after a failure |

### 1.11 Guide link

Only when GUIDE_URL is set.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C112 | Want a fuller guide? | `src/lib/copy/en.ts:277` | card text |
| C113 | Get the ₱99 guide (in Tagalog) | `src/lib/copy/en.ts:278` | link |

### 1.12 Footer

| ID | Text | Where | Shown when |
|---|---|---|---|
| C114 | Privacy Policy | `src/lib/copy/en.ts:285` | link to /privacy, new tab |

## 2. Privacy page (peso.credit/privacy)

Marked DRAFT for lawyer review (N17). `[FILL IN: …]` blanks are shown highlighted on the page, exactly as below.

### 2.1 Top of page

| ID | Text | Where | Shown when |
|---|---|---|---|
| P01 | Back to the calculator | `src/lib/copy/en.ts:284` | link back to / |
| P02 | Privacy Policy | `src/lib/copy/en.ts:54` | page title |
| P03 | DRAFT, for a lawyer to review. This is not final and is not yet our official policy. | `src/lib/copy/en.ts:283` | banner, only while PRIVACY_STATUS is draft |

### 2.2 What we collect

| ID | Text | Where | Shown when |
|---|---|---|---|
| P04 | What we collect | `src/lib/copy/en.ts:288` | section heading |
| P05 | Your email address and the time you agreed. You give these only in the optional form on the calculator, and we collect them only if you agree (the consent box is ticked). That's all. | `src/lib/copy/en.ts:290` | paragraph |

### 2.3 What we don't collect

| ID | Text | Where | Shown when |
|---|---|---|---|
| P06 | What we don't collect | `src/lib/copy/en.ts:294` | section heading |
| P07 | We don't save or send the numbers you enter. The calculation happens on your device, and those numbers are never included in the email form. | `src/lib/copy/en.ts:296` | paragraph |
| P08 | We have no accounts, and no analytics or tracking on this site. The site itself sets no cookies, and our fonts come from our own site, not from other websites. | `src/lib/copy/en.ts:297` | paragraph |
| P09 | If you tap the link to the SEC (sec.gov.ph), you leave this site, and the SEC's website handles your visit. | `src/lib/copy/en.ts:298` | paragraph |

### 2.4 Why we collect it

| ID | Text | Where | Shown when |
|---|---|---|---|
| P10 | Why we collect it | `src/lib/copy/en.ts:302` | section heading |
| P11 | To send you the free checklist and the updates about new rules that you asked for, and to keep a record that you agreed. | `src/lib/copy/en.ts:304` | paragraph |

### 2.5 Who receives your email address

| ID | Text | Where | Shown when |
|---|---|---|---|
| P12 | Who receives your email address | `src/lib/copy/en.ts:308` | section heading |
| P13 | When you send the form, our email service provider, Resend, emails your address and the time you agreed to the site's operator. The operator then adds your address to our mailing list, which is also kept with Resend, and Resend sends our emails. Only your email address and the time you agreed are sent. | `src/lib/copy/en.ts:310` | paragraph |
| P14 | This site is hosted by Netlify. [FILL IN: for the lawyer: describe what technical details of a visit, such as the IP address, the hosting provider may record] | `src/lib/copy/en.ts:311` | paragraph |

### 2.6 How long we keep it

| ID | Text | Where | Shown when |
|---|---|---|---|
| P15 | How long we keep it | `src/lib/copy/en.ts:315` | section heading |
| P16 | [FILL IN: how long the email address and consent time are kept] | `src/lib/copy/en.ts:316` | paragraph |

### 2.7 How to unsubscribe or have your email address deleted

| ID | Text | Where | Shown when |
|---|---|---|---|
| P17 | How to unsubscribe or have your email address deleted | `src/lib/copy/en.ts:319` | section heading |
| P18 | Use the unsubscribe link in every email you receive. [FILL IN: confirm that emails sent through Resend include an unsubscribe link] | `src/lib/copy/en.ts:321` | paragraph |
| P19 | You can also write to [FILL IN: email address for requests] to ask us to delete your email address. | `src/lib/copy/en.ts:322` | paragraph |

### 2.8 Your rights

| ID | Text | Where | Shown when |
|---|---|---|---|
| P20 | Your rights | `src/lib/copy/en.ts:326` | section heading |
| P21 | [FILL IN: for the lawyer: the user's rights under the law, and how to use them] | `src/lib/copy/en.ts:327` | paragraph |

### 2.9 Contact

| ID | Text | Where | Shown when |
|---|---|---|---|
| P22 | Contact | `src/lib/copy/en.ts:330` | section heading |
| P23 | [FILL IN: name of the site operator] · [FILL IN: contact email address] | `src/lib/copy/en.ts:332` | paragraph |

## 3. Browser tab and search results

Text that appears outside the page body.

### 3.1 Titles and description

| ID | Text | Where | Shown when |
|---|---|---|---|
| T01 | Tunay na Interes · Check your loan against the SEC limits | `src/lib/copy/en.ts:85` | tab title, calculator page |
| T02 | Free. Enter the loan amount, each payment and the number of payments. See the EIR next to the published limits in the Philippines. | `src/lib/copy/en.ts:87` | search-result description |
| T03 | Privacy Policy (DRAFT) · Tunay na Interes | `src/lib/copy/en.ts:336` | tab title, privacy page while draft |
| T04 | Privacy Policy · Tunay na Interes | `src/lib/copy/en.ts:337` | tab title, privacy page once final |

## 4. Error page

Shown only if the app fails.

### 4.1 Error page

| ID | Text | Where | Shown when |
|---|---|---|---|
| E01 | Something went wrong | `src/lib/copy/en.ts:339` | heading |
| E02 | An unexpected error occurred. Try reloading the page. | `src/lib/copy/en.ts:340` | message when the error has no text of its own; otherwise the error's own message is shown |

## Not on screen

For completeness: text in the source that a visitor never sees.

| Text | Where | Why it is not shown |
|---|---|---|
| restructuring, repackaging, splitting of loan amounts, recharacterization of fees, shifting of loan tenor, simulated collateral, sham guaranty arrangements, imposition of disguised charges | `src/lib/rules.ts:80` | Kept from the circular for later explainer content; nothing renders it. |
| Error codes in /api/subscribe responses ("invalid", "forbidden", …) | `src/lib/subscribe.ts:126` | The form shows only the messages in 1.10. |
| Subject: New peso.credit subscriber. Body: Email: {subscriber's address} / Consented at: {consent time} | `src/lib/subscribe.ts:75` | The email each new subscription sends to the owner's inbox through Resend (DECISIONS N13); only the owner reads it. |
| Every word of the Filipino copy | `src/lib/copy/fil.ts` | Kept, unused, for a later Filipino version (DECISIONS N34); `src/lib/copy.ts` shows one language. |
