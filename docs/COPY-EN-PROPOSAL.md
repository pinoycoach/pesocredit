# English copy proposal (step F1): peso.credit

**Status: PROPOSAL.** Nothing here is in the code. When you approve (edit any English cell,
or say "yes" per ID or to all), step F2/F3 puts it in `src/lib/copy/en.ts`, and COPY-REVIEW.md
is regenerated in English for the independent review (N32). The Filipino stays in the repo,
unused, as the future Tagalog version (N34).

Written for people already struggling with online-lending-app debt (N36): calm, plain,
short sentences; no shame or blame; no false hope; no advice; no accusation. The standing
rules still hold: never name a lender; never "illegal", "scam", "fraud" or "loan shark";
GRAY is never OVER; not legal advice.

- One row per COPY-REVIEW ID (143 rows). The Filipino is copied from COPY-REVIEW.md, not retyped.
- `{…}` is a part that varies. <u>Underlined</u> text links to the SEC circular. **Bold** is bold on screen.

## Decisions for you

1. **Product name (C02, T01–T04).** "True Interest", or keep "Tunay na Interes" as the brand?
2. **"Limit" for the circular's "ceiling"** (everywhere). "Limit" is plainer; the circular's
   word stays visible in the sources (C101 note). Or keep "ceiling"?
3. **The headline (C44):** "Your true cost: {X%} a month. By day {Z}, you pay {₱Y} in total."
   CLAUDE.md is updated to this wording once approved.
4. **The GRAY label (C62):** "Close to the limit". CLAUDE.md principle 2 is updated with it.
5. **One new line (N1, below)** against false hope. It isn't a translation, so it needs its own yes.

## Style used throughout

- "a month" in sentences; "per month" in row labels (C58, C59, C77, C78).
- "Amount borrowed (principal)"; "what you received" for net proceeds; "payment" for hulog.
- "We" is the site. "They" (C31) is whoever called or messaged; no word judges them.
- EIR keeps its name and is spelled out once (C03). The fee names in C17 are the circular's own words, unchanged.
- Dates as "1 April 2026".

## New lines (not translations)

| ID | Where | Proposed English | Why |
|---|---|---|---|
| N1 | Comparison card (1.5), directly under the rows, above C71 | This compares your numbers with a published limit. It does not tell you what you owe or what happens next. | N36, no false hope: “Above the limit” must not read as “you don't have to pay”. It states only what the tool does, with no claim about the law, so it is not legal advice. Would join the signed verdict wording. |

## 1. Calculator page (peso.credit/)

### 1.1 Page header

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C01 | Philippines · SEC MC No. 14, s. 2025 | Philippines · SEC MC No. 14, s. 2025 | Unchanged: a citation. |
| C02 | Tunay na Interes | True Interest | DECIDE: translate the product name, or keep “Tunay na Interes” as the brand. |
| C03 | Ilagay ang inutang, ang hulog, at ilang beses magbabayad. Kasama ang 7-araw na loan. Ang tool ay nagkukuwenta ng effective interest (EIR) at tinitingnan kung sakop ka ng naka-publish na ceiling — hindi nagnangalan ng lender, hindi nagpapayo kung paano magbayad. | Enter what you borrowed, each payment, and how many payments. 7-day loans work too. This tool works out the effective interest rate (EIR) and checks whether the published SEC limit covers your loan. It names no lender and gives no advice on how to pay. |  |

