/**
 * COPY-REVIEW.md: every on-screen string, verbatim, grouped by screen, with file:line, for
 * independent content review (BUILD-STANDARD point 14; DECISIONS N32).
 *
 * Every word on screen lives in one language file under src/lib/copy/ (DECISIONS N34), and
 * src/lib/copy.ts chooses the one shown. Text comes from that live `copy`, or for a
 * template, straight from the language file's source with {…} for the parts that vary; it
 * is never retyped. Entries are found by field name, not by their words, so the tool works
 * for any language, and line numbers are looked up. A completeness check lists any
 * on-screen literal in the app source the document does not cover. src/lib/copy-review.test.ts
 * fails if COPY-REVIEW.md is out of date or incomplete, or if on-screen words live outside
 * src/lib/copy/.
 *
 *   npm run copy-review     regenerate COPY-REVIEW.md
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { copy, headlineText, PENALTY_ROW_INDEX } from "../src/lib/copy.ts";
import { analyzeLoan, PRESETS, type LoanInput } from "../src/lib/loan-math.ts";
import * as privacy from "../src/lib/privacy-copy.ts";
import { CIRCUMVENTION_EXAMPLES, DAYS_PER_MONTH, SOURCE } from "../src/lib/rules.ts";
import { notifyEmail } from "../src/lib/subscribe.ts";
import type { Segments } from "../src/lib/segments.ts";
import { COVERAGE_INPUTS, GOLDEN_INPUTS } from "../src/lib/test-utils/loan-fixtures.ts";
import {
  isTestOrGenerated,
  type Literal,
  literalsIn,
  sourceFiles,
  srcRoot,
} from "../src/lib/test-utils/source-strings.ts";

const REPO = fileURLToPath(new URL("..", import.meta.url));
export const COPY_REVIEW_PATH = `${REPO}COPY-REVIEW.md`;
const COPY_DIR = "src/lib/copy/";

type Entry = { id: string; text: string; where: string; when: string };
type Section = { title: string; note?: string; entries: Entry[] };
type Screen = { title: string; intro: string; prefix: string; sections: Section[] };

/** What reviewers are told about each language, by its <html lang> code. */
const LANGUAGES: Record<string, { name: string; reviewNote: string; errorNote: string }> = {
  en: {
    name: "English",
    reviewNote:
      "The site is in English, written first for people already struggling with online-lending-app\ndebt (DECISIONS N36): calm, plain, short sentences; no shame or blame; no false hope; no advice;\nno accusation. The brand, “Tunay na Interes”, stays Filipino, and the fee names are the\ncircular's own words. Read it as a borrower would.",
    errorNote: "",
  },
  fil: {
    name: "Filipino",
    reviewNote:
      "Most of the site is in Filipino; a few terms are English on purpose (EIR, principal, fee names\nfrom the circular). Read it as a borrower would.",
    errorNote: " English, unlike the rest of the site.",
  },
};

/** Linked caps as <u>underlined</u> text. */
const render = (segments: Segments) =>
  segments.map((s) => (typeof s === "string" ? s : `<u>${s.cap}</u>`)).join("");

const source = (file: string) => readFileSync(`${REPO}${file}`, "utf8");

function parse(file: string): ts.SourceFile {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, source(file), ts.ScriptTarget.Latest, true, kind);
}

/** The 1-based line of the one line in `file` containing `locator`. */
function lineOf(file: string, locator: string): number {
  const hits = source(file)
    .split(/\r?\n/)
    .flatMap((l, i) => (l.includes(locator) ? [i + 1] : []));
  if (hits.length !== 1) throw new Error(`${file}: "${locator}" found on ${hits.length} lines`);
  return hits[0];
}

/** The language file src/lib/copy.ts shows (e.g. src/lib/copy/fil.ts) and its export's name. */
function activeLanguage(): { file: string; name: string } {
  const sf = parse("src/lib/copy.ts");
  const importedFrom = new Map<string, string>();
  let name: string | undefined;
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && ts.isStringLiteral(st.moduleSpecifier)) {
      const bindings = st.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const el of bindings.elements) importedFrom.set(el.name.text, st.moduleSpecifier.text);
      }
    }
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.name.text === "copy" && d.initializer && ts.isIdentifier(d.initializer)) {
          name = d.initializer.text;
        }
      }
    }
  }
  const from = name === undefined ? undefined : importedFrom.get(name);
  if (name === undefined || from === undefined) {
    throw new Error("src/lib/copy.ts must set `copy` to one language imported from ./copy/");
  }
  return { file: `src/lib/${from.replace(/^\.\//, "")}`, name };
}

