# COPY-REVIEW — peso.credit

Every string a visitor can see, verbatim, grouped by screen, for independent content review
(BUILD-STANDARD point 14; DECISIONS N32). Reviewers need nothing else to read it cold.

- **Generated from the source by `tools/copy-review.ts`.** Text is taken from the app's own
  values or straight from the source, never retyped; line numbers are looked up. `npm test`
  fails if this file is out of date or leaves out an on-screen string.
- **Language on screen: Filipino** (`src/lib/copy/fil.ts`, chosen in `src/lib/copy.ts`).
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
| C01 | Philippines · SEC MC No. 14, s. 2025 | `src/lib/copy/fil.ts:85` | always (small caps above the title) |
| C02 | Tunay na Interes | `src/lib/copy/fil.ts:86` | always (page title) |
| C03 | Ilagay ang inutang, ang hulog, at ilang beses magbabayad. Kasama ang 7-araw na loan. Ang tool ay nagkukuwenta ng effective interest (EIR) at tinitingnan kung sakop ka ng naka-publish na ceiling — hindi nagnangalan ng lender, hindi nagpapayo kung paano magbayad. | `src/lib/copy/fil.ts:88` | always |

### 1.2 Loan inputs card

| ID | Text | Where | Shown when |
|---|---|---|---|
| C04 | Mga numero ng loan mo | `src/lib/copy/fil.ts:90` | card title |
| C05 | Kunin sa disclosure statement, resibo, o app screen — hindi sa advertisement. | `src/lib/copy/fil.ts:91` | card description |
| C06 | 7 araw | `src/lib/copy/fil.ts:93` | quick-fill button, top line |
| C07 | Isang bayad sa ika-7 araw | `src/lib/copy/fil.ts:93` | quick-fill button, second line |
| C08 | 14 araw | `src/lib/copy/fil.ts:94` | quick-fill button, top line |
| C09 | Isang bayad sa ika-14 | `src/lib/copy/fil.ts:94` | quick-fill button, second line |
| C10 | 30 araw · 1 bayad | `src/lib/copy/fil.ts:95` | quick-fill button, top line |
| C11 | Isang bayad sa dulo ng buwan | `src/lib/copy/fil.ts:95` | quick-fill button, second line |
| C12 | 4 na hulog | `src/lib/copy/fil.ts:96` | quick-fill button, top line |
| C13 | Lingguhan, apat na bayad | `src/lib/copy/fil.ts:96` | quick-fill button, second line |
| C14 | Inutang (principal) | `src/lib/copy/fil.ts:98` | field label |
| C15 | Face amount sa kontrata — hindi ang natanggap kung may binawas. | `src/lib/copy/fil.ts:99` | field hint |
| C16 | Mga fee na binawas sa natanggap | `src/lib/copy/fil.ts:100` | field label |
| C17 | Halimbawa: processing fee, service fee, notarial fee, origination fee, transfer charge, documentary stamp tax, disbursement fee. Ilagay ang kabuuan ng lahat ng binawas. 0 kung buo ang natanggap. Kasama sa EIR. | `src/lib/copy/fil.ts:101` | field hint (fee names come from rules.ts OTHER_FEES_EXAMPLES) |
| C18 | Hulog bawat bayad | `src/lib/copy/fil.ts:102` | field label |
| C19 | Ang sinusulat sa schedule — isang numero lang kung isang bayad sa dulo. | `src/lib/copy/fil.ts:103` | field hint |
| C20 | Ilang hulog | `src/lib/copy/fil.ts:104` | field label |
| C21 | Unang due (araw) | `src/lib/copy/fil.ts:105` | field label |
| C22 | 7 = due sa ika-7 araw | `src/lib/copy/fil.ts:106` | field hint |
| C23 | Dalas ng hulog | `src/lib/copy/fil.ts:107` | label above the four frequency buttons |
| C24 | Araw-araw | `src/lib/copy/fil.ts:109` | frequency button |
| C25 | Bawat 7 araw | `src/lib/copy/fil.ts:110` | frequency button |
| C26 | Bawat 14 araw | `src/lib/copy/fil.ts:111` | frequency button |
| C27 | Buwanan (~30 araw) | `src/lib/copy/fil.ts:112` | frequency button |
| C28 | Late penalty na siningil (kung meron) | `src/lib/copy/fil.ts:114` | field label |
| C29 | Hindi kasama sa EIR; kasama sa <u>100%</u> total-cost cap. | `src/lib/copy/fil.ts:115` | field hint |
| C30 | Tala: unang follow-up | `src/lib/copy/fil.ts:120` | switch label (optional note) |
| C31 | Opsyonal. Ilagay kung kailan unang tumawag o nag-message — hal. araw 4 sa 7-araw na loan. Hindi ito interes at hindi paratang sa sinuman. | `src/lib/copy/fil.ts:122` | switch hint |
| C32 | Araw ng unang follow-up | `src/lib/copy/fil.ts:123` | field label, only when the switch is on |
| C33 | Saklaw ng ceiling | `src/lib/copy/fil.ts:124` | small caps heading |
| C34 | Lending / financing company (hindi bangko) | `src/lib/copy/fil.ts:125` | switch |
| C35 | Unsecured, general-purpose | `src/lib/copy/fil.ts:126` | switch |
| C36 | Petsa ng kontrata / renewal | `src/lib/copy/fil.ts:127` | date field label |
| C37 | Para sa loans na pinasok, inayos o na-renew simula 1 Abril 2026. | `src/lib/copy/fil.ts:128` | date field hint |
| C38 | Hindi namin sine-save o ipinapadala ang mga numerong inilagay mo. | `src/lib/copy/fil.ts:48` | always, directly under the inputs card |

