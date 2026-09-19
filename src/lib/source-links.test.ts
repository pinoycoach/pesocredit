/**
 * Every cap on screen links to the published circular (SOURCE.url). The types already keep
 * cap copy from being rendered any other way (segments.test.ts); these read the source to
 * check the links themselves.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";
import { isTestOrGenerated, sourceFiles, srcRoot } from "./test-utils/source-strings.ts";

const root = srcRoot();
const files = sourceFiles(root, (p) => isTestOrGenerated(p) || p === "lib/rules.ts");
const read = (file: string) => readFileSync(join(root, file), "utf8");

function parse(file: string): ts.SourceFile {
  const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, kind);
}

function walk(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node);
  ts.forEachChild(node, (child) => walk(child, visit));
}

type Element = ts.JsxOpeningElement | ts.JsxSelfClosingElement;
const isElement = (node: ts.Node): node is Element =>
  ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node);

function attribute(element: Element, name: string): ts.JsxAttribute | undefined {
  return element.attributes.properties.find(
    (p): p is ts.JsxAttribute => ts.isJsxAttribute(p) && p.name.getText() === name,
  );
}

const stringValue = (attr: ts.JsxAttribute | undefined) =>
  attr?.initializer && ts.isStringLiteral(attr.initializer) ? attr.initializer.text : undefined;

describe("links to the published source", () => {
  it("scans the real app source", () => {
    assert.ok(files.includes("components/source-link.tsx"));
    assert.ok(files.includes("components/result.tsx"));
  });

  it("SOURCE.url is used in exactly one place, so every link is the same link", () => {
    const users = files.filter((file) => /\bSOURCE\.url\b/.test(read(file)));
    assert.deepEqual(users, ["components/source-link.tsx"]);
  });

  it("SourceLink points at SOURCE.url and opens a new tab safely", () => {
    const sf = parse("components/source-link.tsx");
    const anchors: Element[] = [];
    walk(sf, (n) => {
      if (isElement(n) && n.tagName.getText() === "a") anchors.push(n);
    });
    assert.equal(anchors.length, 1, "source-link.tsx should have exactly one anchor");
    const [anchor] = anchors;
    assert.equal(attribute(anchor, "href")?.initializer?.getText(), "{SOURCE.url}");
    assert.equal(stringValue(attribute(anchor, "target")), "_blank");
    const rel = stringValue(attribute(anchor, "rel")) ?? "";
    assert.ok(rel.includes("noopener") && rel.includes("noreferrer"), `rel="${rel}"`);
  });

  it("CapSegments renders every cap through SourceLink", () => {
    const sf = parse("components/source-link.tsx");
    let inCapSegments = false;
    walk(sf, (n) => {
      if (ts.isFunctionDeclaration(n) && n.name?.text === "CapSegments") {
        walk(n, (inner) => {
          if (isElement(inner) && inner.tagName.getText() === "SourceLink") inCapSegments = true;
        });
      }
    });
    assert.ok(inCapSegments, "CapSegments must render caps as <SourceLink>");
  });

  it("any link that opens a new tab, anywhere in the app, carries rel noopener", () => {
    const problems: string[] = [];
    for (const file of files.filter((f) => f.endsWith(".tsx"))) {
      walk(parse(file), (n) => {
        if (!isElement(n) || n.tagName.getText() !== "a") return;
        if (stringValue(attribute(n, "target")) !== "_blank") return;
        const rel = stringValue(attribute(n, "rel")) ?? "";
        if (!rel.includes("noopener")) problems.push(`${file}: <a target="_blank"> without rel="noopener"`);
      });
    }
    assert.deepEqual(problems, []);
  });
});

describe("the guard itself", () => {
  it("notices an unsafe new-tab link in sample code", () => {
    const sf = ts.createSourceFile(
      "sample.tsx",
      'export const X = () => <a href="https://example.com" target="_blank">x</a>;',
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    let found = false;
    walk(sf, (n) => {
      if (isElement(n) && n.tagName.getText() === "a") {
        const rel = stringValue(attribute(n, "rel")) ?? "";
        found = stringValue(attribute(n, "target")) === "_blank" && !rel.includes("noopener");
      }
    });
    assert.ok(found);
  });
});
