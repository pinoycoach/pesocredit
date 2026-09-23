/**
 * CLAUDE.md principle 3: nothing the borrower types leaves their phone. That is only
 * true if the app cannot send or keep anything, so this reads every source file and lists
 * every network, storage and environment API it uses. Each use has to be on the
 * explicit ALLOWED list below, with the reason. A change that needs one adds the exact
 * file and the reason here, where a reviewer sees it. Everything on the list is server
 * side; the browser code uses none of them until the email form's own request (below).
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";
import {
  isTestOrGenerated,
  literalsIn,
  sourceFiles,
  srcRoot,
} from "./test-utils/source-strings.ts";

/** The host's own functions (netlify/functions), scanned too; paths are relative to src/. */
const HOST_FUNCTIONS = "../netlify/functions";

/** API name -> the only files allowed to use it, and why. */
const ALLOWED: Record<string, { files: string[]; why: string }> = {
  fetch: {
    files: ["lib/subscribe.ts", "lib/subscribe-client.ts"],
    why: "subscribe.ts (server): emails the owner's inbox through Resend, the subscriber's address + consent time only. subscribe-client.ts (browser): posts only the typed email to this site's own /api/subscribe; it imports nothing, so it cannot reach the loan numbers",
  },
  "process.env": {
    files: [`${HOST_FUNCTIONS}/subscribe.mts`, "lib/get-public-config.ts"],
    why: "server side: the /api/subscribe function reads the Resend settings (RESEND_API_KEY, SUBSCRIBE_NOTIFY_TO, SUBSCRIBE_FROM); the page's config reads them, GUIDE_URL and NETLIFY_DEV. The key and the inbox never reach the browser",
  },
  "import.meta.env": {
    files: ["lib/get-public-config.ts"],
    why: "server side: import.meta.env.DEV tells the page's config whether it runs under a dev server, where /api/subscribe exists only under netlify dev; a boolean, no data",
  },
};

/** File -> the only web addresses it may write, and why. */
const ALLOWED_ADDRESSES: Record<string, { addresses: string[]; why: string }> = {
  "lib/subscribe.ts": {
    addresses: ["https://api.resend.com/emails"],
    why: "server side: Resend's send-email endpoint, the one service /api/subscribe contacts (DECISIONS N13)",
  },
};

/** Identifiers that reach the network or keep data. */
const FORBIDDEN_IDENTIFIERS = [
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "sendBeacon",
  "localStorage",
  "sessionStorage",
  "indexedDB",
];

function walk(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node);
  ts.forEachChild(node, (child) => walk(child, visit));
}

