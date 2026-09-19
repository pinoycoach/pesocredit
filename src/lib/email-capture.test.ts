/**
 * CLAUDE.md principle 4: email capture is optional, separate, and never gates a result;
 * email is never sent together with loan numbers. The wire contract is tested by running
 * the real client and server code against each other; the rest by reading the source.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";
import { EMAIL_HEADING } from "./copy.ts";
import { handleSubscribe, parseSubscribeBody } from "./subscribe.ts";
import { buildSubscribeBody, submitEmail, SUBSCRIBE_PATH } from "./subscribe-client.ts";
import { srcRoot } from "./test-utils/source-strings.ts";

const root = srcRoot();
const read = (file: string) => readFileSync(join(root, file), "utf8");

function parse(file: string): ts.SourceFile {
  return ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function walk(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node);
  ts.forEachChild(node, (child) => walk(child, visit));
}

type Element = ts.JsxOpeningElement | ts.JsxSelfClosingElement;
const isElement = (node: ts.Node): node is Element =>
  ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node);

const attr = (el: Element, name: string) =>
  el.attributes.properties.find(
    (p): p is ts.JsxAttribute => ts.isJsxAttribute(p) && p.name.getText() === name,
  );

function elements(file: string, tag: string): Element[] {
  const found: Element[] = [];
  walk(parse(file), (n) => {
    if (isElement(n) && n.tagName.getText() === tag) found.push(n);
  });
  return found;
}

function importsOf(file: string): string[] {
  const specifiers: string[] = [];
  walk(parse(file), (n) => {
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
      specifiers.push(n.moduleSpecifier.text);
    }
  });
  return specifiers;
}

describe("the browser and the server agree on the message", () => {
  it("what the browser builds is exactly what the server's strict parser accepts", () => {
    const body = buildSubscribeBody("  ana@example.com ");
    assert.deepEqual(body, { email: "ana@example.com", consent: true });
    assert.deepEqual(parseSubscribeBody(body), { ok: true, email: "ana@example.com" });
  });

  it("submitEmail posts only { email, consent: true } to this site's own endpoint", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const send = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init: init ?? {} });
      return new Response("{}", { status: 200 });
    }) as typeof fetch;

    assert.equal(await submitEmail("ana@example.com", send), "ok");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, SUBSCRIBE_PATH);
    assert.equal(SUBSCRIBE_PATH, "/api/subscribe");
    assert.equal(calls[0].init.method, "POST");
    assert.deepEqual(Object.keys(JSON.parse(String(calls[0].init.body))).sort(), ["consent", "email"]);
  });

  it("answers failed, without throwing, when the server or the network fails", async () => {
    const status = (code: number) => (async () => new Response("x", { status: code })) as typeof fetch;
    for (const code of [400, 403, 404, 502]) {
      assert.equal(await submitEmail("ana@example.com", status(code)), "failed", String(code));
    }
    const offline = (async () => {
      throw new TypeError("network down");
    }) as typeof fetch;
    assert.equal(await submitEmail("ana@example.com", offline), "failed");
  });

  it("the real client talks to the real server and the capture service gets only two fields", async () => {
    let forwarded: Record<string, unknown> = {};
    const capture = (async (_url: string | URL | Request, init?: RequestInit) => {
      forwarded = JSON.parse(String(init?.body));
      return new Response("ok");
    }) as typeof fetch;
    // The client's fetch is wired straight to the server handler, as the browser would be.
    const wire = (async (_path: string | URL | Request, init?: RequestInit) =>
      handleSubscribe(
        new Request("http://app.test/api/subscribe", {
          method: "POST",
          headers: { ...(init?.headers as Record<string, string>), origin: "http://app.test" },
          body: init?.body as string,
        }),
        { captureUrl: "https://capture.example/hook", fetchImpl: capture },
      )) as typeof fetch;

    assert.equal(await submitEmail("ana@example.com", wire), "ok");
    assert.deepEqual(Object.keys(forwarded).sort(), ["consentedAt", "email"]);
  });
});

describe("the form is isolated from the calculator", () => {
  const ALLOWED_IMPORTS = [
    /^react$/,
    /^@\/components\/ui\//,
    /^@\/lib\/copy$/,
    /^@\/lib\/privacy-copy$/,
    /^@\/lib\/subscribe-client$/,
  ];

  it("email-capture.tsx imports only from an explicit list, none of it loan-related", () => {
    const specifiers = importsOf("components/email-capture.tsx");
    assert.ok(specifiers.length > 0);
    const outside = specifiers.filter((s) => !ALLOWED_IMPORTS.some((re) => re.test(s)));
    assert.deepEqual(outside, [], `unexpected imports: ${outside.join(", ")}`);
  });

  it("subscribe-client.ts imports nothing at all", () => {
    assert.deepEqual(importsOf("lib/subscribe-client.ts"), []);
  });

  it("takes no props, so nothing can be passed in from the calculator", () => {
    let params = -1;
    walk(parse("components/email-capture.tsx"), (n) => {
      if (ts.isFunctionDeclaration(n) && n.name?.text === "EmailCapture") params = n.parameters.length;
    });
    assert.equal(params, 0);
  });

  it("never refers to a loan field or the analysis", () => {
    const words = /\b(principal|payment|upfrontFee|penalty|bookedOn|analysis|LoanInput|LoanNumbers|paymentCount|firstDueDays)\b/;
    for (const file of ["components/email-capture.tsx", "lib/subscribe-client.ts", "lib/subscribe.ts"]) {
      assert.doesNotMatch(read(file).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ""), words, file);
    }
  });

  it("has exactly two inputs: the email and the consent box", () => {
    // The checkbox is a native <input>; the email field is the <Input> component.
    const names = ["input", "Input"].flatMap((tag) =>
      elements("components/email-capture.tsx", tag).map((el) => attr(el, "name")?.initializer?.getText()),
    );
    assert.deepEqual(names.sort(), ['"consent"', '"email"']);
    for (const tag of ["textarea", "select", "Textarea", "Select"]) {
      assert.equal(elements("components/email-capture.tsx", tag).length, 0, `no <${tag}>`);
    }
  });
});

describe("consent", () => {
  it("the box starts unchecked and is never pre-ticked in markup", () => {
    const source = parse("components/email-capture.tsx");
    let initial: string | undefined;
    walk(source, (n) => {
      if (
        ts.isVariableDeclaration(n) &&
        ts.isArrayBindingPattern(n.name) &&
        n.name.elements[0]?.getText() === "consent" &&
        n.initializer &&
        ts.isCallExpression(n.initializer)
      ) {
        initial = n.initializer.arguments[0]?.getText();
      }
    });
    assert.equal(initial, "false", "consent must start as useState(false)");

    const checkbox = elements("components/email-capture.tsx", "input").find(
      (el) => attr(el, "type")?.initializer?.getText() === '"checkbox"',
    );
    assert.ok(checkbox, "there is a checkbox");
    assert.equal(attr(checkbox, "defaultChecked"), undefined, "no defaultChecked");
    assert.equal(attr(checkbox, "checked")?.initializer?.getText(), "{consent}");
  });

  it("links to /privacy in a new tab that cannot touch this one", () => {
    const link = elements("components/email-capture.tsx", "a").find(
      (el) => attr(el, "href")?.initializer?.getText() === '"/privacy"',
    );
    assert.ok(link, "the consent text links to /privacy");
    assert.equal(attr(link, "target")?.initializer?.getText(), '"_blank"');
    assert.match(attr(link, "rel")?.initializer?.getText() ?? "", /noopener/);
  });

  it("submitting needs consent, and the form can never be sent as a plain GET", () => {
    const source = read("components/email-capture.tsx");
    assert.match(source, /if \(!consent \|\| status === "sending"\) return;/);
    assert.match(source, /disabled=\{!ready \|\| !consent/);
    const form = elements("components/email-capture.tsx", "form")[0];
    assert.equal(attr(form, "method")?.initializer?.getText(), '"post"');
  });
});

describe("placement: below the result, never before it, never required", () => {
  it("the calculator shows the extras only after the whole result block", () => {
    const source = read("components/calculator.tsx");
    const at = (needle: string) => source.indexOf(needle);
    assert.ok(at("<OptionalExtras") > at("<Headline "), "extras come after the headline");
    assert.ok(at("<OptionalExtras") > at("<HowComputed "), "extras come after the working");
    assert.ok(at("<OptionalExtras") > at("<LegalFoot"), "extras come after the whole result");
    assert.equal(source.split("<OptionalExtras").length - 1, 1, "shown in exactly one place");
    assert.ok(!source.includes("EmailCapture"), "the calculator never renders the form directly");
    assert.ok(!source.includes("<EmailCapture"), "and it is not inside the input card");
  });

  it("the result never depends on the extras: nothing in the calculator reads the config except to pass it on", () => {
    const source = read("components/calculator.tsx");
    const uses = source.match(/publicConfig/g) ?? [];
    // Destructured, typed, and handed to <OptionalExtras>: nothing else may look at it.
    assert.equal(uses.length, 3);
    assert.match(source, /\{ publicConfig \}: \{ publicConfig: PublicConfig \}/);
    assert.match(source, /<OptionalExtras config=\{publicConfig\} \/>/);
  });

  it("the form shows only when enabled, and the guide link only when set, each on its own", () => {
    const source = read("components/optional-extras.tsx");
    assert.match(source, /config\.emailCaptureEnabled \? <EmailCapture \/> : null/);
    assert.match(source, /config\.guideUrl \? \(/);
    assert.match(source, /if \(!config\.emailCaptureEnabled && !config\.guideUrl\) return null;/);
  });

  it("the guide link opens in a new tab safely", () => {
    const link = elements("components/optional-extras.tsx", "a")[0];
    assert.equal(attr(link, "href")?.initializer?.getText(), "{config.guideUrl}");
    assert.equal(attr(link, "target")?.initializer?.getText(), '"_blank"');
    assert.match(attr(link, "rel")?.initializer?.getText() ?? "", /noopener/);
  });
});

describe("wording", () => {
  it("asks exactly the specified question", () => {
    assert.equal(EMAIL_HEADING, "Gusto mo ng libreng checklist at abiso kapag may bagong rules?");
  });
});