/** Strips what never changes a value: parentheses, `as` and `satisfies`. */
function bare(node: ts.Node): ts.Node {
  let n = node;
  while (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isSatisfiesExpression(n)) {
    n = n.expression;
  }
  return n;
}

/**
 * A step into the language object: a field name, an array index, "=>" for what a function
 * returns, or "case x" for what its switch returns for "x".
 */
type Step = string | number;

/** Finds text in a language file by field path, e.g. place("presets", "7d", "label"). */
function languageFile(file: string, exportName: string) {
  const sf = parse(file);
  const declared = (name: string): ts.Node | undefined => {
    for (const st of sf.statements) {
      if (ts.isFunctionDeclaration(st) && st.name?.text === name) return st;
      if (ts.isVariableStatement(st)) {
        for (const d of st.declarationList.declarations) {
          if (ts.isIdentifier(d.name) && d.name.text === name) return d.initializer;
        }
      }
    }
    return undefined;
  };
  /** Follows a local name to what it stands for. */
  const resolve = (node: ts.Node): ts.Node => {
    let n = bare(node);
    while (ts.isIdentifier(n)) {
      const d = declared(n.text);
      if (d === undefined) break;
      n = bare(d);
    }
    return n;
  };
  const step = (node: ts.Node, s: Step): ts.Node | undefined => {
    const n = resolve(node);
    if (s === "=>") {
      const body = ts.isArrowFunction(n) || ts.isFunctionDeclaration(n) ? n.body : undefined;
      if (body === undefined || !ts.isBlock(body)) return body;
      return body.statements.find(ts.isReturnStatement)?.expression;
    }
    if (typeof s === "string" && s.startsWith("case ")) {
      let found: ts.Node | undefined;
      const visit = (x: ts.Node): void => {
        if (ts.isCaseClause(x) && ts.isStringLiteral(x.expression) && x.expression.text === s.slice(5)) {
          found = x.statements.find(ts.isReturnStatement)?.expression;
        }
        if (found === undefined) ts.forEachChild(x, visit);
      };
      visit(n);
      return found;
    }
    if (typeof s === "number") return ts.isArrayLiteralExpression(n) ? n.elements[s] : undefined;
    if (!ts.isObjectLiteralExpression(n)) return undefined;
    for (const p of n.properties) {
      const key = p.name && !ts.isComputedPropertyName(p.name) && !ts.isPrivateIdentifier(p.name) ? p.name.text : undefined;
      if (key !== s) continue;
      if (ts.isPropertyAssignment(p)) return p.initializer;
      if (ts.isShorthandPropertyAssignment(p)) return p.name;
    }
    return undefined;
  };
  const root = declared(exportName);
  if (root === undefined) throw new Error(`${file}: no ${exportName}`);
  const nodeAt = (path: Step[]): ts.Node => {
    let node = root;
    for (const s of path) {
      const next = step(node, s);
      if (next === undefined) throw new Error(`${file}: no ${path.join(" / ")} (stopped at ${String(s)})`);
      node = next;
    }
    return resolve(node);
  };
  return {
    /** "file:line" of the text at `path`. */
    place: (...path: Step[]) =>
      `${file}:${sf.getLineAndCharacterOfPosition(nodeAt(path).getStart(sf)).line + 1}`,
    /** The string or template at `path` as written: words verbatim, varying parts as {code}. */
    written: (...path: Step[]): string => {
      const n = nodeAt(path);
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
      if (!ts.isTemplateExpression(n)) throw new Error(`${file}: ${path.join(" / ")} is not a string or template`);
      return n.head.text + n.templateSpans.map((s) => `{${s.expression.getText(sf)}}${s.literal.text}`).join("");
    },
    /** Whether the value at `path` is a template with words of its own. */
    isWordedTemplate: (...path: Step[]) => {
      const n = nodeAt(path);
      return ts.isTemplateExpression(n) && /\p{L}/u.test(n.head.text + n.templateSpans.map((s) => s.literal.text).join(""));
    },
    /** How many elements the array at `path` has. */
    length: (...path: Step[]) => {
      const n = nodeAt(path);
      if (!ts.isArrayLiteralExpression(n)) throw new Error(`${file}: ${path.join(" / ")} is not an array`);
      return n.elements.length;
    },
  };
}

