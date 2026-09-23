/**
 * COPY-REVIEW.md: every on-screen string, verbatim, grouped by screen, with file:line, for
 * independent content review (BUILD-STANDARD point 14; DECISIONS N32).
 *
 * Text comes from the app's own values (constants) or straight from the source (templates,
 * with {…} for the parts that vary), never retyped. Line numbers are looked up. A
 * completeness check lists any on-screen literal in the app source the document does not
 * cover. src/lib/copy-review.test.ts fails if COPY-REVIEW.md is out of date or incomplete.
 *
 *   npm run copy-review     regenerate COPY-REVIEW.md
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import * as copy from "../src/lib/copy.ts";
import { analyzeLoan, FREQUENCY_LABEL, PRESETS, type LoanInput } from "../src/lib/loan-math.ts";
import * as privacy from "../src/lib/privacy-copy.ts";
import { CIRCUMVENTION_EXAMPLES, DAYS_PER_MONTH, SOURCE } from "../src/lib/rules.ts";
import type { Segments } from "../src/lib/segments.ts";
import { COVERAGE_INPUTS, GOLDEN_INPUTS } from "../src/lib/test-utils/loan-fixtures.ts";
import {
  isTestOrGenerated,
  literalsIn,
  sourceFiles,
  srcRoot,
} from "../src/lib/test-utils/source-strings.ts";

const REPO = fileURLToPath(new URL("..", import.meta.url));
export const COPY_REVIEW_PATH = `${REPO}COPY-REVIEW.md`;

type Entry = { id: string; text: string; where: string; when: string };
type Section = { title: string; note?: string; entries: Entry[] };
type Screen = { title: string; intro: string; prefix: string; sections: Section[] };

/** Linked caps as <u>underlined</u> text. */
const render = (segments: Segments) =>
  segments.map((s) => (typeof s === "string" ? s : `<u>${s.cap}</u>`)).join("");

const source = (file: string) => readFileSync(`${REPO}${file}`, "utf8");

/** The 1-based line of the one line in `file` containing `locator`. */
function lineOf(file: string, locator: string): number {
  const hits = source(file)
    .split(/\r?\n/)
    .flatMap((l, i) => (l.includes(locator) ? [i + 1] : []));
  if (hits.length !== 1) throw new Error(`${file}: "${locator}" found on ${hits.length} lines`);
  return hits[0];
}

/**
 * The string, template or JSX text on `line` that the locator points at, verbatim, with
 * variables as {…}. Among the literals covering the line, it takes the one whose text the
 * locator names (so a className on the same line is never picked); none is an error.
 */
