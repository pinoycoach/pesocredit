/**
 * Helpers for tests that read the app's own source: list every literal a file can put
 * on screen or compute with, using TypeScript's parser (already a dev dependency).
 */
import { readdirSync } from "node:fs";
import { sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export type Literal = {
  file: string;
  line: number;
  kind: "string" | "number";
  /** The string's contents, or the number as written. */
  text: string;
  /** The numeric value, for numbers. */
  value?: number;
};

/** Every string, template piece, JSX text and number in one source file. */
export function literalsIn(file: string, source: string): Literal[] {
  const scriptKind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind);
  const found: Literal[] = [];
  const lineOf = (node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

  const visit = (node: ts.Node): void => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      found.push({ file, line: lineOf(node), kind: "string", text: node.text });
    } else if (ts.isJsxText(node)) {
      if (node.text.trim()) {
        found.push({ file, line: lineOf(node), kind: "string", text: node.text.trim() });
      }
    } else if (ts.isNumericLiteral(node)) {
      const text = node.getText(sf);
      found.push({
        file,
        line: lineOf(node),
        kind: "number",
        text,
        value: Number(text.replace(/_/g, "")),
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

/** The `src/` directory. */
export function srcRoot(): string {
  return fileURLToPath(new URL("../../", import.meta.url));
}

/** Tests, this helper, generated code and type declarations are not app source. */
export function isTestOrGenerated(relativePath: string): boolean {
  return (
    /\.test\.tsx?$/.test(relativePath) ||
    relativePath.startsWith("lib/test-utils/") ||
    relativePath === "routeTree.gen.ts" ||
    relativePath.endsWith(".d.ts")
  );
}

/** Relative paths (forward slashes) of the .ts/.tsx files under `root` that `exclude` keeps. */
export function sourceFiles(root: string, exclude: (relativePath: string) => boolean): string[] {
  return readdirSync(root, { recursive: true, encoding: "utf8" })
    .map((p) => p.split(sep).join("/"))
    .filter((p) => /\.tsx?$/.test(p) && !exclude(p))
    .sort();
}