/** Readable names for the parts of a template that vary; constants shown as their value. */
const FRIENDLY: Record<string, string> = {
  "{formatPct(n.eirPerMonthSimple)}": "{X%}",
  "{n.tenorDays}": "{Z}",
  "{formatPeso(n.totalPayments)}": "{₱Y}",
  "{formatPeso(n.scheduledPayments)}": "{₱Y}",
  "{DAYS_PER_MONTH}": String(DAYS_PER_MONTH),
  "{formatPeso(n.totalCost)}": "{₱ total cost}",
  "{formatPct(n.totalCostRatio)}": "{%}",
};

/** A template as written, with each varying part given its readable name. */
function friendly(written: string): string {
  let text = written.trim();
  for (const [code, name] of Object.entries(FRIENDLY)) text = text.replaceAll(code, name);
  const named = /\{(X%|Z|₱Y|₱ total cost|%)\}/g;
  if (/\{[^}]+\}/.test(text.replace(named, ""))) throw new Error(`unmapped variable in ${text}`);
  return text;
}

/**
 * A stand-in for a number a template only prints, such as {day}. The templates that take
 * one are run with it, so the words are exactly what the app shows.
 */
const varies = (name: string) => `{${name}}` as unknown as number;

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

const squash = (s: string) => s.replace(/\s+/g, " ").trim();

/** Language files other than the one on screen, relative to the repo (kept for later, N34). */
function inactiveLanguageFiles(active: string): string[] {
  return readdirSync(`${REPO}${COPY_DIR}`)
    .filter((f) => f.endsWith(".ts") && f !== "types.ts")
    .map((f) => `${COPY_DIR}${f}`)
    .filter((f) => f !== active)
    .sort();
}

/**
 * Every literal in the app source that reads as words a visitor could see: the strings,
 * template pieces and JSX text left after attributes, class names, paths and single tokens
 * are set aside. Language files kept for later are not on screen, so they are left out.
 */