### 1.3 When the numbers cannot be used

Shown in place of the whole result.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C39 | Maglagay ng principal at hulog para makita ang totoong gastos. | `src/lib/copy/fil.ts:132` | principal or payment missing, or not a usable number |
| C40 | Ilagay ang petsa ng kontrata para makita ang resulta. | `src/lib/copy/fil.ts:133` | contract date missing or not a real date |
| C41 | Hindi makalkula: ang binawas na fee ay hindi dapat katumbas o lampas sa inutang. Pakisuri ang mga numero. | `src/lib/copy/fil.ts:135` | the deducted fee is equal to or more than the amount borrowed |
| C42 | Hindi makalkula: mas mababa ang kabuuang hulog kaysa sa natanggap mo. Pakisuri ang mga numero. | `src/lib/copy/fil.ts:137` | the payments add up to less than what was received |
| C43 | Hindi makalkula ang rate sa mga numerong ito. Pakisuri ang mga numero. | `src/lib/copy/fil.ts:138` | no rate fits these numbers |

### 1.4 Result headline

| ID | Text | Where | Shown when |
|---|---|---|---|
| C44 | Ang totoong gastos mo: {X%} kada buwan. Sa araw {Z}, {₱Y} ang kabuuang babayaran mo. | `src/lib/copy/fil.ts:141` | template; e.g. G2: "Ang totoong gastos mo: 114.58% kada buwan. Sa araw 7, ₱6,500.00 ang kabuuang babayaran mo." |
| C45 | Ito ay ang rate kada araw × 30. Nasa "Paano kinuwenta" ang compounded na bersyon. | `src/lib/copy/fil.ts:142` | under the headline |

### 1.5 Comparison with the published ceiling