### 1.2 Loan inputs card

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C04 | Mga numero ng loan mo | Your loan numbers |  |
| C05 | Kunin sa disclosure statement, resibo, o app screen — hindi sa advertisement. | Take them from your disclosure statement, receipt or app screen, not from an ad. |  |
| C06 | 7 araw | 7 days |  |
| C07 | Isang bayad sa ika-7 araw | One payment on day 7 |  |
| C08 | 14 araw | 14 days |  |
| C09 | Isang bayad sa ika-14 | One payment on day 14 |  |
| C10 | 30 araw · 1 bayad | 30 days · 1 payment |  |
| C11 | Isang bayad sa dulo ng buwan | One payment at the end of the month |  |
| C12 | 4 na hulog | 4 payments |  |
| C13 | Lingguhan, apat na bayad | Weekly, four payments |  |
| C14 | Inutang (principal) | Amount borrowed (principal) |  |
| C15 | Face amount sa kontrata — hindi ang natanggap kung may binawas. | The amount on your contract, not what you received if something was deducted. |  |
| C16 | Mga fee na binawas sa natanggap | Fees deducted from what you received |  |
| C17 | Halimbawa: processing fee, service fee, notarial fee, origination fee, transfer charge, documentary stamp tax, disbursement fee. Ilagay ang kabuuan ng lahat ng binawas. 0 kung buo ang natanggap. Kasama sa EIR. | For example: processing fee, service fee, notarial fee, origination fee, transfer charge, documentary stamp tax, disbursement fee. Enter the total of everything deducted. Enter 0 if you received the full amount. Included in the EIR. | Fee names come from rules.ts (the circular's own words), unchanged. |
| C18 | Hulog bawat bayad | Amount of each payment |  |
| C19 | Ang sinusulat sa schedule — isang numero lang kung isang bayad sa dulo. | As written on your schedule. Just one number if you pay once at the end. |  |
| C20 | Ilang hulog | Number of payments |  |
| C21 | Unang due (araw) | First payment due (day) |  |
| C22 | 7 = due sa ika-7 araw | 7 = due on day 7 |  |
| C23 | Dalas ng hulog | How often you pay |  |
| C24 | Araw-araw | Daily |  |
| C25 | Bawat 7 araw | Every 7 days |  |
| C26 | Bawat 14 araw | Every 14 days |  |
| C27 | Buwanan (~30 araw) | Monthly (~30 days) |  |
| C28 | Late penalty na siningil (kung meron) | Late penalty charged (if any) |  |
| C29 | Hindi kasama sa EIR; kasama sa <u>100%</u> total-cost cap. | Not part of the EIR. It counts toward the <u>100%</u> total-cost limit. |  |
| C30 | Tala: unang follow-up | Note: first follow-up |  |
| C31 | Opsyonal. Ilagay kung kailan unang tumawag o nag-message — hal. araw 4 sa 7-araw na loan. Hindi ito interes at hindi paratang sa sinuman. | Optional. When did they first call or message you? For example, day 4 of a 7-day loan. This is not interest, and it does not accuse anyone. |  |
| C32 | Araw ng unang follow-up | Day of the first follow-up |  |
| C33 | Saklaw ng ceiling | Does the limit apply? | Small heading above the three coverage questions. |
| C34 | Lending / financing company (hindi bangko) | Lending or financing company (not a bank) |  |
| C35 | Unsecured, general-purpose | Unsecured, general-purpose loan |  |
| C36 | Petsa ng kontrata / renewal | Contract or renewal date |  |
| C37 | Para sa loans na pinasok, inayos o na-renew simula 1 Abril 2026. | For loans taken out, restructured or renewed from 1 April 2026. | Date as “1 April 2026” (day month year, month in words). |
| C38 | Hindi namin sine-save o ipinapadala ang mga numerong inilagay mo. | We don't save or send the numbers you enter. |  |

### 1.3 When the numbers cannot be used

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C39 | Maglagay ng principal at hulog para makita ang totoong gastos. | Enter the amount borrowed and a payment to see the true cost. |  |
| C40 | Ilagay ang petsa ng kontrata para makita ang resulta. | Enter the contract date to see the result. |  |
| C41 | Hindi makalkula: ang binawas na fee ay hindi dapat katumbas o lampas sa inutang. Pakisuri ang mga numero. | We can't calculate this: the deducted fees can't be equal to or more than the amount borrowed. Please check the numbers. |  |
| C42 | Hindi makalkula: mas mababa ang kabuuang hulog kaysa sa natanggap mo. Pakisuri ang mga numero. | We can't calculate this: your payments add up to less than what you received. Please check the numbers. |  |
| C43 | Hindi makalkula ang rate sa mga numerong ito. Pakisuri ang mga numero. | We can't work out a rate from these numbers. Please check them. |  |

### 1.4 Result headline

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C44 | Ang totoong gastos mo: {X%} kada buwan. Sa araw {Z}, {₱Y} ang kabuuang babayaran mo. | Your true cost: {X%} a month. By day {Z}, you pay {₱Y} in total. | DECIDE: the headline. CLAUDE.md fixes the Filipino wording; it gets this English once you approve. |
| C45 | Ito ay ang rate kada araw × 30. Nasa "Paano kinuwenta" ang compounded na bersyon. | This is the daily rate × 30. The compounded version is under “How we calculated this”. |  |

### 1.5 Comparison with the published ceiling

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C46 | Ang tool na ito ay para sa loans simula 1 Abril 2026. | This tool is for loans from 1 April 2026. |  |
| C47 | Kumpara sa naka-publish na ceiling | Compared with the published limit | “Limit” for the circular's “ceiling” throughout: plainer. DECIDE (see the list above). |
| C48 | Batay sa <u>SEC MC No. 14, s. 2025</u> · as of 2026-09-19 | Based on <u>SEC MC No. 14, s. 2025</u> · as of 2026-09-19 |  |
| C49 | Sakop ng ceiling ang loan na ito. | The limit applies to this loan. |  |
| C50 | Maaaring sakop ang loan na ito. | The limit may apply to this loan. |  |
| C51 | Hindi sakop ng ceiling ang loan na ito. | The limit does not apply to this loan. |  |
| C52 | Ang ceiling ay para sa lending at financing companies — hindi sa bangko. | The limit is for lending and financing companies, not banks. |  |
| C53 | Ang ceiling ay para sa unsecured loans. | The limit is for unsecured loans. |  |
| C54 | Ang ceiling ay para sa general-purpose loans. | The limit is for general-purpose loans. |  |
| C55 | Ang principal na ₱10,001 ay lampas sa <u>₱10,000</u> na saklaw. | A principal of ₱10,001 is more than the <u>₱10,000</u> the limit covers. | Example: the amount varies. |
| C56 | Ang tenor na 124 araw ay lampas sa <u>4 na buwan</u>. | A term of 124 days is longer than <u>4 months</u>. | Example: the days vary. |
| C57 | Ang tenor na 121 araw ay maaaring pasok pa sa <u>4 na buwan</u>, depende sa kalendaryo. Maaaring sakop. | A term of 121 days may still be within <u>4 months</u>, depending on the calendar. The limit may apply. | Example: the days vary. |
| C58 | Effective interest rate (EIR) kada buwan | Effective interest rate (EIR) per month |  |
| C59 | Nominal na interes kada buwan | Nominal interest per month |  |
| C60 | Kabuuang gastos kumpara sa inutang | Total cost compared with the amount borrowed |  |
| C61 | Nasa loob ng ceiling | Within the limit |  |
| C62 | Malapit sa ceiling | Close to the limit | DECIDE: the GRAY label. CLAUDE.md principle 2 quotes “malapit sa ceiling”; it gets this English. |
| C63 | Lampas sa ceiling | Above the limit | N36: never “illegal”, never “you don't have to pay”. See the NEW line N1 below. |
| C64 | Hindi tiyak kung sakop | Not sure the limit applies |  |
| C65 | Numero mo: {the borrower's figure} · Ceiling: {cap, linked} | Your number: {the borrower's figure} · Limit: {cap, linked} |  |
| C66 | <u>12% kada buwan</u> | <u>12% a month</u> |  |
| C67 | <u>6% kada buwan</u> | <u>6% a month</u> |  |
| C68 | <u>100% ng inutang</u> | <u>100% of the amount borrowed</u> |  |
| C69 | Malapit sa ceiling — depende kung paano kinukuwenta ang buwanang rate. Hindi malinaw sa circular. | Close to the limit. It depends on how the monthly rate is worked out, and the circular does not say which way. |  |
| C70 | Maaaring lumampas ang numero mo, pero hindi tiyak kung sakop ang loan na ito. | Your number may be above the limit, but it is not certain that the limit applies to this loan. |  |
| C71 | Illustration lang. Ang institusyon ang magbibigay ng opisyal na EIR sa disclosure statement. Hindi ito legal advice at hindi tumutukoy sa anumang lender. | An illustration only. The lender's disclosure statement gives the official EIR. This is not legal advice and does not refer to any lender. |  |

### 1.6 Paano kinuwenta (expander)

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C72 | Paano kinuwenta | How we calculated this |  |
| C73 | Natanggap mo (net proceeds) | What you received (net proceeds) |  |
| C74 | Kabuuang babayaran (sa araw {Z}) | Total you pay (by day {Z}) |  |
| C75 | Kabuuang gastos (interest + fees + penalty) | Total cost (interest + fees + penalty) |  |
| C76 | Rate kada araw (EIR) | Daily rate (EIR) |  |
| C77 | Kada buwan, simple (rate kada araw × 30) | Per month, simple (daily rate × 30) |  |
| C78 | Kada buwan, compounded ((1 + rate kada araw) ^ 30 − 1) | Per month, compounded ((1 + daily rate) ^ 30 − 1) |  |
| C79 | Nominal na interes kada buwan | Nominal interest per month |  |
| C80 | {₱ total cost} · {% of the amount borrowed} ng inutang | {₱ total cost} · {%} of the amount borrowed |  |
| C81 | Ang EIR ay ang rate kada araw na nagpapantay sa natanggap mo at sa lahat ng bayad mo, hindi kasama ang late penalty. Hindi sinasabi ng circular kung paano gagawing buwanan ang rate kada araw — ×30 o compounded — kaya ipinapakita namin ang pareho. | The EIR is the daily rate that balances what you received with everything you pay, not counting late penalties. The circular does not say how to turn the daily rate into a monthly one, ×30 or compounded, so we show both. |  |

### 1.7 Kalendaryo ng loan

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C82 | Kalendaryo ng loan | Loan calendar |  |
| C83 | {days}-araw na tenor · {number of payments} hulog | {days}-day term · {number of payments} payments | Needs “1 payment” vs “4 payments” in code (F3). |
| C84 | Araw 0 | Day 0 |  |
| C85 | Natanggap · {₱ received} | Received · {₱ received} |  |
| C86 | Araw {day} | Day {day} |  |
| C87 | Hulog {n} · {₱ amount} | Payment {n} · {₱ amount} |  |
| C88 | Unang follow-up (tala mo) | First follow-up (your note) |  |
| C89 | Araw | Day |  |
| C90 | Pera | Received | Day 0 cell; the Filipino “Pera” is “money”. |
| C91 | Due | Due |  |
| C92 | Follow-up | Follow-up |  |
| C93 | Araw 0 = natanggap ang pera. Due = araw ng hulog ayon sa inilagay mo. | Day 0 = the day you got the money. Due = a payment day, as you entered it. |  |
| C94 | Follow-up = araw {day} (opsyonal na tala — hindi charge, hindi hatol sa lender). | Follow-up = day {day} (your optional note: not a charge, and not a judgment of the lender). |  |

### 1.8 Iskedyul

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C95 | Iskedyul | Schedule |  |
| C96 | Araw | Day |  |
| C97 | Bayad | Payment |  |
| C98 | Release | Received | Was the English “Release”; now matches C85. |

### 1.9 Batayan

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C99 | Batayan | Sources | The Filipino “Batayan” is “basis”. |
| C100 | **<u>SEC MC No. 14, s. 2025</u>** — epektibo simula 1 Abril 2026. Para sa unsecured, general-purpose loans ng lending at financing companies na hindi lalampas sa <u>₱10,000</u> at hindi hihigit sa <u>4 na buwan</u>. | **<u>SEC MC No. 14, s. 2025</u>** In effect from 1 April 2026. For unsecured, general-purpose loans from lending and financing companies of up to <u>₱10,000</u> and up to <u>4 months</u>. |  |
| C101 | **Mga ceiling** — nominal <u>6% kada buwan</u>, EIR <u>12% kada buwan</u>, at kabuuang gastos na hindi lalampas sa <u>100% ng inutang</u>. | **The limits** Nominal interest <u>6% a month</u>, EIR <u>12% a month</u>, and a total cost of no more than <u>100% of the amount borrowed</u>. | The circular calls these “ceilings”. |
| C102 | **Hindi sinusuri ng tool na ito** ang ceiling sa late penalty (<u>5% kada buwan</u>), dahil kailangan nito ng bilang ng araw na late. | **This tool does not check** the late-penalty limit (<u>5% a month</u>), because that needs the number of days late. |  |
| C103 | **RA No. 3765 (Truth in Lending Act)** — ang batayan ng pagkuwenta ng EIR ayon sa circular. Hindi tinukoy ng circular kung ×30 o compounded ang buwanang rate, kaya ipinapakita namin ang pareho. | **RA No. 3765 (Truth in Lending Act)** The basis for calculating the EIR, according to the circular. The circular does not say whether the monthly rate is ×30 or compounded, so we show both. |  |

### 1.10 Email form

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C104 | Gusto mo ng libreng checklist at abiso kapag may bagong rules? | Want a free checklist, and a note when the rules change? |  |
| C105 | Opsyonal. Hindi mo ito kailangan para makita ang resulta mo, at hindi kasama rito ang anumang numerong inilagay mo. | Optional. You don't need it to see your result, and none of the numbers you entered are included. |  |
| C106 | Email | Email |  |
| C107 | Pumapayag akong padalhan ng email para sa checklist at mga abiso. Nabasa ko ang <u>Patakaran sa Privacy</u>. | I agree to get emails with the checklist and updates. I have read the <u>Privacy Policy</u>. |  |
| C108 | Ipadala | Send |  |
| C109 | Ipinapadala… | Sending… |  |
| C110 | Salamat! Padadalhan ka namin ng checklist. | Thank you. We'll email you the checklist. |  |
| C111 | Hindi naipadala. Subukan ulit mamaya. | It didn't go through. Please try again later. |  |

### 1.11 Guide link

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C112 | Gusto mo ng mas malalim na gabay? | Want a fuller guide? |  |
| C113 | Kunin ang ₱99 na gabay | Get the ₱99 guide (in Tagalog) | The guide is in Tagalog (N15), so the link says so. |

### 1.12 Footer

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| C114 | Patakaran sa Privacy | Privacy Policy |  |

## 2. Privacy page (peso.credit/privacy)

### 2.1 Top of page

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| P01 | Balik sa calculator | Back to the calculator |  |
| P02 | Patakaran sa Privacy | Privacy Policy |  |
| P03 | DRAFT — para sa pagsusuri ng abogado. Hindi pa ito pinal at hindi pa dapat ituring na opisyal na patakaran. | DRAFT, for a lawyer to review. This is not final and is not yet our official policy. |  |

### 2.2 Ano ang kinokolekta namin

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| P04 | Ano ang kinokolekta namin | What we collect |  |
| P05 | Ang email address mo at ang oras ng pagpayag mo. Ibinibigay mo lang ang mga ito sa opsyonal na form sa calculator, at kinokolekta lang namin kung pumayag ka (naka-tsek ang kahon ng pagpayag). Iyon lang. | Your email address and the time you agreed. You give these only in the optional form on the calculator, and we collect them only if you agree (the consent box is ticked). That's all. |  |

### 2.3 Ano ang hindi namin kinokolekta

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| P06 | Ano ang hindi namin kinokolekta | What we don't collect |  |
| P07 | Hindi namin sine-save o ipinapadala ang mga numerong inilagay mo. Ang pagkuwenta ay ginagawa sa device mo, at hindi kailanman isinasama ang mga numerong iyon sa email form. | We don't save or send the numbers you enter. The calculation happens on your device, and those numbers are never included in the email form. | Starts with C38, word for word, as the Filipino does. |
| P08 | Wala kaming account, at walang analytics o tracking sa site na ito. Ang site mismo ay hindi nagse-set ng cookies, at ang mga font ay galing sa sarili naming site, hindi sa ibang website. | We have no accounts, and no analytics or tracking on this site. The site itself sets no cookies, and our fonts come from our own site, not from other websites. |  |
| P09 | Kapag pinindot mo ang link sa SEC (sec.gov.ph), aalis ka sa site na ito at ang website ng SEC na ang may hawak ng pagbisita mo. | If you tap the link to the SEC (sec.gov.ph), you leave this site, and the SEC's website handles your visit. |  |

### 2.4 Bakit namin ito kinokolekta

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| P10 | Bakit namin ito kinokolekta | Why we collect it |  |
| P11 | Para ipadala ang libreng checklist at ang mga abiso tungkol sa bagong rules na hiniling mo, at para may talaan kami na pumayag ka. | To send you the free checklist and the updates about new rules that you asked for, and to keep a record that you agreed. |  |

### 2.5 Kanino napupunta ang email mo

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| P12 | Kanino napupunta ang email mo | Who receives your email address |  |
| P13 | Ipinapadala ito sa aming email service provider, [ILAGAY DITO: pangalan ng email service provider], para sila ang magpadala ng mga email. Ang ipinapadala lang ay ang email address at ang oras ng pagpayag mo. | When you send the form, our email service provider, Resend, emails your address and the time you agreed to the site's operator. The operator then adds your address to our mailing list, which is also kept with Resend, and Resend sends our emails. Only your email address and the time you agreed are sent. | CHANGED, not just translated: now states the Resend flow (N13, N17). The provider blank is filled with Resend. For the lawyer. |
| P14 | Ang site na ito ay naka-host sa [ILAGAY DITO: pangalan ng hosting provider]. [ILAGAY DITO: para sa abogado: ilarawan kung anong technical na detalye ng pagbisita, tulad ng IP address, ang maaaring itala ng hosting provider] | This site is hosted by Netlify. [FILL IN: for the lawyer: describe what technical details of a visit, such as the IP address, the hosting provider may record] | Host filled with Netlify. For the lawyer: Netlify's rate limit on the email form counts requests per IP address (N35). |

### 2.6 Gaano katagal namin itong iniingatan

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| P15 | Gaano katagal namin itong iniingatan | How long we keep it |  |
| P16 | [ILAGAY DITO: gaano katagal iniingatan ang email at oras ng pagpayag] | [FILL IN: how long the email address and consent time are kept] | For the lawyer: a copy also sits in the operator's inbox (N13). |

### 2.7 Paano mag-unsubscribe o magpabura ng email

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| P17 | Paano mag-unsubscribe o magpabura ng email | How to unsubscribe or have your email address deleted |  |
| P18 | Gamitin ang unsubscribe link sa bawat email na matatanggap mo. [ILAGAY DITO: kumpirmahin na may unsubscribe link ang napiling email service provider] | Use the unsubscribe link in every email you receive. [FILL IN: confirm that emails sent through Resend include an unsubscribe link] |  |
| P19 | Puwede ka ring sumulat sa [ILAGAY DITO: email address para sa mga kahilingan] at hihilingin naming burahin ang email mo. | You can also write to [FILL IN: email address for requests] to ask us to delete your email address. | Filled by CONTACT_EMAIL, as in the Filipino. For the lawyer: deleting should cover the inbox copy too. |

### 2.8 Ang mga karapatan mo

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| P20 | Ang mga karapatan mo | Your rights |  |
| P21 | [ILAGAY DITO: para sa abogado: ilagay dito ang mga karapatan ng user ayon sa batas at kung paano ito gagamitin] | [FILL IN: for the lawyer: the user's rights under the law, and how to use them] |  |

### 2.9 Makipag-ugnayan

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| P22 | Makipag-ugnayan | Contact |  |
| P23 | [ILAGAY DITO: pangalan ng operator ng site] · [ILAGAY DITO: email address ng contact] | [FILL IN: name of the site operator] · [FILL IN: contact email address] |  |

## 3. Browser tab and search results

### 3.1 Titles and description

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| T01 | Tunay na Interes | True Interest | Follows the C02 decision. |
| T02 | Libre. Ilagay ang loan amount, hulog, at bilang ng bayad. Tingnan ang EIR laban sa naka-publish na ceiling sa Pilipinas. | Free. Enter the loan amount, each payment and the number of payments. See the EIR next to the published limit in the Philippines. |  |
| T03 | Patakaran sa Privacy (DRAFT) · Tunay na Interes | Privacy Policy (DRAFT) · True Interest |  |
| T04 | Patakaran sa Privacy · Tunay na Interes | Privacy Policy · True Interest |  |

## 4. Error page

### 4.1 Error page

| ID | Now (Filipino) | Proposed English | Note |
|---|---|---|---|
| E01 | Something went wrong | Something went wrong | Unchanged. |
| E02 | An unexpected error occurred. Try reloading the page. | An unexpected error occurred. Try reloading the page. | Unchanged. |

## Not in this proposal

- **Owner's notification email** (subject "New peso.credit subscriber"). It's already English
  and never on screen.
- **Plurals** ("1 payment" vs "4 payments", C83). This is a code change in F3, not a wording choice.
