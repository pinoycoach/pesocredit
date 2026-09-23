# COPY-REVIEW — peso.credit

Every string a visitor can see, verbatim, grouped by screen, for independent content review
(BUILD-STANDARD point 14; DECISIONS N32). Reviewers need nothing else to read it cold.

- **Generated from the source by `tools/copy-review.ts`.** Text is taken from the app's own
  values or straight from the source, never retyped; line numbers are looked up. `npm test`
  fails if this file is out of date or leaves out an on-screen string.
- **Nothing here is a proposal.** No copy was rewritten for this document.
- `{…}` marks a part that varies (a number, a date, the borrower's own figure). Where it helps,
  an example follows in the "Shown when" column.
- <u>Underlined</u> text is a link to the SEC circular (SEC MC No. 14, s. 2025). **Bold** is bold on screen.
- IDs (C01, P01, …) are for review notes: "C14: …".

## For reviewers

Most of the site is in Filipino; a few terms are English on purpose (EIR, principal, fee names
from the circular). Read it as a borrower would. Please note, by ID:

1. Anything that overclaims, accuses, or could be read as naming or judging a lender.
2. Anything that reads as advice ("you should…") or promises an outcome.
3. Any term used incorrectly, or wording a borrower could misread.
4. Anything unclear, awkward, or inconsistent with the rest.

The rules this copy must keep: inform, never accuse; never name a lender; never say ilegal,
illegal, scam, fraud or loan shark; where the law is unclear, say so (GRAY), never OVER; not
legal advice.

This review is what Napoleon signs on (SIGNOFF.json, `reviewedBy`). What each signature covers:
`verdict-wording` is sections 1.3–1.5; `privacy-page` is section 2 except P03 (the DRAFT banner
goes when the page is signed); `cap-values` is the numbers inside the underlined caps, checked
against the circular itself rather than in this review.

## 1. Calculator page (peso.credit/)

The page a borrower lands on. Top to bottom.

### 1.1 Page header

| ID | Text | Where | Shown when |
|---|---|---|---|
| C01 | Philippines · SEC MC No. 14, s. 2025 | `src/lib/copy.ts:157` | always (small caps above the title) |
| C02 | Tunay na Interes | `src/routes/index.tsx:23` | always (page title) |
| C03 | Ilagay ang inutang, ang hulog, at ilang beses magbabayad. Kasama ang 7-araw na loan. Ang tool ay nagkukuwenta ng effective interest (EIR) at tinitingnan kung sakop ka ng naka-publish na ceiling — hindi nagnangalan ng lender, hindi nagpapayo kung paano magbayad. | `src/routes/index.tsx:26` | always |

### 1.2 Loan inputs card

| ID | Text | Where | Shown when |
|---|---|---|---|
| C04 | Mga numero ng loan mo | `src/components/calculator.tsx:119` | card title |
| C05 | Kunin sa disclosure statement, resibo, o app screen — hindi sa advertisement. | `src/components/calculator.tsx:121` | card description |
| C06 | 7 araw | `src/lib/loan-math.ts:334` | quick-fill button, top line |
| C07 | Isang bayad sa ika-7 araw | `src/lib/loan-math.ts:335` | quick-fill button, second line |
| C08 | 14 araw | `src/lib/loan-math.ts:345` | quick-fill button, top line |
| C09 | Isang bayad sa ika-14 | `src/lib/loan-math.ts:346` | quick-fill button, second line |
| C10 | 30 araw · 1 bayad | `src/lib/loan-math.ts:356` | quick-fill button, top line |
| C11 | Isang bayad sa dulo ng buwan | `src/lib/loan-math.ts:357` | quick-fill button, second line |
| C12 | 4 na hulog | `src/lib/loan-math.ts:367` | quick-fill button, top line |
| C13 | Lingguhan, apat na bayad | `src/lib/loan-math.ts:368` | quick-fill button, second line |
| C14 | Inutang (principal) | `src/components/calculator.tsx:150` | field label |
| C15 | Face amount sa kontrata — hindi ang natanggap kung may binawas. | `src/components/calculator.tsx:151` | field hint |
| C16 | Mga fee na binawas sa natanggap | `src/lib/copy.ts:115` | field label |
| C17 | Halimbawa: processing fee, service fee, notarial fee, origination fee, transfer charge, documentary stamp tax, disbursement fee. Ilagay ang kabuuan ng lahat ng binawas. 0 kung buo ang natanggap. Kasama sa EIR. | `src/lib/copy.ts:118` | field hint (fee names come from rules.ts OTHER_FEES_EXAMPLES) |
| C18 | Hulog bawat bayad | `src/components/calculator.tsx:164` | field label |
| C19 | Ang sinusulat sa schedule — isang numero lang kung isang bayad sa dulo. | `src/components/calculator.tsx:165` | field hint |
| C20 | Ilang hulog | `src/components/calculator.tsx:173` | field label |
| C21 | Unang due (araw) | `src/components/calculator.tsx:180` | field label |
| C22 | 7 = due sa ika-7 araw | `src/components/calculator.tsx:181` | field hint |
| C23 | Dalas ng hulog | `src/components/calculator.tsx:189` | label above the four frequency buttons |
| C24 | Araw-araw | `src/lib/loan-math.ts:24` | frequency button |
| C25 | Bawat 7 araw | `src/lib/loan-math.ts:25` | frequency button |
| C26 | Bawat 14 araw | `src/lib/loan-math.ts:26` | frequency button |
| C27 | Buwanan (~30 araw) | `src/lib/loan-math.ts:27` | frequency button |
| C28 | Late penalty na siningil (kung meron) | `src/components/calculator.tsx:214` | field label |
| C29 | Hindi kasama sa EIR; kasama sa <u>100%</u> total-cost cap. | `src/lib/copy.ts:162` | field hint |
| C30 | Tala: unang follow-up | `src/components/calculator.tsx:223` | switch label (optional note) |
| C31 | Opsyonal. Ilagay kung kailan unang tumawag o nag-message — hal. araw 4 sa 7-araw na loan. Hindi ito interes at hindi paratang sa sinuman. | `src/components/calculator.tsx:225` | switch hint |
| C32 | Araw ng unang follow-up | `src/components/calculator.tsx:234` | field label, only when the switch is on |
| C33 | Saklaw ng ceiling | `src/components/calculator.tsx:246` | small caps heading |
| C34 | Lending / financing company (hindi bangko) | `src/components/calculator.tsx:250` | switch |
| C35 | Unsecured, general-purpose | `src/components/calculator.tsx:256` | switch |
| C36 | Petsa ng kontrata / renewal | `src/components/calculator.tsx:264` | date field label |
| C37 | Para sa loans na pinasok, inayos o na-renew simula 1 Abril 2026. | `src/lib/copy.ts:168` | date field hint |
| C38 | Hindi namin sine-save o ipinapadala ang mga numerong inilagay mo. | `src/lib/copy.ts:160` | always, directly under the inputs card |

### 1.3 When the numbers cannot be used

Shown in place of the whole result.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C39 | Maglagay ng principal at hulog para makita ang totoong gastos. | `src/lib/copy.ts:51` | principal or payment missing, or not a usable number |
| C40 | Ilagay ang petsa ng kontrata para makita ang resulta. | `src/lib/copy.ts:52` | contract date missing or not a real date |
| C41 | Hindi makalkula: ang binawas na fee ay hindi dapat katumbas o lampas sa inutang. Pakisuri ang mga numero. | `src/lib/copy.ts:53` | the deducted fee is equal to or more than the amount borrowed |
| C42 | Hindi makalkula: mas mababa ang kabuuang hulog kaysa sa natanggap mo. Pakisuri ang mga numero. | `src/lib/copy.ts:55` | the payments add up to less than what was received |
| C43 | Hindi makalkula ang rate sa mga numerong ito. Pakisuri ang mga numero. | `src/lib/copy.ts:57` | no rate fits these numbers |

### 1.4 Result headline

| ID | Text | Where | Shown when |
|---|---|---|---|
| C44 | Ang totoong gastos mo: {X%} kada buwan. Sa araw {Z}, {₱Y} ang kabuuang babayaran mo. | `src/lib/copy.ts:62` | template; e.g. G2: "Ang totoong gastos mo: 114.58% kada buwan. Sa araw 7, ₱6,500.00 ang kabuuang babayaran mo." |
| C45 | Ito ay ang rate kada araw × 30. Nasa "Paano kinuwenta" ang compounded na bersyon. | `src/lib/copy.ts:65` | under the headline |

### 1.5 Comparison with the published ceiling

| ID | Text | Where | Shown when |
|---|---|---|---|
| C46 | Ang tool na ito ay para sa loans simula 1 Abril 2026. | `src/lib/copy.ts:48` | instead of this whole card, when the contract is dated before the circular applies |
| C47 | Kumpara sa naka-publish na ceiling | `src/lib/copy.ts:76` | card title |
| C48 | Batay sa <u>SEC MC No. 14, s. 2025</u> · as of 2026-09-19 | `src/components/source-link.tsx:43` | card subtitle; also at the end of Batayan (1.9) |
| C49 | Sakop ng ceiling ang loan na ito. | `src/lib/copy.ts:84` | coverage badge: COVERED |
| C50 | Maaaring sakop ang loan na ito. | `src/lib/copy.ts:85` | coverage badge: MAYBE |
| C51 | Hindi sakop ng ceiling ang loan na ito. | `src/lib/copy.ts:86` | coverage badge: NOT_COVERED |
| C52 | Ang ceiling ay para sa lending at financing companies — hindi sa bangko. | `src/lib/loan-math.ts:180` | reason under the coverage badge |
| C53 | Ang ceiling ay para sa unsecured loans. | `src/lib/loan-math.ts:183` | reason under the coverage badge |
| C54 | Ang ceiling ay para sa general-purpose loans. | `src/lib/loan-math.ts:186` | reason under the coverage badge |
| C55 | Ang principal na ₱10,001 ay lampas sa <u>₱10,000</u> na saklaw. | `src/lib/loan-math.ts:190` | reason under the coverage badge (example: the number varies) |
| C56 | Ang tenor na 124 araw ay lampas sa <u>4 na buwan</u>. | `src/lib/loan-math.ts:196` | reason under the coverage badge (example: the number varies) |
| C57 | Ang tenor na 121 araw ay maaaring pasok pa sa <u>4 na buwan</u>, depende sa kalendaryo. Maaaring sakop. | `src/lib/loan-math.ts:205` | reason under the coverage badge (example: the number varies) |
| C58 | Effective interest rate (EIR) kada buwan | `src/lib/copy.ts:100` | row label (eir) |
| C59 | Nominal na interes kada buwan | `src/lib/copy.ts:101` | row label (nominal) |
| C60 | Kabuuang gastos kumpara sa inutang | `src/lib/copy.ts:102` | row label (totalCost) |
| C61 | Nasa loob ng ceiling | `src/lib/copy.ts:90` | row badge: WITHIN |
| C62 | Malapit sa ceiling | `src/lib/copy.ts:91` | row badge: GRAY |
| C63 | Lampas sa ceiling | `src/lib/copy.ts:92` | row badge: OVER |
| C64 | Hindi tiyak kung sakop | `src/lib/copy.ts:74` | row badge when the number is over but coverage is uncertain |
| C65 | Numero mo: {the borrower's figure} · Ceiling: {cap, linked} | `src/lib/copy.ts:96` | every row; the cap text is below (words from ROW_NUMBER_LABEL and ROW_CEILING_LABEL) |
| C66 | <u>12% kada buwan</u> | `src/lib/limits.ts:10` | cap in the eir row (links to the circular) |
| C67 | <u>6% kada buwan</u> | `src/lib/limits.ts:9` | cap in the nominal row (links to the circular) |
| C68 | <u>100% ng inutang</u> | `src/lib/limits.ts:11` | cap in the totalCost row (links to the circular) |
| C69 | Malapit sa ceiling — depende kung paano kinukuwenta ang buwanang rate. Hindi malinaw sa circular. | `src/lib/copy.ts:67` | under the EIR row when the EIR is GRAY |
| C70 | Maaaring lumampas ang numero mo, pero hindi tiyak kung sakop ang loan na ito. | `src/lib/copy.ts:70` | under a row that is over while coverage is uncertain |
| C71 | Illustration lang. Ang institusyon ang magbibigay ng opisyal na EIR sa disclosure statement. Hindi ito legal advice at hindi tumutukoy sa anumang lender. | `src/lib/copy.ts:112` | always, bottom of the card |

### 1.6 Paano kinuwenta (expander)

| ID | Text | Where | Shown when |
|---|---|---|---|
| C72 | Paano kinuwenta | `src/lib/copy.ts:136` | expander title |
| C73 | Natanggap mo (net proceeds) | `src/lib/copy.ts:141` | row label; value beside it |
| C74 | Kabuuang babayaran (sa araw {Z}) | `src/lib/copy.ts:142` | row label; value beside it |
| C75 | Kabuuang gastos (interest + fees + penalty) | `src/lib/copy.ts:144` | row label; value beside it |
| C76 | Rate kada araw (EIR) | `src/lib/copy.ts:147` | row label; value beside it |
| C77 | Kada buwan, simple (rate kada araw × 30) | `src/lib/copy.ts:148` | row label; value beside it |
| C78 | Kada buwan, compounded ((1 + rate kada araw) ^ 30 − 1) | `src/lib/copy.ts:150` | row label; value beside it |
| C79 | Nominal na interes kada buwan | `src/lib/copy.ts:153` | row label; value beside it |
| C80 | {₱ total cost} · {% of the amount borrowed} ng inutang | `src/lib/copy.ts:145` | value of the total-cost row |
| C81 | Ang EIR ay ang rate kada araw na nagpapantay sa natanggap mo at sa lahat ng bayad mo, hindi kasama ang late penalty. Hindi sinasabi ng circular kung paano gagawing buwanan ang rate kada araw — ×30 o compounded — kaya ipinapakita namin ang pareho. | `src/lib/copy.ts:217` | below the rows |

### 1.7 Kalendaryo ng loan

| ID | Text | Where | Shown when |
|---|---|---|---|
| C82 | Kalendaryo ng loan | `src/components/calculator.tsx:297` | card title |
| C83 | {days}-araw na tenor · {number of payments} hulog | `src/components/calculator.tsx:299` | card subtitle |
| C84 | Araw 0 | `src/components/loan-timeline.tsx:17` | loans over 16 days: list, first row |
| C85 | Natanggap · {₱ received} | `src/components/loan-timeline.tsx:18` | list, first row |
| C86 | Araw {day} | `src/components/loan-timeline.tsx:25` | list, one row per payment |
| C87 | Hulog {n} · {₱ amount} | `src/components/loan-timeline.tsx:27` | list, one row per payment |
| C88 | Unang follow-up (tala mo) | `src/components/loan-timeline.tsx:34` | list, when a follow-up day is set |
| C89 | Araw | `src/components/loan-timeline.tsx:66` | loans of 16 days or less: day grid, every cell |
| C90 | Pera | `src/components/loan-timeline.tsx:71` | grid cell, day 0 |
| C91 | Due | `src/components/loan-timeline.tsx:73` | grid cell, a due day |
| C92 | Follow-up | `src/components/loan-timeline.tsx:75` | grid cell, the follow-up day |
| C93 | Araw 0 = natanggap ang pera. Due = araw ng hulog ayon sa inilagay mo. | `src/components/loan-timeline.tsx:82` | legend under the grid |
| C94 | Follow-up = araw {day} (opsyonal na tala — hindi charge, hindi hatol sa lender). | `src/components/loan-timeline.tsx:84` | legend, when a follow-up day is set |

### 1.8 Iskedyul

| ID | Text | Where | Shown when |
|---|---|---|---|
| C95 | Iskedyul | `src/components/calculator.tsx:309` | card title |
| C96 | Araw | `src/components/calculator.tsx:316` | column heading |
| C97 | Bayad | `src/components/calculator.tsx:317` | column heading |
| C98 | Release | `src/components/calculator.tsx:323` | first row (day 0) |

### 1.9 Batayan

Terms in bold; linked text underlined.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C99 | Batayan | `src/lib/copy.ts:170` | card title |
| C100 | **<u>SEC MC No. 14, s. 2025</u>** — epektibo simula 1 Abril 2026. Para sa unsecured, general-purpose loans ng lending at financing companies na hindi lalampas sa <u>₱10,000</u> at hindi hihigit sa <u>4 na buwan</u>. | `src/lib/copy.ts:179` | paragraph |
| C101 | **Mga ceiling** — nominal <u>6% kada buwan</u>, EIR <u>12% kada buwan</u>, at kabuuang gastos na hindi lalampas sa <u>100% ng inutang</u>. | `src/lib/copy.ts:190` | paragraph |
| C102 | **Hindi sinusuri ng tool na ito** ang ceiling sa late penalty (<u>5% kada buwan</u>), dahil kailangan nito ng bilang ng araw na late. | `src/lib/copy.ts:202` | paragraph |
| C103 | **RA No. 3765 (Truth in Lending Act)** — ang batayan ng pagkuwenta ng EIR ayon sa circular. Hindi tinukoy ng circular kung ×30 o compounded ang buwanang rate, kaya ipinapakita namin ang pareho. | `src/lib/copy.ts:210` | paragraph |

### 1.10 Email form

Only when the Resend settings are set (RESEND_API_KEY, SUBSCRIBE_NOTIFY_TO, SUBSCRIBE_FROM); always below the whole result.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C104 | Gusto mo ng libreng checklist at abiso kapag may bagong rules? | `src/lib/copy.ts:121` | card title |
| C105 | Opsyonal. Hindi mo ito kailangan para makita ang resulta mo, at hindi kasama rito ang anumang numerong inilagay mo. | `src/lib/copy.ts:122` | card description |
| C106 | Email | `src/lib/copy.ts:124` | field label |
| C107 | Pumapayag akong padalhan ng email para sa checklist at mga abiso. Nabasa ko ang <u>Patakaran sa Privacy</u>. | `src/lib/copy.ts:125` | consent checkbox label; the link opens /privacy (text from privacy-copy.ts PRIVACY_LINK_LABEL) |
| C108 | Ipadala | `src/lib/copy.ts:128` | button |
| C109 | Ipinapadala… | `src/lib/copy.ts:129` | button, while sending |
| C110 | Salamat! Padadalhan ka namin ng checklist. | `src/lib/copy.ts:130` | replaces the form after success |
| C111 | Hindi naipadala. Subukan ulit mamaya. | `src/lib/copy.ts:131` | beside the button after a failure |

### 1.11 Guide link

Only when GUIDE_URL is set.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C112 | Gusto mo ng mas malalim na gabay? | `src/lib/copy.ts:133` | card text |
| C113 | Kunin ang ₱99 na gabay | `src/lib/copy.ts:134` | link |

### 1.12 Footer

| ID | Text | Where | Shown when |
|---|---|---|---|
| C114 | Patakaran sa Privacy | `src/lib/privacy-copy.ts:38` | link to /privacy, new tab |

## 2. Privacy page (peso.credit/privacy)

Marked DRAFT for lawyer review (N17). `[ILAGAY DITO: …]` blanks are shown highlighted on the page, exactly as below.

### 2.1 Top of page

| ID | Text | Where | Shown when |
|---|---|---|---|
| P01 | Balik sa calculator | `src/lib/privacy-copy.ts:36` | link back to / |
| P02 | Patakaran sa Privacy | `src/lib/privacy-copy.ts:31` | page title |
| P03 | DRAFT — para sa pagsusuri ng abogado. Hindi pa ito pinal at hindi pa dapat ituring na opisyal na patakaran. | `src/lib/privacy-copy.ts:33` | banner, only while PRIVACY_STATUS is draft |

### 2.2 Ano ang kinokolekta namin

| ID | Text | Where | Shown when |
|---|---|---|---|
| P04 | Ano ang kinokolekta namin | `src/lib/privacy-copy.ts:44` | section heading |
| P05 | Ang email address mo at ang oras ng pagpayag mo. Ibinibigay mo lang ang mga ito sa opsyonal na form sa calculator, at kinokolekta lang namin kung pumayag ka (naka-tsek ang kahon ng pagpayag). Iyon lang. | `src/lib/privacy-copy.ts:46` | paragraph |

### 2.3 Ano ang hindi namin kinokolekta

| ID | Text | Where | Shown when |
|---|---|---|---|
| P06 | Ano ang hindi namin kinokolekta | `src/lib/privacy-copy.ts:50` | section heading |
| P07 | Hindi namin sine-save o ipinapadala ang mga numerong inilagay mo. Ang pagkuwenta ay ginagawa sa device mo, at hindi kailanman isinasama ang mga numerong iyon sa email form. | `src/lib/privacy-copy.ts:52` | paragraph |
| P08 | Wala kaming account, at walang analytics o tracking sa site na ito. Ang site mismo ay hindi nagse-set ng cookies, at ang mga font ay galing sa sarili naming site, hindi sa ibang website. | `src/lib/privacy-copy.ts:53` | paragraph |
| P09 | Kapag pinindot mo ang link sa SEC (sec.gov.ph), aalis ka sa site na ito at ang website ng SEC na ang may hawak ng pagbisita mo. | `src/lib/privacy-copy.ts:54` | paragraph |

### 2.4 Bakit namin ito kinokolekta

| ID | Text | Where | Shown when |
|---|---|---|---|
| P10 | Bakit namin ito kinokolekta | `src/lib/privacy-copy.ts:58` | section heading |
| P11 | Para ipadala ang libreng checklist at ang mga abiso tungkol sa bagong rules na hiniling mo, at para may talaan kami na pumayag ka. | `src/lib/privacy-copy.ts:60` | paragraph |

### 2.5 Kanino napupunta ang email mo

| ID | Text | Where | Shown when |
|---|---|---|---|
| P12 | Kanino napupunta ang email mo | `src/lib/privacy-copy.ts:64` | section heading |
| P13 | Ipinapadala ito sa aming email service provider, [ILAGAY DITO: pangalan ng email service provider], para sila ang magpadala ng mga email. Ang ipinapadala lang ay ang email address at ang oras ng pagpayag mo. | `src/lib/privacy-copy.ts:66` | paragraph |
| P14 | Ang site na ito ay naka-host sa [ILAGAY DITO: pangalan ng hosting provider]. [ILAGAY DITO: para sa abogado: ilarawan kung anong technical na detalye ng pagbisita, tulad ng IP address, ang maaaring itala ng hosting provider] | `src/lib/privacy-copy.ts:67` | paragraph |

### 2.6 Gaano katagal namin itong iniingatan

| ID | Text | Where | Shown when |
|---|---|---|---|
| P15 | Gaano katagal namin itong iniingatan | `src/lib/privacy-copy.ts:71` | section heading |
| P16 | [ILAGAY DITO: gaano katagal iniingatan ang email at oras ng pagpayag] | `src/lib/privacy-copy.ts:72` | paragraph |

### 2.7 Paano mag-unsubscribe o magpabura ng email

| ID | Text | Where | Shown when |
|---|---|---|---|
| P17 | Paano mag-unsubscribe o magpabura ng email | `src/lib/privacy-copy.ts:75` | section heading |
| P18 | Gamitin ang unsubscribe link sa bawat email na matatanggap mo. [ILAGAY DITO: kumpirmahin na may unsubscribe link ang napiling email service provider] | `src/lib/privacy-copy.ts:77` | paragraph |
| P19 | Puwede ka ring sumulat sa [ILAGAY DITO: email address para sa mga kahilingan] at hihilingin naming burahin ang email mo. | `src/lib/privacy-copy.ts:78` | paragraph |

### 2.8 Ang mga karapatan mo

| ID | Text | Where | Shown when |
|---|---|---|---|
| P20 | Ang mga karapatan mo | `src/lib/privacy-copy.ts:82` | section heading |
| P21 | [ILAGAY DITO: para sa abogado: ilagay dito ang mga karapatan ng user ayon sa batas at kung paano ito gagamitin] | `src/lib/privacy-copy.ts:83` | paragraph |

### 2.9 Makipag-ugnayan

| ID | Text | Where | Shown when |
|---|---|---|---|
| P22 | Makipag-ugnayan | `src/lib/privacy-copy.ts:86` | section heading |
| P23 | [ILAGAY DITO: pangalan ng operator ng site] · [ILAGAY DITO: email address ng contact] | `src/lib/privacy-copy.ts:88` | paragraph |

## 3. Browser tab and search results

Text that appears outside the page body.

### 3.1 Titles and description

| ID | Text | Where | Shown when |
|---|---|---|---|
| T01 | Tunay na Interes | `src/routes/__root.tsx:4` | tab title, calculator page |
| T02 | Libre. Ilagay ang loan amount, hulog, at bilang ng bayad. Tingnan ang EIR laban sa naka-publish na ceiling sa Pilipinas. | `src/routes/__root.tsx:15` | search-result description |
| T03 | Patakaran sa Privacy (DRAFT) · Tunay na Interes | `src/lib/privacy-copy.ts:97` | tab title, privacy page while draft |
| T04 | Patakaran sa Privacy · Tunay na Interes | `src/lib/privacy-copy.ts:96` | tab title, privacy page once final |

## 4. Error page

Shown only if the app fails. English, unlike the rest of the site.

### 4.1 Error page

| ID | Text | Where | Shown when |
|---|---|---|---|
| E01 | Something went wrong | `src/lib/error-component.tsx:23` | heading |
| E02 | An unexpected error occurred. Try reloading the page. | `src/lib/error-component.tsx:4` | message when the error has no text of its own; otherwise the error's own message is shown |

## Not on screen

For completeness: text in the source that a visitor never sees.

| Text | Where | Why it is not shown |
|---|---|---|
| restructuring, repackaging, splitting of loan amounts, recharacterization of fees, shifting of loan tenor, simulated collateral, sham guaranty arrangements, disguised charges | `src/lib/rules.ts:69` | Kept from the circular for later explainer content; nothing renders it. |
| Error codes in /api/subscribe responses ("invalid", "forbidden", …) | `src/lib/subscribe.ts:120` | The form shows only the messages in 1.10. |
| Subject: New peso.credit subscriber. Body: Email: {subscriber's address} / Consented at: {consent time} | `src/lib/subscribe.ts:69` | The email each new subscription sends to the owner's inbox through Resend (DECISIONS N13); only the owner reads it. |