| ID | Text | Where | Shown when |
|---|---|---|---|
| C46 | Ang tool na ito ay para sa loans simula 1 Abril 2026. | `src/lib/copy/fil.ts:143` | instead of this whole card, when the contract is dated before the circular applies |
| C47 | Kumpara sa naka-publish na ceiling | `src/lib/copy/fil.ts:144` | card title |
| C48 | Batay sa <u>SEC MC No. 14, s. 2025</u> · as of 2026-09-19 | `src/components/source-link.tsx:43` | card subtitle; also at the end of Batayan (1.9) |
| C49 | Sakop ng ceiling ang loan na ito. | `src/lib/copy/fil.ts:148` | coverage badge: COVERED |
| C50 | Maaaring sakop ang loan na ito. | `src/lib/copy/fil.ts:149` | coverage badge: MAYBE |
| C51 | Hindi sakop ng ceiling ang loan na ito. | `src/lib/copy/fil.ts:150` | coverage badge: NOT_COVERED |
| C52 | Ang ceiling ay para sa lending at financing companies — hindi sa bangko. | `src/lib/copy/fil.ts:56` | reason under the coverage badge |
| C53 | Ang ceiling ay para sa unsecured loans. | `src/lib/copy/fil.ts:58` | reason under the coverage badge |
| C54 | Ang ceiling ay para sa general-purpose loans. | `src/lib/copy/fil.ts:60` | reason under the coverage badge |
| C55 | Ang principal na ₱10,001 ay lampas sa <u>₱10,000</u> na saklaw. | `src/lib/copy/fil.ts:62` | reason under the coverage badge (example: the number varies) |
| C56 | Ang tenor na 124 araw ay lampas sa <u>4 na buwan</u>. | `src/lib/copy/fil.ts:68` | reason under the coverage badge (example: the number varies) |
| C57 | Ang tenor na 121 araw ay maaaring pasok pa sa <u>4 na buwan</u>, depende sa kalendaryo. Maaaring sakop. | `src/lib/copy/fil.ts:70` | reason under the coverage badge (example: the number varies) |
| C58 | Effective interest rate (EIR) kada buwan | `src/lib/copy/fil.ts:154` | row label (eir) |
| C59 | Nominal na interes kada buwan | `src/lib/copy/fil.ts:155` | row label (nominal) |
| C60 | Kabuuang gastos kumpara sa inutang | `src/lib/copy/fil.ts:156` | row label (totalCost) |
| C61 | Nasa loob ng ceiling | `src/lib/copy/fil.ts:159` | row badge: WITHIN |
| C62 | Malapit sa ceiling | `src/lib/copy/fil.ts:160` | row badge: GRAY |
| C63 | Lampas sa ceiling | `src/lib/copy/fil.ts:161` | row badge: OVER |
| C64 | Hindi tiyak kung sakop | `src/lib/copy/fil.ts:163` | row badge when the number is over but coverage is uncertain |
| C65 | Numero mo: {the borrower's figure} · Ceiling: {cap, linked} | `src/lib/copy/fil.ts:164` | every row; the cap text is below (words from rowNumberLabel and rowCeilingLabel) |
| C66 | <u>12% kada buwan</u> | `src/lib/copy/fil.ts:167` | cap in the eir row (links to the circular) |
| C67 | <u>6% kada buwan</u> | `src/lib/copy/fil.ts:168` | cap in the nominal row (links to the circular) |
| C68 | <u>100% ng inutang</u> | `src/lib/copy/fil.ts:169` | cap in the totalCost row (links to the circular) |
| C69 | Malapit sa ceiling — depende kung paano kinukuwenta ang buwanang rate. Hindi malinaw sa circular. | `src/lib/copy/fil.ts:172` | under the EIR row when the EIR is GRAY |
| C70 | Maaaring lumampas ang numero mo, pero hindi tiyak kung sakop ang loan na ito. | `src/lib/copy/fil.ts:174` | under a row that is over while coverage is uncertain |
| C71 | Illustration lang. Ang institusyon ang magbibigay ng opisyal na EIR sa disclosure statement. Hindi ito legal advice at hindi tumutukoy sa anumang lender. | `src/lib/copy/fil.ts:176` | always, bottom of the card |

### 1.6 Paano kinuwenta (expander)

| ID | Text | Where | Shown when |
|---|---|---|---|
| C72 | Paano kinuwenta | `src/lib/copy/fil.ts:178` | expander title |
| C73 | Natanggap mo (net proceeds) | `src/lib/copy/fil.ts:180` | row label; value beside it |
| C74 | Kabuuang babayaran (sa araw {Z}) | `src/lib/copy/fil.ts:181` | row label; value beside it |
| C75 | Kabuuang gastos (interest + fees + penalty) | `src/lib/copy/fil.ts:183` | row label; value beside it |
| C76 | Rate kada araw (EIR) | `src/lib/copy/fil.ts:186` | row label; value beside it |
| C77 | Kada buwan, simple (rate kada araw × 30) | `src/lib/copy/fil.ts:187` | row label; value beside it |
| C78 | Kada buwan, compounded ((1 + rate kada araw) ^ 30 − 1) | `src/lib/copy/fil.ts:189` | row label; value beside it |
| C79 | Nominal na interes kada buwan | `src/lib/copy/fil.ts:192` | row label; value beside it |
| C80 | {₱ total cost} · {% of the amount borrowed} ng inutang | `src/lib/copy/fil.ts:184` | value of the total-cost row |
| C81 | Ang EIR ay ang rate kada araw na nagpapantay sa natanggap mo at sa lahat ng bayad mo, hindi kasama ang late penalty. Hindi sinasabi ng circular kung paano gagawing buwanan ang rate kada araw — ×30 o compounded — kaya ipinapakita namin ang pareho. | `src/lib/copy/fil.ts:194` | below the rows |

### 1.7 Kalendaryo ng loan

| ID | Text | Where | Shown when |
|---|---|---|---|
| C82 | Kalendaryo ng loan | `src/lib/copy/fil.ts:196` | card title |
| C83 | {days}-araw na tenor · {number of payments} hulog | `src/lib/copy/fil.ts:197` | card subtitle |
| C84 | Araw 0 | `src/lib/copy/fil.ts:198` | loans over 16 days: list, first row |
| C85 | Natanggap · {₱ received} | `src/lib/copy/fil.ts:199` | list, first row |
| C86 | Araw {day} | `src/lib/copy/fil.ts:200` | list, one row per payment |
| C87 | Hulog {n} · {₱ amount} | `src/lib/copy/fil.ts:201` | list, one row per payment |
| C88 | Unang follow-up (tala mo) | `src/lib/copy/fil.ts:202` | list, when a follow-up day is set |
| C89 | Araw | `src/lib/copy/fil.ts:203` | loans of 16 days or less: day grid, every cell |
| C90 | Pera | `src/lib/copy/fil.ts:204` | grid cell, day 0 |
| C91 | Due | `src/lib/copy/fil.ts:205` | grid cell, a due day |
| C92 | Follow-up | `src/lib/copy/fil.ts:206` | grid cell, the follow-up day |
| C93 | Araw 0 = natanggap ang pera. Due = araw ng hulog ayon sa inilagay mo. | `src/lib/copy/fil.ts:207` | legend under the grid |
| C94 | Follow-up = araw {day} (opsyonal na tala — hindi charge, hindi hatol sa lender). | `src/lib/copy/fil.ts:208` | legend, when a follow-up day is set |

### 1.8 Iskedyul

| ID | Text | Where | Shown when |
|---|---|---|---|
| C95 | Iskedyul | `src/lib/copy/fil.ts:210` | card title |
| C96 | Araw | `src/lib/copy/fil.ts:211` | column heading |
| C97 | Bayad | `src/lib/copy/fil.ts:212` | column heading |
| C98 | Release | `src/lib/copy/fil.ts:213` | first row (day 0) |

### 1.9 Batayan

Terms in bold; linked text underlined.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C99 | Batayan | `src/lib/copy/fil.ts:215` | card title |
| C100 | **<u>SEC MC No. 14, s. 2025</u>** — epektibo simula 1 Abril 2026. Para sa unsecured, general-purpose loans ng lending at financing companies na hindi lalampas sa <u>₱10,000</u> at hindi hihigit sa <u>4 na buwan</u>. | `src/lib/copy/fil.ts:218` | paragraph |
| C101 | **Mga ceiling** — nominal <u>6% kada buwan</u>, EIR <u>12% kada buwan</u>, at kabuuang gastos na hindi lalampas sa <u>100% ng inutang</u>. | `src/lib/copy/fil.ts:229` | paragraph |
| C102 | **Hindi sinusuri ng tool na ito** ang ceiling sa late penalty (<u>5% kada buwan</u>), dahil kailangan nito ng bilang ng araw na late. | `src/lib/copy/fil.ts:241` | paragraph |
| C103 | **RA No. 3765 (Truth in Lending Act)** — ang batayan ng pagkuwenta ng EIR ayon sa circular. Hindi tinukoy ng circular kung ×30 o compounded ang buwanang rate, kaya ipinapakita namin ang pareho. | `src/lib/copy/fil.ts:249` | paragraph |

### 1.10 Email form

Only when the Resend settings are set (RESEND_API_KEY, SUBSCRIBE_NOTIFY_TO, SUBSCRIBE_FROM); always below the whole result.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C104 | Gusto mo ng libreng checklist at abiso kapag may bagong rules? | `src/lib/copy/fil.ts:256` | card title |
| C105 | Opsyonal. Hindi mo ito kailangan para makita ang resulta mo, at hindi kasama rito ang anumang numerong inilagay mo. | `src/lib/copy/fil.ts:258` | card description |
| C106 | Email | `src/lib/copy/fil.ts:259` | field label |
| C107 | Pumapayag akong padalhan ng email para sa checklist at mga abiso. Nabasa ko ang <u>Patakaran sa Privacy</u>. | `src/lib/copy/fil.ts:261` | consent checkbox label; the link opens /privacy (link text from privacyLinkLabel) |
| C108 | Ipadala | `src/lib/copy/fil.ts:263` | button |
| C109 | Ipinapadala… | `src/lib/copy/fil.ts:264` | button, while sending |
| C110 | Salamat! Padadalhan ka namin ng checklist. | `src/lib/copy/fil.ts:265` | replaces the form after success |
| C111 | Hindi naipadala. Subukan ulit mamaya. | `src/lib/copy/fil.ts:266` | beside the button after a failure |

### 1.11 Guide link

Only when GUIDE_URL is set.

| ID | Text | Where | Shown when |
|---|---|---|---|
| C112 | Gusto mo ng mas malalim na gabay? | `src/lib/copy/fil.ts:267` | card text |
| C113 | Kunin ang ₱99 na gabay | `src/lib/copy/fil.ts:268` | link |

### 1.12 Footer

| ID | Text | Where | Shown when |
|---|---|---|---|
| C114 | Patakaran sa Privacy | `src/lib/copy/fil.ts:275` | link to /privacy, new tab |

## 2. Privacy page (peso.credit/privacy)

Marked DRAFT for lawyer review (N17). `[ILAGAY DITO: …]` blanks are shown highlighted on the page, exactly as below.

### 2.1 Top of page

| ID | Text | Where | Shown when |
|---|---|---|---|
| P01 | Balik sa calculator | `src/lib/copy/fil.ts:274` | link back to / |
| P02 | Patakaran sa Privacy | `src/lib/copy/fil.ts:51` | page title |
| P03 | DRAFT — para sa pagsusuri ng abogado. Hindi pa ito pinal at hindi pa dapat ituring na opisyal na patakaran. | `src/lib/copy/fil.ts:273` | banner, only while PRIVACY_STATUS is draft |

### 2.2 Ano ang kinokolekta namin

| ID | Text | Where | Shown when |
|---|---|---|---|
| P04 | Ano ang kinokolekta namin | `src/lib/copy/fil.ts:278` | section heading |
| P05 | Ang email address mo at ang oras ng pagpayag mo. Ibinibigay mo lang ang mga ito sa opsyonal na form sa calculator, at kinokolekta lang namin kung pumayag ka (naka-tsek ang kahon ng pagpayag). Iyon lang. | `src/lib/copy/fil.ts:280` | paragraph |

### 2.3 Ano ang hindi namin kinokolekta

| ID | Text | Where | Shown when |
|---|---|---|---|
| P06 | Ano ang hindi namin kinokolekta | `src/lib/copy/fil.ts:284` | section heading |
| P07 | Hindi namin sine-save o ipinapadala ang mga numerong inilagay mo. Ang pagkuwenta ay ginagawa sa device mo, at hindi kailanman isinasama ang mga numerong iyon sa email form. | `src/lib/copy/fil.ts:286` | paragraph |
| P08 | Wala kaming account, at walang analytics o tracking sa site na ito. Ang site mismo ay hindi nagse-set ng cookies, at ang mga font ay galing sa sarili naming site, hindi sa ibang website. | `src/lib/copy/fil.ts:287` | paragraph |
| P09 | Kapag pinindot mo ang link sa SEC (sec.gov.ph), aalis ka sa site na ito at ang website ng SEC na ang may hawak ng pagbisita mo. | `src/lib/copy/fil.ts:288` | paragraph |

### 2.4 Bakit namin ito kinokolekta

| ID | Text | Where | Shown when |
|---|---|---|---|
| P10 | Bakit namin ito kinokolekta | `src/lib/copy/fil.ts:292` | section heading |
| P11 | Para ipadala ang libreng checklist at ang mga abiso tungkol sa bagong rules na hiniling mo, at para may talaan kami na pumayag ka. | `src/lib/copy/fil.ts:294` | paragraph |

### 2.5 Kanino napupunta ang email mo

| ID | Text | Where | Shown when |
|---|---|---|---|
| P12 | Kanino napupunta ang email mo | `src/lib/copy/fil.ts:298` | section heading |
| P13 | Ipinapadala ito sa aming email service provider, [ILAGAY DITO: pangalan ng email service provider], para sila ang magpadala ng mga email. Ang ipinapadala lang ay ang email address at ang oras ng pagpayag mo. | `src/lib/copy/fil.ts:300` | paragraph |
| P14 | Ang site na ito ay naka-host sa [ILAGAY DITO: pangalan ng hosting provider]. [ILAGAY DITO: para sa abogado: ilarawan kung anong technical na detalye ng pagbisita, tulad ng IP address, ang maaaring itala ng hosting provider] | `src/lib/copy/fil.ts:301` | paragraph |

### 2.6 Gaano katagal namin itong iniingatan

| ID | Text | Where | Shown when |
|---|---|---|---|
| P15 | Gaano katagal namin itong iniingatan | `src/lib/copy/fil.ts:305` | section heading |
| P16 | [ILAGAY DITO: gaano katagal iniingatan ang email at oras ng pagpayag] | `src/lib/copy/fil.ts:306` | paragraph |

### 2.7 Paano mag-unsubscribe o magpabura ng email

| ID | Text | Where | Shown when |
|---|---|---|---|
| P17 | Paano mag-unsubscribe o magpabura ng email | `src/lib/copy/fil.ts:309` | section heading |
| P18 | Gamitin ang unsubscribe link sa bawat email na matatanggap mo. [ILAGAY DITO: kumpirmahin na may unsubscribe link ang napiling email service provider] | `src/lib/copy/fil.ts:311` | paragraph |
| P19 | Puwede ka ring sumulat sa [ILAGAY DITO: email address para sa mga kahilingan] at hihilingin naming burahin ang email mo. | `src/lib/copy/fil.ts:312` | paragraph |

### 2.8 Ang mga karapatan mo

| ID | Text | Where | Shown when |
|---|---|---|---|
| P20 | Ang mga karapatan mo | `src/lib/copy/fil.ts:316` | section heading |
| P21 | [ILAGAY DITO: para sa abogado: ilagay dito ang mga karapatan ng user ayon sa batas at kung paano ito gagamitin] | `src/lib/copy/fil.ts:317` | paragraph |

### 2.9 Makipag-ugnayan

| ID | Text | Where | Shown when |
|---|---|---|---|
| P22 | Makipag-ugnayan | `src/lib/copy/fil.ts:320` | section heading |
| P23 | [ILAGAY DITO: pangalan ng operator ng site] · [ILAGAY DITO: email address ng contact] | `src/lib/copy/fil.ts:322` | paragraph |

## 3. Browser tab and search results

Text that appears outside the page body.

### 3.1 Titles and description

| ID | Text | Where | Shown when |
|---|---|---|---|
| T01 | Tunay na Interes | `src/lib/copy/fil.ts:82` | tab title, calculator page |
| T02 | Libre. Ilagay ang loan amount, hulog, at bilang ng bayad. Tingnan ang EIR laban sa naka-publish na ceiling sa Pilipinas. | `src/lib/copy/fil.ts:84` | search-result description |
| T03 | Patakaran sa Privacy (DRAFT) · Tunay na Interes | `src/lib/copy/fil.ts:326` | tab title, privacy page while draft |
| T04 | Patakaran sa Privacy · Tunay na Interes | `src/lib/copy/fil.ts:327` | tab title, privacy page once final |

## 4. Error page

Shown only if the app fails. English, unlike the rest of the site.

### 4.1 Error page

| ID | Text | Where | Shown when |
|---|---|---|---|
| E01 | Something went wrong | `src/lib/copy/fil.ts:329` | heading |
| E02 | An unexpected error occurred. Try reloading the page. | `src/lib/copy/fil.ts:330` | message when the error has no text of its own; otherwise the error's own message is shown |

## Not on screen

For completeness: text in the source that a visitor never sees.

| Text | Where | Why it is not shown |
|---|---|---|
| restructuring, repackaging, splitting of loan amounts, recharacterization of fees, shifting of loan tenor, simulated collateral, sham guaranty arrangements, disguised charges | `src/lib/rules.ts:69` | Kept from the circular for later explainer content; nothing renders it. |
| Error codes in /api/subscribe responses ("invalid", "forbidden", …) | `src/lib/subscribe.ts:120` | The form shows only the messages in 1.10. |
| Subject: New peso.credit subscriber. Body: Email: {subscriber's address} / Consented at: {consent time} | `src/lib/subscribe.ts:69` | The email each new subscription sends to the owner's inbox through Resend (DECISIONS N13); only the owner reads it. |