/** Every network, storage or environment API used in one file, by name. */
export function apiUses(file: string, source: string): { api: string; line: number }[] {
  const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  const uses: { api: string; line: number }[] = [];
  const at = (node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

  walk(sf, (node) => {
    if (ts.isIdentifier(node) && FORBIDDEN_IDENTIFIERS.includes(node.text)) {
      uses.push({ api: node.text, line: at(node) });
    }
    // document.cookie
    if (ts.isPropertyAccessExpression(node) && node.name.text === "cookie") {
      uses.push({ api: "document.cookie", line: at(node) });
    }
    // process.env
    if (
      ts.isPropertyAccessExpression(node) &&
      node.name.text === "env" &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "process"
    ) {
      uses.push({ api: "process.env", line: at(node) });
    }
    // import.meta.env
    if (
      ts.isPropertyAccessExpression(node) &&
      node.name.text === "env" &&
      ts.isMetaProperty(node.expression)
    ) {
      uses.push({ api: "import.meta.env", line: at(node) });
    }
    // new Image(): an image request is a way to send data
    if (
      ts.isNewExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "Image"
    ) {
      uses.push({ api: "new Image", line: at(node) });
    }
  });
  return uses;
}

/** Strings that are web addresses: an app that contacts nobody has none of its own. */
export function webAddresses(file: string, source: string): { text: string; line: number }[] {
  return literalsIn(file, source)
    .filter((l) => l.kind === "string" && /^(https?:)?\/\//i.test(l.text.trim()))
    .map((l) => ({ text: l.text, line: l.line }));
}

describe("nothing leaves the phone: the app cannot send or keep data", () => {
  // Listed inside the tests, never while the suite is set up (N39): if netlify/functions/ is missing, every
  // test here fails, instead of the whole suite silently not running.
  let scanned: string[] | undefined;
  const files = () =>
    (scanned ??= [
      ...sourceFiles(srcRoot(), (p) => isTestOrGenerated(p) || p === "lib/rules.ts"),
      ...readdirSync(join(srcRoot(), HOST_FUNCTIONS))
        .filter((name) => /\.m?tsx?$/.test(name))
        .map((name) => `${HOST_FUNCTIONS}/${name}`),
    ]);
  const read = (file: string) => readFileSync(join(srcRoot(), file), "utf8");

  it("scans the real app source, and the host's functions", () => {
    for (const expected of [
      "components/calculator.tsx",
      "lib/loan-math.ts",
      "routes/__root.tsx",
      `${HOST_FUNCTIONS}/subscribe.mts`,
    ]) {
      assert.ok(files().includes(expected), `${expected} is not being scanned`);
    }
  });

  it("every network, storage and environment API is on the allowed list", () => {
    const problems = files().flatMap((file) =>
      apiUses(file, read(file))
        .filter((use) => !ALLOWED[use.api]?.files.includes(file))
        .map((use) => `${file}:${use.line} uses ${use.api}`),
    );
    assert.deepEqual(problems, [], problems.join("\n"));
  });

  it("the allowed list only names files that exist and really use the API", () => {
    for (const [api, { files: allowedFiles }] of Object.entries(ALLOWED)) {
      for (const file of allowedFiles) {
        assert.ok(files().includes(file), `${api}: ${file} does not exist`);
        assert.ok(
          apiUses(file, read(file)).some((use) => use.api === api),
          `${api}: ${file} no longer uses it; remove it from the list`,
        );
      }
    }
  });

  it("no source file writes a web address, except those on the allowed list (rules.ts holds the one link to the circular)", () => {
    const found = files().flatMap((file) =>
      webAddresses(file, read(file))
        .filter((a) => !ALLOWED_ADDRESSES[file]?.addresses.includes(a.text))
        .map((a) => `${file}:${a.line} "${a.text}"`),
    );
    assert.deepEqual(found, [], found.join("\n"));
  });

  it("the allowed addresses are really written in their files", () => {
    for (const [file, { addresses }] of Object.entries(ALLOWED_ADDRESSES)) {
      const written = webAddresses(file, read(file)).map((a) => a.text);
      for (const address of addresses) {
        assert.ok(written.includes(address), `${file} no longer writes ${address}; remove it from the list`);
      }
    }
  });
});

describe("the scanner itself", () => {
  const sample = (code: string) => apiUses("sample.ts", code).map((u) => u.api);

  it("catches each way of sending or keeping data", () => {
    assert.deepEqual(sample('fetch("/x")'), ["fetch"]);
    assert.deepEqual(sample('window.fetch("/x")'), ["fetch"]);
    assert.deepEqual(sample("new XMLHttpRequest()"), ["XMLHttpRequest"]);
    assert.deepEqual(sample('new WebSocket("wss://x")'), ["WebSocket"]);
    assert.deepEqual(sample('new EventSource("/x")'), ["EventSource"]);
    assert.deepEqual(sample('navigator.sendBeacon("/x", data)'), ["sendBeacon"]);
    assert.deepEqual(sample('localStorage.setItem("a", "b")'), ["localStorage"]);
    assert.deepEqual(sample('window.sessionStorage.getItem("a")'), ["sessionStorage"]);
    assert.deepEqual(sample('indexedDB.open("db")'), ["indexedDB"]);
    assert.deepEqual(sample('document.cookie = "a=b"'), ["document.cookie"]);
    assert.deepEqual(sample("const k = process.env.KEY"), ["process.env"]);
    assert.deepEqual(sample("const k = import.meta.env.VITE_KEY"), ["import.meta.env"]);
    assert.deepEqual(sample('new Image().src = "/x?d=1"'), ["new Image"]);
  });

  it("catches a web address in a string", () => {
    assert.equal(webAddresses("s.ts", 'const u = "https://example.com/x";').length, 1);
    assert.equal(webAddresses("s.ts", 'const u = "//cdn.example.com/x";').length, 1);
    assert.equal(webAddresses("s.ts", 'const u = "/privacy";').length, 0);
  });

  it("does not flag ordinary code", () => {
    assert.deepEqual(sample("const fetched = 1; const fetchImpl = () => 2; envelope.cookies"), []);
  });
});