export function wordLiterals(): Literal[] {
  const root = srcRoot();
  const inactive = inactiveLanguageFiles(activeLanguage().file).map((f) => f.replace(/^src\//, ""));
  const skip = (p: string) =>
    isTestOrGenerated(p) || ["lib/banned.ts", "lib/signoff.ts", ...inactive].includes(p);
  return sourceFiles(root, skip).flatMap((file) =>
    literalsIn(file, readFileSync(`${root}/${file}`, "utf8")).filter((l) => {
      if (l.kind !== "string") return false;
      const t = squash(l.text);
      if (!/\p{L}/u.test(t) || NOT_COPY.test(t) || ATTRIBUTES.has(t) || /^[@.#/]/.test(t)) return false;
      // A lone email address is not words: CONTACT_EMAIL, which privacy.test.ts keeps the only one.
      if (/^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/.test(t)) return false;
      const words = t.split(" ");
      return words.filter((w) => TAILWIND.test(w)).length < words.length / 2;
    }),
  );
}

/**
 * Files outside src/lib/copy/ that may hold words, and why: the circular's own terms, cited
 * as published, and the one email only the owner reads.
 */
export const WORDS_OUTSIDE_COPY: Record<string, string> = {
  "lib/rules.ts": "the circular's own terms (source id, fee and circumvention examples), cited as published",
  "lib/subscribe.ts": "the email /api/subscribe sends to the owner's inbox; never on screen",
};

/** JSX attributes whose text a visitor sees or hears. */
const TEXT_ATTRIBUTES = /^(label|hint|placeholder|title|alt|aria-label|aria-description|aria-valuetext|description)$/;

/**
 * Words a component writes itself, even a single word: JSX text, and text attributes given
 * as a literal. wordLiterals() sets single tokens aside, so this catches "Due" or "Araw".
 */
export function wordsInComponents(): string[] {
  const root = srcRoot();
  return sourceFiles(root, (p) => isTestOrGenerated(p) || !p.endsWith(".tsx")).flatMap((file) => {
    const sf = ts.createSourceFile(file, readFileSync(`${root}/${file}`, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const found: string[] = [];
    const visit = (n: ts.Node): void => {
      const line = () => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
      if (ts.isJsxText(n) && /\p{L}/u.test(n.text)) found.push(`${file}:${line()} ${JSON.stringify(squash(n.text))}`);
      if (
        ts.isJsxAttribute(n) &&
        TEXT_ATTRIBUTES.test(n.name.getText(sf)) &&
        n.initializer &&
        ts.isStringLiteral(n.initializer) &&
        /\p{L}/u.test(n.initializer.text)
      ) {
        found.push(`${file}:${line()} ${n.name.getText(sf)}=${JSON.stringify(n.initializer.text)}`);
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
    return found;
  });
}

export function buildCopyReview(): { markdown: string; leftovers: string[]; entries: number } {
  const active = activeLanguage();
  const language = LANGUAGES[copy.htmlLang];
  if (language === undefined) throw new Error(`tools/copy-review.ts: describe language "${copy.htmlLang}" in LANGUAGES`);
  const L = languageFile(active.file, active.name);
  const at = L.place;

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
  // IDs never change once reviewers can cite them: entries are numbered in order, and a line
  // added later is given the next free number of its screen, wherever it sits.
  const numbered: Record<string, number> = {};
  const add = (text: string, where: string, when = "", addedLater?: string) => {
    const n = (numbered[screen.prefix] = (numbered[screen.prefix] ?? 0) + (addedLater ? 0 : 1));
    const id = addedLater ?? `${screen.prefix}${String(n).padStart(2, "0")}`;
    const entry = { id, text, where, when };
    section.entries.push(entry);
    all.push(entry);
  };

  const G2 = analyzed(GOLDEN_INPUTS.G2);
  const G7 = analyzed(GOLDEN_INPUTS.G7);

  // -------------------------------------------------------------------------
  newScreen("1. Calculator page (peso.credit/)", "C", "The page a borrower lands on. Top to bottom.");

  newSection("1.1 Page header");
  add(copy.eyebrow, at("eyebrow"), "always (small caps above the title)");
  add(copy.pageTitle, at("pageTitle"), "always (page title)");
  add(copy.pageIntro, at("pageIntro"), "always");

  newSection("1.2 Loan inputs card");
  add(copy.inputsTitle, at("inputsTitle"), "card title");
  add(copy.inputsDescription, at("inputsDescription"), "card description");
  for (const { id } of PRESETS) {
    add(copy.presets[id].label, at("presets", id, "label"), "quick-fill button, top line");
    add(copy.presets[id].hint, at("presets", id, "hint"), "quick-fill button, second line");
  }
  add(copy.principalLabel, at("principalLabel"), "field label");
  add(copy.principalHint, at("principalHint"), "field hint");
  add(copy.feeLabel, at("feeLabel"), "field label");
  add(copy.feeHint, at("feeHint"), "field hint (fee names come from rules.ts OTHER_FEES_EXAMPLES)");
  add(copy.paymentLabel, at("paymentLabel"), "field label");
  add(copy.paymentHint, at("paymentHint"), "field hint");
  add(copy.countLabel, at("countLabel"), "field label");
  add(copy.firstDueLabel, at("firstDueLabel"), "field label");
  add(copy.firstDueHint, at("firstDueHint"), "field hint");
  add(copy.frequencyHeading, at("frequencyHeading"), "label above the four frequency buttons");
  for (const [key, value] of Object.entries(copy.frequency)) add(value, at("frequency", key), "frequency button");
  add(copy.penaltyLabel, at("penaltyLabel"), "field label");
  add(render(copy.penaltyHint), at("penaltyHint"), "field hint");
  add(copy.followUpLabel, at("followUpLabel"), "switch label (optional note)");
  add(copy.followUpHint, at("followUpHint"), "switch hint");
  add(copy.followUpDayLabel, at("followUpDayLabel"), "field label, only when the switch is on");
  add(copy.coverageHeading, at("coverageHeading"), "small caps heading");
  add(copy.lenderToggle, at("lenderToggle"), "switch");
  add(copy.unsecuredToggle, at("unsecuredToggle"), "switch");
  add(copy.dateLabel, at("dateLabel"), "date field label");
  add(copy.dateHint, at("dateHint"), "date field hint");
  add(copy.noStorageNote, at("noStorageNote"), "always, directly under the inputs card");

  newSection("1.3 When the numbers cannot be used", "Shown in place of the whole result.");
  const cannotWhen: Record<string, string> = {
    invalid_input: "principal or payment missing, or not a usable number",
    invalid_date: "contract date missing or not a real date",
    fee_not_less_than_principal: "the deducted fee is equal to or more than the amount borrowed",
    payments_below_principal: "the payments add up to less than what was received",
    no_solution: "no rate fits these numbers",
  };
  for (const [key, value] of Object.entries(copy.cannotCompute)) {
    if (!cannotWhen[key]) throw new Error(`no description for ${key}`);
    add(value, at("cannotCompute", key), cannotWhen[key]);
  }

  newSection("1.4 Result headline");
  add(
    friendly(L.written("headline", "=>")),
    at("headline", "=>"),
    `template; e.g. G2: "${headlineText(G2.numbers)}"; with a late penalty, G7: "${headlineText(G7.numbers)}"`,
  );
  if (copy.penaltySentence) {
    add(copy.penaltySentence("{₱P}"), at("penaltySentence"), "added to the headline only when a late penalty is entered (N41)", "C116");
  }
  add(copy.headlineMethodNote, at("headlineMethodNote"), "under the headline");

  newSection("1.5 Comparison with the published limit");
  add(copy.oldLoanNotice, at("oldLoanNotice"), "instead of this whole card, when the contract is dated before the circular applies");
  add(copy.comparisonTitle, at("comparisonTitle"), "card title");
  const basis = "src/components/source-link.tsx";
  add(
    `${copy.basisLead} <u>${SOURCE.id}</u> · ${copy.basisAsOf}`,
    `${basis}:${lineOf(basis, "{copy.basisLead} <SourceLink>")}`,
    `card subtitle; also at the end of ${copy.legalFootTitle} (1.9)`,
  );
  for (const [key, value] of Object.entries(copy.coverageText)) add(value, at("coverageText", key), `coverage badge: ${key}`);
  // One loan per reason, from the coverage fixtures: a reason that holds a number shows it.
  const reasonLoan: Record<string, string> = {
    lender: "bank",
    secured: "secured",
    purpose: "notGeneralPurpose",
    principal: "principalAboveCoverage",
    tenorOver: "tenorNotCovered",
    tenorMaybe: "tenorMaybeCovered",
  };
  for (const [kind, loan] of Object.entries(reasonLoan)) {
    const reason = analyzed(COVERAGE_INPUTS[loan]).coverage.reasons.find((r) => r.kind === kind);
    if (!reason) throw new Error(`no "${kind}" coverage reason for ${loan}`);
    const example = Object.keys(reason).length > 1 ? " (example: the number varies)" : "";
    add(render(copy.coverageReason(reason)), at("coverageReason", `case ${kind}`), `reason under the coverage badge${example}`);
  }
  for (const [key, value] of Object.entries(copy.ceilingLabel)) add(value, at("ceilingLabel", key), `row label (${key})`);
  for (const [key, value] of Object.entries(copy.stateText)) add(value, at("stateText", key), `row badge: ${key}`);
  add(copy.unsureCoverageBadge, at("unsureCoverageBadge"), "row badge when the number is over but coverage is uncertain");
  add(
    `${copy.rowNumberLabel} {the borrower's figure} · ${copy.rowCeilingLabel} {cap, linked}`,
    at("rowNumberLabel"),
    "every row; the cap text is below (words from rowNumberLabel and rowCeilingLabel)",
  );
  for (const [key, segments] of Object.entries(copy.ceilingCapText)) {
    add(render(segments), at("ceilingCapText", key), `cap in the ${key} row (links to the circular)`);
  }
  add(copy.grayEirText, at("grayEirText"), "under the EIR row when the EIR is GRAY");
  add(copy.unsureCoverageText, at("unsureCoverageText"), "under a row that is over while coverage is uncertain");
  if (copy.nominalNote !== null) {
    add(copy.nominalNote, at("nominalNote"), "under the nominal row, always; that row shows no verdict (N42)", "C118");
  }
  if (copy.comparisonNote !== null) {
    add(copy.comparisonNote, at("comparisonNote"), "directly under the rows, whenever they are shown, in normal-size text (added in step F3)", "C115");
  }
  add(copy.disclaimer, at("disclaimer"), "always, bottom of the card");

  newSection(`1.6 ${copy.howTitle} (expander)`);
  add(copy.howTitle, at("howTitle"), "expander title");
  const rows = L.length("howComputedRows", "=>");
  for (let i = 0; i < rows; i++) {
    add(friendly(L.written("howComputedRows", "=>", i, 0)), at("howComputedRows", "=>", i, 0), "row label; value beside it");
    if (i === PENALTY_ROW_INDEX - 1 && copy.penaltyRowLabel) {
      add(copy.penaltyRowLabel, at("penaltyRowLabel"), "row label, only when a late penalty is entered (N41); the penalty beside it", "C117");
    }
  }
  // Values are numbers; a value with words of its own is listed too.
  const valueWhen: Record<number, string> = { 2: "value of the total-cost row" };
  for (let i = 0; i < rows; i++) {
    if (!L.isWordedTemplate("howComputedRows", "=>", i, 1)) continue;
    if (!valueWhen[i]) throw new Error(`describe the value of row ${i} of howComputedRows`);
    add(friendly(L.written("howComputedRows", "=>", i, 1)), at("howComputedRows", "=>", i, 1), valueWhen[i]);
  }
  add(copy.howMethodText, at("howMethodText"), "below the rows");

  newSection(`1.7 ${copy.calendarTitle}`);
  add(copy.calendarTitle, at("calendarTitle"), "card title");
  // A language may word one payment differently ("1 payment"); then the review shows it too.
  const subtitle = copy.calendarSubtitle(varies("days"), varies("number of payments"));
  const onePayment = copy.calendarSubtitle(varies("days"), 1);
  const singular = onePayment === subtitle.replace("{number of payments}", "1") ? "" : `; with one payment: "${onePayment}"`;
  add(subtitle, at("calendarSubtitle"), `card subtitle${singular}`);
  add(copy.timelineDay0, at("timelineDay0"), "loans over 16 days: list, first row");
  add(copy.timelineReceived("{₱ received}"), at("timelineReceived"), "list, first row");
  add(copy.timelineDay(varies("day")), at("timelineDay"), "list, one row per payment");
  add(copy.timelinePayment(varies("n"), "{₱ amount}"), at("timelinePayment"), "list, one row per payment");
  add(copy.timelineFollowUp, at("timelineFollowUp"), "list, when a follow-up day is set");
  add(copy.timelineDayCell, at("timelineDayCell"), "loans of 16 days or less: day grid, every cell");
  add(copy.timelineCellReceived, at("timelineCellReceived"), "grid cell, day 0");
  add(copy.timelineCellDue, at("timelineCellDue"), "grid cell, a due day");
  add(copy.timelineCellFollowUp, at("timelineCellFollowUp"), "grid cell, the follow-up day");
  add(copy.timelineLegend, at("timelineLegend"), "legend under the grid");
  add(copy.timelineLegendFollowUp(varies("day")).trim(), at("timelineLegendFollowUp"), "legend, when a follow-up day is set");

  newSection(`1.8 ${copy.scheduleTitle}`);
  add(copy.scheduleTitle, at("scheduleTitle"), "card title");
  add(copy.scheduleDay, at("scheduleDay"), "column heading");
  add(copy.schedulePayment, at("schedulePayment"), "column heading");
  add(copy.scheduleRelease, at("scheduleRelease"), "first row (day 0)");

  newSection(`1.9 ${copy.legalFootTitle}`, "Terms in bold; linked text underlined.");
  add(copy.legalFootTitle, at("legalFootTitle"), "card title");
  copy.legalFoot.forEach((item, i) => {
    const term = item.termIsSource ? `<u>${item.term}</u>` : item.term;
    add(`**${term}** ${render(item.segments)}`, at("legalFoot", i, "term"), "paragraph");
  });

  newSection("1.10 Email form", "Only under the full privacy page, once final (PRIVACY_VERSION, PRIVACY_STATUS; N45), and only when the Resend settings are set (RESEND_API_KEY, SUBSCRIBE_NOTIFY_TO, SUBSCRIBE_FROM); always below the whole result. Off while the v1 page is live.");
  add(copy.emailHeading, at("emailHeading"), "card title");
  add(copy.emailNote, at("emailNote"), "card description");
  add(copy.emailLabel, at("emailLabel"), "field label");
  add(`${copy.consentBefore}<u>${copy.privacyLinkLabel}</u>${copy.consentAfter}`, at("consentBefore"), "consent checkbox label; the link opens /privacy (link text from privacyLinkLabel)");
  add(copy.emailSubmit, at("emailSubmit"), "button");
  add(copy.emailSending, at("emailSending"), "button, while sending");
  add(copy.emailDone, at("emailDone"), "replaces the form after success");
  add(copy.emailFailed, at("emailFailed"), "beside the button after a failure");

  newSection("1.11 Guide link", "Only when GUIDE_URL is set.");
  add(copy.guideTitle, at("guideTitle"), "card text");
  add(copy.guideLinkLabel, at("guideLinkLabel"), "link");

  newSection("1.12 Footer");
  add(copy.privacyLinkLabel, at("privacyLinkLabel"), "link to /privacy, new tab");

  // -------------------------------------------------------------------------
  // The privacy page has two versions (PRIVACY_VERSION). The full page (N17) was reviewed as
  // P01–P23 and keeps those IDs. The v1 page (N45) reuses an ID wherever its text is the same,
  // and its new lines take the next free numbers, in page order. The live version is listed
  // first; the other follows, not on screen, without the lines it shares with the live one.
  type PageLine = { text: string; where: string; when: string };
  type PagePart = { title: string; lines: PageLine[] };
  const pageTop: PageLine[] = [
    { text: copy.backToCalculator, where: at("backToCalculator"), when: "link back to /" },
    { text: copy.privacyTitle, where: at("privacyTitle"), when: "page title" },
    { text: copy.privacyDraftBanner, where: at("privacyDraftBanner"), when: "banner, only while PRIVACY_STATUS is draft" },
  ];
  const partsOf = (sections: privacy.PrivacySection[], path: Step[]): PagePart[] =>
    sections.map((s, i) => ({
      title: s.heading,
      lines: [
        { text: s.heading, where: at(...path, i, "heading"), when: "section heading" },
        ...s.paragraphs.map((p, j) => ({ text: p, where: at(...path, i, "paragraphs", j), when: "paragraph" })),
      ],
    }));
  const fullParts = partsOf(privacy.PRIVACY_FULL_SECTIONS, ["privacySections", "=>"]);
  const v1Copy = copy.privacyV1;
  const v1Top: PageLine[] = v1Copy
    ? [{ text: v1Copy.lastUpdated(privacy.PRIVACY_V1_UPDATED), where: at("privacyV1", "lastUpdated"), when: "under the title (v1 only)" }]
    : [];
  const v1Parts = v1Copy ? partsOf(v1Copy.sections(privacy.CONTACT_EMAIL), ["privacyV1", "sections", "=>"]) : [];
  const pageId = new Map<string, string>();
  let pageNumber = 0;
  const number = (lines: PageLine[]) => {
    for (const l of lines) if (!pageId.has(l.text)) pageId.set(l.text, `P${String(++pageNumber).padStart(2, "0")}`);
  };
  number([...pageTop, ...fullParts.flatMap((p) => p.lines)]);
  if (pageNumber !== 3 + fullParts.flatMap((p) => p.lines).length) throw new Error("the full privacy page repeats a line");
  number([...v1Top, ...v1Parts.flatMap((p) => p.lines)]);

  const liveV1 = privacy.PRIVACY_VERSION === "v1";
  const [liveTop, liveParts, keptTop, keptParts] = liveV1
    ? [[...pageTop, ...v1Top], v1Parts, pageTop, fullParts]
    : [pageTop, fullParts, [...pageTop, ...v1Top], v1Parts];
  const [liveName, keptName] = liveV1
    ? ["v1 page, for the calculator alone, with no email form (N45)", "full page, which describes the email form and waits for counsel (N17)"]
    : ["full page, which describes the email form (N17)", "v1 page, for the calculator alone (N45)"];
  newScreen(
    "2. Privacy page (peso.credit/privacy)",
    "P",
    `On screen (PRIVACY_VERSION): the ${liveName}. Kept in the source, not on screen, and listed last: the ${keptName}. \`${copy.placeholderOpen} …]\` blanks are shown highlighted on the page, exactly as below.`,
  );
  newSection("2.1 Top of page");
  for (const l of liveTop) add(l.text, l.where, l.when, pageId.get(l.text));
  for (const part of liveParts) {
    newSection(`2.${screen.sections.length + 1} ${part.title}`);
    for (const l of part.lines) add(l.text, l.where, l.when, pageId.get(l.text));
  }
  const onScreen = new Set([...liveTop, ...liveParts.flatMap((p) => p.lines)].map((l) => l.text));
  newSection(
    `2.${screen.sections.length + 1} Kept for later, not on screen: the other version`,
    `The ${keptName}, top to bottom. Lines it shares with the page above are not repeated.`,
  );
  for (const l of keptTop) if (!onScreen.has(l.text)) add(l.text, l.where, `${l.when} (not on screen)`, pageId.get(l.text));
  for (const part of keptParts) {
    for (const l of part.lines) {
      if (!onScreen.has(l.text)) add(l.text, l.where, `${l.when}, in “${part.title}” (not on screen)`, pageId.get(l.text));
    }
  }

  // -------------------------------------------------------------------------
  newScreen("3. Browser tab and search results", "T", "Text that appears outside the page body.");
  newSection("3.1 Titles and description");
  add(copy.documentTitle, at("documentTitle"), "tab title, calculator page");
  add(copy.metaDescription, at("metaDescription"), "search-result description");
  const titleOf = (status: privacy.PrivacyStatus) => {
    const title = privacy.privacyHeadMeta(status).find((m) => m.title !== undefined)?.title;
    if (!title) throw new Error(`no title for a ${status} privacy page`);
    return title;
  };
  add(titleOf("draft"), at("privacyHeadTitleDraft"), "tab title, privacy page while draft");
  add(titleOf("final"), at("privacyHeadTitleFinal"), "tab title, privacy page once final");

  // -------------------------------------------------------------------------
  newScreen("4. Error page", "E", `Shown only if the app fails.${language.errorNote}`);
  newSection("4.1 Error page");
  add(copy.errorHeading, at("errorHeading"), "heading");
  add(copy.errorFallback, at("errorFallback"), "message when the error has no text of its own; otherwise the error's own message is shown");

  // -------------------------------------------------------------------------
  // The email /api/subscribe sends to the owner's inbox: never shown to a visitor.
  const ownerEmail = notifyEmail(
    { apiKey: "", notifyTo: "", from: "" },
    "{subscriber's address}",
    "{consent time}",
  );

  const ids = all.map((e) => e.id);
  const reused = ids.find((id, i) => ids.indexOf(id) !== i);
  if (reused !== undefined) throw new Error(`COPY-REVIEW.md ID ${reused} is given twice`);

  // Completeness: every on-screen literal in the app source must be inside some entry.
  const covered = squash(
    [
      ...all.map((e) => e.text.replace(/<\/?u>|\*\*/g, "")),
      ...CIRCUMVENTION_EXAMPLES,
      // The address blanks, shown only if CONTACT_EMAIL were emptied (privacy.test.ts).
      ...copy.privacySections("").flatMap((s) => s.paragraphs),
      ...(copy.privacyV1?.sections("") ?? []).flatMap((s) => s.paragraphs),
      ownerEmail.subject,
      ownerEmail.text,
    ].join(" \n "),
  );
  const leftovers = wordLiterals()
    .filter((l) => !covered.includes(squash(l.text)))
    .map((l) => `${l.file}:${l.line} ${JSON.stringify(squash(l.text)).slice(0, 110)}`);

  // -------------------------------------------------------------------------
  const cell = (s: string) => s.replace(/\|/g, "\\|");
  let md = `# COPY-REVIEW — peso.credit

Every string a visitor can see, verbatim, grouped by screen, for independent content review
(BUILD-STANDARD point 14; DECISIONS N32). Reviewers need nothing else to read it cold.

- **Generated from the source by \`tools/copy-review.ts\`.** Text is taken from the app's own
  values or straight from the source, never retyped; line numbers are looked up. \`npm test\`
  fails if this file is out of date or leaves out an on-screen string.
- **Language on screen: ${language.name}** (\`${active.file}\`, chosen in \`src/lib/copy.ts\`).
- **Nothing here is a proposal.** No copy was rewritten for this document.
- \`{…}\` marks a part that varies (a number, a date, the borrower's own figure). Where it helps,
  an example follows in the "Shown when" column.
- <u>Underlined</u> text is a link to the SEC circular (${SOURCE.id}). **Bold** is bold on screen.
- IDs (C01, P01, …) are for review notes: "C14: …". They never change: a line added later takes
  the next free number of its screen, so a section's IDs can be out of order.

## For reviewers

${language.reviewNote} Please note, by ID:

1. Anything that overclaims, accuses, or could be read as naming or judging a lender.
2. Anything that reads as advice ("you should…") or promises an outcome.
3. Any term used incorrectly, or wording a borrower could misread.
4. Anything unclear, awkward, or inconsistent with the rest.

The rules this copy must keep: inform, never accuse; never name a lender; never say ilegal,
illegal, scam, fraud or loan shark; when the law is unclear (the methods disagree), the result
shows "close to the limit", never "over"; not legal advice.

This review is what Napoleon signs on (SIGNOFF.json, \`reviewedBy\`). What each signature covers:
\`verdict-wording\` is sections 1.3–1.5; \`privacy-page\` is the page on screen in section 2, except
P03 (the DRAFT banner goes when the page is signed) and the version kept for later; \`cap-values\` is the numbers inside the underlined caps, checked
against the circular itself rather than in this review.

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
| Subject: ${cell(ownerEmail.subject)}. Body: ${cell(ownerEmail.text.trim().replace(/\n/g, " / "))} | \`src/lib/subscribe.ts:${lineOf("src/lib/subscribe.ts", "export function notifyEmail(")}\` | The email each new subscription sends to the owner's inbox through Resend (DECISIONS N13); only the owner reads it. |
`;
  for (const file of inactiveLanguageFiles(active.file)) {
    const code = file.slice(COPY_DIR.length, -".ts".length);
    const name = LANGUAGES[code]?.name ?? code;
    md += `| Every word of the ${name} copy | \`${file}\` | Kept, unused, for a later ${name} version (DECISIONS N34); \`src/lib/copy.ts\` shows one language. |\n`;
  }
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