function literalAt(file: string, line: number, locator: string): string {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, source(file), ts.ScriptTarget.Latest, true, kind);
  const norm = (s: string) => s.replace(/\$/g, "").replace(/\s+/g, " ").trim();
  const key = norm(locator.replace(/^[^"'`>]*["'`>]/, "").replace(/^["'`>]+/, ""));
  const candidates: string[] = [];
  const visit = (n: ts.Node) => {
    const start = sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
    const end = sf.getLineAndCharacterOfPosition(n.getEnd()).line + 1;
    if (start <= line && line <= end) {
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) candidates.push(n.text);
      else if (ts.isTemplateExpression(n))
        candidates.push(
          n.head.text +
            n.templateSpans.map((s) => `{${s.expression.getText(sf)}}${s.literal.text}`).join(""),
        );
      else if (ts.isJsxText(n) && n.text.trim()) candidates.push(n.text.replace(/\s+/g, " ").trim());
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  const hit = candidates.find((c) => {
    const t = norm(c);
    return t.length > 0 && (key.startsWith(t.slice(0, 12)) || t.startsWith(key.slice(0, 12)));
  });
  if (hit === undefined) {
    throw new Error(`${file}:${line}: no literal matching ${JSON.stringify(locator)} (saw ${JSON.stringify(candidates)})`);
  }
  return hit;
}

/** Readable names for the parts of a template that vary; constants shown as their value. */
const FRIENDLY: Record<string, string> = {
  "{formatPct(n.eirPerMonthSimple)}": "{X%}",
  "{n.tenorDays}": "{Z}",
  "{formatPeso(n.totalPayments)}": "{₱Y}",
  "{DAYS_PER_MONTH}": String(DAYS_PER_MONTH),
  "{formatPeso(n.totalCost)}": "{₱ total cost}",
  "{formatPct(n.totalCostRatio)}": "{% of the amount borrowed}",
  "{input.followUpDay}": "{day}",
};

/** A template from the source (literal words verbatim), located and matched by one locator. */
function tpl(file: string, locator: string): string {
  let text = literalAt(file, lineOf(file, locator), locator).trim();
  for (const [code, name] of Object.entries(FRIENDLY)) text = text.replaceAll(code, name);
  const named = /\{(X%|Z|₱Y|₱ total cost|% of the amount borrowed|day)\}/g;
  if (/\{[\w.()]+\}/.test(text.replace(named, ""))) throw new Error(`unmapped variable in ${text}`);
  return text;
}

function analyzed(input: LoanInput) {
  const a = analyzeLoan(input);
  if (a.status !== "ok") throw new Error(`expected a computed loan, got ${a.status}`);
  return a;
}

/** Literals in the app source that are not copy: attributes, CSS pieces, paths, types. */
const ATTRIBUTES = new Set(["noopener noreferrer", "width=device-width, initial-scale=1"]);
const NOT_COPY = /^(https?:|node:|application\/|image\/|data-|aria-|repeat\(|, minmax\(|width=)|^[\w\-/.:]+$|^\s*[-—·]\s*$/;
const TAILWIND =
  /(^|\s)(-?[a-z]+:)*-?(flex|grid|inline|block|hidden|text|font|leading|tracking|p[xytrbl]?|m[xytrbl]?|w|h|min|max|gap|space|rounded|border|bg|shadow|ring|items|justify|self|col|row|top|left|right|bottom|z|opacity|transition|duration|sr|underline|decoration|outline|size|shrink|grow|overflow|whitespace|break|tabular|sticky|relative|absolute|fixed|inset|order|aspect|cursor|select|pointer|group|peer|focus|hover|disabled|aria|data|fill|stroke|list|divide|place|content|object|italic|uppercase|lowercase|truncate|animate|ease|translate|scale|rotate|antialiased|line|accent|dark)(-[\w/.[\]%#:=&>~()-]+)*(?=\s|$)/;

export function buildCopyReview(): { markdown: string; leftovers: string[]; entries: number } {
  const screens: Screen[] = [];
  const all: Entry[] = [];
  let screen!: Screen;
  let section!: Section;
  const newScreen = (title: string, prefix: string, intro: string) => {
    screen = { title, prefix, intro, sections: [] };
    screens.push(screen);
  };
  const newSection = (title: string, note?: string) => {
    section = { title, note, entries: [] };
    screen.sections.push(section);
  };
  const add = (text: string, file: string, locator: string, when = "") => {
    const n = all.filter((x) => x.id.startsWith(screen.prefix)).length + 1;
    const entry = {
      id: `${screen.prefix}${String(n).padStart(2, "0")}`,
      text,
      where: `${file}:${lineOf(file, locator)}`,
      when,
    };
    section.entries.push(entry);
    all.push(entry);
  };
  /** A string taken verbatim from the source at the line holding `locator`. */
  const lit = (file: string, locator: string, when = "") =>
    add(literalAt(file, lineOf(file, locator), locator), file, locator, when);

  const G2 = analyzed(GOLDEN_INPUTS.G2);
  const C = "src/lib/copy.ts";
  const P = "src/lib/privacy-copy.ts";
  const M = "src/lib/loan-math.ts";
  const CALC = "src/components/calculator.tsx";
  const TL = "src/components/loan-timeline.tsx";

  // -------------------------------------------------------------------------
  newScreen("1. Calculator page (peso.credit/)", "C", "The page a borrower lands on. Top to bottom.");

  newSection("1.1 Page header");
  add(copy.EYEBROW, C, "export const EYEBROW", "always (small caps above the title)");
  lit("src/routes/index.tsx", "          Tunay na Interes", "always (page title)");
  lit("src/routes/index.tsx", "Ilagay ang inutang, ang hulog", "always");

  newSection("1.2 Loan inputs card");
  lit(CALC, "Mga numero ng loan mo", "card title");
  lit(CALC, "Kunin sa disclosure statement", "card description");
  for (const p of PRESETS) {
    lit(M, `label: "${p.label}"`, "quick-fill button, top line");
    lit(M, `hint: "${p.hint}"`, "quick-fill button, second line");
  }
  lit(CALC, 'label="Inutang (principal)"', "field label");
  lit(CALC, "Face amount sa kontrata", "field hint");
  add(copy.FEE_LABEL, C, "export const FEE_LABEL", "field label");
  add(copy.FEE_HINT, C, "export const FEE_HINT", "field hint (fee names come from rules.ts OTHER_FEES_EXAMPLES)");
  lit(CALC, 'label="Hulog bawat bayad"', "field label");
  lit(CALC, "Ang sinusulat sa schedule", "field hint");
  lit(CALC, 'label="Ilang hulog"', "field label");
  lit(CALC, 'label="Unang due (araw)"', "field label");
  lit(CALC, 'hint="7 = due sa ika-7 araw"', "field hint");
  lit(CALC, "<Label>Dalas ng hulog</Label>", "label above the four frequency buttons");
  for (const [key, value] of Object.entries(FREQUENCY_LABEL)) {
    add(value, M, `  ${key}: ${key === "monthly" ? "`Buwanan" : `"${value}"`}`, "frequency button");
  }
  lit(CALC, 'label="Late penalty na siningil (kung meron)"', "field label");
  add(render(copy.PENALTY_HINT), C, "export const PENALTY_HINT", "field hint");
  lit(CALC, "Tala: unang follow-up", "switch label (optional note)");
  lit(CALC, "Opsyonal. Ilagay kung kailan unang tumawag", "switch hint");
  lit(CALC, 'label="Araw ng unang follow-up"', "field label, only when the switch is on");
  lit(CALC, "Saklaw ng ceiling", "small caps heading");
  lit(CALC, 'label="Lending / financing company (hindi bangko)"', "switch");
  lit(CALC, 'label="Unsecured, general-purpose"', "switch");
  lit(CALC, "Petsa ng kontrata / renewal", "date field label");
  add(copy.DATE_HINT, C, "export const DATE_HINT", "date field hint");
  add(copy.NO_STORAGE_NOTE, C, "export const NO_STORAGE_NOTE", "always, directly under the inputs card");

  newSection("1.3 When the numbers cannot be used", "Shown in place of the whole result.");
  const cannotWhen: Record<string, string> = {
    invalid_input: "principal or payment missing, or not a usable number",
    invalid_date: "contract date missing or not a real date",
    fee_not_less_than_principal: "the deducted fee is equal to or more than the amount borrowed",
    payments_below_principal: "the payments add up to less than what was received",
    no_solution: "no rate fits these numbers",
  };
  for (const [key, value] of Object.entries(copy.CANNOT_COMPUTE_TEXT)) {
    if (!cannotWhen[key]) throw new Error(`no description for ${key}`);
    add(value, C, source(C).includes(`  ${key}: "`) ? `  ${key}: "` : `  ${key}:`, cannotWhen[key]);
  }

  newSection("1.4 Result headline");
  add(tpl(C, "return `Ang totoong gastos mo:"), C, "return `Ang totoong gastos mo:", `template; e.g. G2: "${copy.headline(G2.numbers)}"`);
  add(copy.HEADLINE_METHOD_NOTE, C, "export const HEADLINE_METHOD_NOTE", "under the headline");

  newSection("1.5 Comparison with the published ceiling");
  add(copy.OLD_LOAN_NOTICE, C, "export const OLD_LOAN_NOTICE", "instead of this whole card, when the contract is dated before the circular applies");
  add(copy.COMPARISON_TITLE, C, "export const COMPARISON_TITLE", "card title");
  add(`${copy.BASIS_LEAD} <u>${SOURCE.id}</u> · ${copy.BASIS_AS_OF}`, "src/components/source-link.tsx", "{BASIS_LEAD} <SourceLink>", "card subtitle; also at the end of Batayan (1.9)");
  for (const [key, value] of Object.entries(copy.COVERAGE_TEXT)) add(value, C, `  ${key}: "`, `coverage badge: ${key}`);
  const reasonLoc: Record<string, string> = {
    bank: "Ang ceiling ay para sa lending at financing companies",
    secured: "Ang ceiling ay para sa unsecured loans.",
    notGeneralPurpose: "Ang ceiling ay para sa general-purpose loans.",
    principalAboveCoverage: "`Ang principal na ${pesoWhole(input.principal)}",
    tenorNotCovered: "`Ang tenor na ${tenorDays} araw ay lampas sa `",
    tenorMaybeCovered: "`Ang tenor na ${tenorDays} araw ay maaaring pasok pa sa `",
  };
  for (const [name, loc] of Object.entries(reasonLoc)) {
    const start = loc.replace(/^`/, "").split("${")[0];
    const reason = analyzed(COVERAGE_INPUTS[name]).coverage.reasons.find((r) => render(r).startsWith(start));
    if (!reason) throw new Error(`no coverage reason starting "${start}" for ${name}`);
    const varies = loc.includes("${");
    add(render(reason), M, loc, `reason under the coverage badge${varies ? " (example: the number varies)" : ""}`);
  }
  for (const [key, value] of Object.entries(copy.CEILING_LABEL)) add(value, C, `  ${key}: "`, `row label (${key})`);
  for (const [key, value] of Object.entries(copy.STATE_TEXT)) add(value, C, `  ${key}: "`, `row badge: ${key}`);
  add(copy.UNSURE_COVERAGE_BADGE, C, "export const UNSURE_COVERAGE_BADGE", "row badge when the number is over but coverage is uncertain");
  add("Numero mo: {the borrower's figure} · Ceiling: {cap, linked}", "src/components/result.tsx", "Numero mo:", "every row; the cap text is below");
  const capLoc: Record<string, string> = { eir: "EIR_CAP_TEXT =", nominal: "NOMINAL_CAP_TEXT =", totalCost: "TOTAL_COST_CAP_TEXT =" };
  for (const [key, segments] of Object.entries(copy.CEILING_CAP_TEXT)) {
    add(render(segments), "src/lib/limits.ts", capLoc[key], `cap in the ${key} row (links to the circular)`);
  }
  add(copy.GRAY_EIR_TEXT, C, "export const GRAY_EIR_TEXT", "under the EIR row when the EIR is GRAY");
  add(copy.UNSURE_COVERAGE_TEXT, C, "export const UNSURE_COVERAGE_TEXT", "under a row that is over while coverage is uncertain");
  add(copy.DISCLAIMER, C, "export const DISCLAIMER", "always, bottom of the card");

  newSection("1.6 Paano kinuwenta (expander)");
  add(copy.HOW_TITLE, C, "export const HOW_TITLE", "expander title");
  const rowLoc = [
    '"Natanggap mo (net proceeds)"',
    "`Kabuuang babayaran (sa araw",
    '"Kabuuang gastos (interest + fees + penalty)"',
    '"Rate kada araw (EIR)"',
    "`Kada buwan, simple",
    "`Kada buwan, compounded",
    '["Nominal na interes kada buwan"',
  ];
  for (const loc of rowLoc) add(tpl(C, loc), C, loc, "row label; value beside it");
  add(tpl(C, "`${formatPeso(n.totalCost)} · "), C, "`${formatPeso(n.totalCost)} · ", "value of the total-cost row");
  add(copy.HOW_METHOD_TEXT, C, "export const HOW_METHOD_TEXT", "below the rows");

  newSection("1.7 Kalendaryo ng loan");
  lit(CALC, "<CardTitle>Kalendaryo ng loan</CardTitle>", "card title");
  add("{days}-araw na tenor · {number of payments} hulog", CALC, "-araw na tenor ·", "card subtitle");
  lit(TL, '">Araw 0</span>', "loans over 16 days: list, first row");
  add("Natanggap · {₱ received}", TL, "<span>Natanggap ·", "list, first row");
  add("Araw {day}", TL, "Araw {p.day}", "list, one row per payment");
  add("Hulog {n} · {₱ amount}", TL, "Hulog {p.n} ·", "list, one row per payment");
  lit(TL, "<span>Unang follow-up (tala mo)</span>", "list, when a follow-up day is set");
  lit(TL, "              Araw", "loans of 16 days or less: day grid, every cell");
  lit(TL, '? "Pera"', "grid cell, day 0");
  lit(TL, '? "Due"', "grid cell, a due day");
  lit(TL, '? "Follow-up"', "grid cell, the follow-up day");
  lit(TL, "Araw 0 = natanggap ang pera.", "legend under the grid");
  add(tpl(TL, "` Follow-up = araw"), TL, "` Follow-up = araw", "legend, when a follow-up day is set");

  newSection("1.8 Iskedyul");
  lit(CALC, "<CardTitle>Iskedyul</CardTitle>", "card title");
  lit(CALC, 'font-medium">Araw</th>', "column heading");
  lit(CALC, 'font-medium">Bayad</th>', "column heading");
  lit(CALC, ">Release</td>", "first row (day 0)");

  newSection("1.9 Batayan", "Terms in bold; linked text underlined.");
  add(copy.LEGAL_FOOT_TITLE, C, "export const LEGAL_FOOT_TITLE", "card title");
  const footLoc = [
    "    term: SOURCE.id,",
    '    term: "Mga ceiling",',
    '    term: "Hindi sinusuri ng tool na ito",',
    '    term: "RA No. 3765 (Truth in Lending Act)",',
  ];
  copy.LEGAL_FOOT.forEach((item, i) => {
    const term = item.termIsSource ? `<u>${item.term}</u>` : item.term;
    add(`**${term}** ${render(item.segments)}`, C, footLoc[i], "paragraph");
  });

  newSection("1.10 Email form", "Only when EMAIL_CAPTURE_URL is set; always below the whole result.");
  add(copy.EMAIL_HEADING, C, "export const EMAIL_HEADING", "card title");
  add(copy.EMAIL_NOTE, C, "export const EMAIL_NOTE", "card description");
  add(copy.EMAIL_LABEL, C, "export const EMAIL_LABEL", "field label");
  add(`${copy.CONSENT_BEFORE}<u>${privacy.PRIVACY_LINK_LABEL}</u>${copy.CONSENT_AFTER}`, C, "export const CONSENT_BEFORE", "consent checkbox label; the link opens /privacy (text from privacy-copy.ts PRIVACY_LINK_LABEL)");
  add(copy.EMAIL_SUBMIT, C, "export const EMAIL_SUBMIT", "button");
  add(copy.EMAIL_SENDING, C, "export const EMAIL_SENDING", "button, while sending");
  add(copy.EMAIL_DONE, C, "export const EMAIL_DONE", "replaces the form after success");
  add(copy.EMAIL_FAILED, C, "export const EMAIL_FAILED", "beside the button after a failure");

  newSection("1.11 Guide link", "Only when GUIDE_URL is set.");
  add(copy.GUIDE_TITLE, C, "export const GUIDE_TITLE", "card text");
  add(copy.GUIDE_LINK_LABEL, C, "export const GUIDE_LINK_LABEL", "link");

  newSection("1.12 Footer");
  add(privacy.PRIVACY_LINK_LABEL, P, "export const PRIVACY_LINK_LABEL", "link to /privacy, new tab");

  // -------------------------------------------------------------------------
  newScreen("2. Privacy page (peso.credit/privacy)", "P", "Marked DRAFT for lawyer review (N17). `[ILAGAY DITO: …]` blanks are shown highlighted on the page, exactly as below.");
  newSection("2.1 Top of page");
  add(privacy.BACK_TO_CALCULATOR, P, "export const BACK_TO_CALCULATOR", "link back to /");
  add(privacy.PRIVACY_TITLE, P, "export const PRIVACY_TITLE", "page title");
  add(privacy.DRAFT_BANNER, P, "export const DRAFT_BANNER", "banner, only while PRIVACY_STATUS is draft");
  for (const s of privacy.PRIVACY_SECTIONS) {
    newSection(`2.${screen.sections.length + 1} ${s.heading}`);
    add(s.heading, P, `heading: "${s.heading}"`, "section heading");
    for (const para of s.paragraphs) {
      // Located by the paragraph's first words as written in the source.
      const words = para.startsWith(copy.NO_STORAGE_NOTE)
        ? "`${NO_STORAGE_NOTE} "
        : para.startsWith(privacy.PLACEHOLDER_OPEN)
          ? `placeholder("${para.slice(privacy.PLACEHOLDER_OPEN.length + 1, 40)}`
          : para.split(privacy.PLACEHOLDER_OPEN)[0].slice(0, 30);
      add(para, P, words, "paragraph");
    }
  }

  // -------------------------------------------------------------------------
  newScreen("3. Browser tab and search results", "T", "Text that appears outside the page body.");
  newSection("3.1 Titles and description");
  lit("src/routes/__root.tsx", 'const APP_NAME = "Tunay na Interes"', "tab title, calculator page");
  lit("src/routes/__root.tsx", "Libre. Ilagay ang loan amount", "search-result description");
  const titleOf = (status: privacy.PrivacyStatus) => {
    const title = privacy.privacyHeadMeta(status).find((m) => m.title !== undefined)?.title;
    if (!title) throw new Error(`no title for a ${status} privacy page`);
    return title;
  };
  add(titleOf("draft"), P, ": [{ title: `${PRIVACY_TITLE} (DRAFT) · Tunay na Interes` }", "tab title, privacy page while draft");
  add(titleOf("final"), P, "? [{ title: `${PRIVACY_TITLE} · Tunay na Interes` }]", "tab title, privacy page once final");

  // -------------------------------------------------------------------------
  newScreen("4. Error page", "E", "Shown only if the app fails. English, unlike the rest of the site.");
  newSection("4.1 Error page");
  lit("src/lib/error-component.tsx", "Something went wrong", "heading");
  lit("src/lib/error-component.tsx", '"An unexpected error occurred', "message when the error has no text of its own; otherwise the error's own message is shown");

  // -------------------------------------------------------------------------
  // Completeness: every on-screen literal in the app source must be inside some entry.
  const esc = (s: string) => s.replace(/\s+/g, " ").trim();
  const covered = esc(
    [...all.map((e) => e.text.replace(/<\/?u>|\*\*/g, "")), ...CIRCUMVENTION_EXAMPLES].join(" \n "),
  );
  const root = srcRoot();
  const files = sourceFiles(root, (p) => isTestOrGenerated(p) || ["lib/banned.ts", "lib/signoff.ts"].includes(p));
  const leftovers: string[] = [];
  for (const file of files) {
    for (const l of literalsIn(file, readFileSync(`${root}/${file}`, "utf8"))) {
      if (l.kind !== "string") continue;
      const t = esc(l.text);
      if (!/\p{L}/u.test(t) || NOT_COPY.test(t) || ATTRIBUTES.has(t) || /^[@.#/]/.test(t)) continue;
      const words = t.split(" ");
      if (words.filter((w) => TAILWIND.test(w)).length >= words.length / 2) continue;
      if (!covered.includes(t)) leftovers.push(`${file}:${l.line} ${JSON.stringify(t).slice(0, 110)}`);
    }
  }

  // -------------------------------------------------------------------------
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  let md = `# COPY-REVIEW — peso.credit

Every string a visitor can see, verbatim, grouped by screen, for independent content review
(BUILD-STANDARD point 14; DECISIONS N32). Reviewers need nothing else to read it cold.

- **Generated from the source by \`tools/copy-review.ts\`.** Text is taken from the app's own
  values or straight from the source, never retyped; line numbers are looked up. \`npm test\`
  fails if this file is out of date or leaves out an on-screen string.
- **Nothing here is a proposal.** No copy was rewritten for this document.
- \`{…}\` marks a part that varies (a number, a date, the borrower's own figure). Where it helps,
  an example follows in the "Shown when" column.
- <u>Underlined</u> text is a link to the SEC circular (${SOURCE.id}). **Bold** is bold on screen.
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

This review is what Napoleon signs on (SIGNOFF.json, \`reviewedBy\`). What each signature covers:
\`verdict-wording\` is sections 1.3–1.5 except C65; \`privacy-page\` is section 2 except P03 (the
DRAFT banner goes when the page is signed); \`cap-values\` is the numbers inside the underlined
caps, checked against the circular itself rather than in this review.

`;
  for (const s of screens) {
    md += `## ${s.title}\n\n${s.intro}\n\n`;
    for (const sec of s.sections) {
      md += `### ${sec.title}\n\n${sec.note ? `${sec.note}\n\n` : ""}| ID | Text | Where | Shown when |\n|---|---|---|---|\n`;
      for (const e of sec.entries) md += `| ${e.id} | ${cell(e.text)} | \`${e.where}\` | ${cell(e.when)} |\n`;
      md += "\n";
    }
  }
  md += `## Not on screen

For completeness: text in the source that a visitor never sees.

| Text | Where | Why it is not shown |
|---|---|---|
| ${cell(CIRCUMVENTION_EXAMPLES.join(", "))} | \`src/lib/rules.ts:${lineOf("src/lib/rules.ts", "export const CIRCUMVENTION_EXAMPLES")}\` | Kept from the circular for later explainer content; nothing renders it. |
| Error codes in /api/subscribe responses ("invalid", "forbidden", …) | \`src/lib/subscribe.ts:${lineOf("src/lib/subscribe.ts", "function reply(")}\` | The form shows only the messages in 1.10. |
`;
  return { markdown: md, leftovers, entries: all.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { markdown, leftovers, entries } = buildCopyReview();
  if (leftovers.length > 0) {
    console.error(`Not covered by tools/copy-review.ts (add them):\n- ${leftovers.join("\n- ")}`);
    process.exit(1);
  }
  writeFileSync(COPY_REVIEW_PATH, markdown, "utf8");
  console.log(`COPY-REVIEW.md written: ${entries} entries, every on-screen string covered.`);
}
