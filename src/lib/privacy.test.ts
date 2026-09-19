import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { NO_STORAGE_NOTE } from "./copy.ts";
import {
  DRAFT_BANNER,
  placeholder,
  PRIVACY_SECTIONS,
  remainingPlaceholders,
  splitPlaceholders,
} from "./privacy-copy.ts";
import { handleSubscribe } from "./subscribe.ts";
import { srcRoot } from "./test-utils/source-strings.ts";

const root = srcRoot();
const read = (file: string) => readFileSync(join(root, file), "utf8");
const section = (pattern: RegExp) => PRIVACY_SECTIONS.find((s) => pattern.test(s.heading));
const textOf = (s: { paragraphs: string[] } | undefined) => (s?.paragraphs ?? []).join(" ");

describe("privacy page (DRAFT)", () => {
  it("covers what is collected, why, how to unsubscribe, and how to make contact", () => {
    for (const [name, pattern] of [
      ["what is collected", /^Ano ang kinokolekta/i],
      ["what is not collected", /hindi namin kinokolekta/i],
      ["why", /^Bakit/i],
      ["how to unsubscribe", /unsubscribe/i],
      ["contact", /^Makipag-ugnayan/i],
    ] as const) {
      assert.ok(section(pattern), `missing section: ${name}`);
    }
  });

  it("is marked DRAFT for a lawyer, in the copy and on the page", () => {
    assert.match(DRAFT_BANNER, /DRAFT/);
    assert.match(DRAFT_BANNER, /abogado/i);
    // The import alone is not enough: the banner has to be rendered on the page.
    assert.match(read("routes/privacy.tsx"), /\{DRAFT_BANNER\}/, "the page must show the banner");
  });

  it("says the calculator's numbers are neither saved nor sent, in the same words as the calculator", () => {
    assert.ok(textOf(section(/hindi namin kinokolekta/i)).includes(NO_STORAGE_NOTE));
  });

  it("discloses exactly what the server forwards: no more, no less", async () => {
    // What the copy says is collected, keyed by the field the server forwards.
    const disclosed: Record<string, string> = {
      email: "email address",
      consentedAt: "oras ng pagpayag",
    };
    let sent: Record<string, unknown> = {};
    const capture = (async (_url: string | URL | Request, init?: RequestInit) => {
      sent = JSON.parse(String(init?.body));
      return new Response("ok");
    }) as typeof fetch;
    const response = await handleSubscribe(
      new Request("http://app.test/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://app.test" },
        body: JSON.stringify({ email: "ana@example.com", consent: true }),
      }),
      { captureUrl: "https://capture.example/hook", fetchImpl: capture },
    );
    assert.equal(response.status, 200);

    assert.deepEqual(Object.keys(sent).sort(), Object.keys(disclosed).sort(),
      "a field is forwarded that the privacy copy does not disclose (or the reverse)");
    const collected = textOf(section(/^Ano ang kinokolekta/i));
    for (const phrase of Object.values(disclosed)) {
      assert.ok(collected.includes(phrase), `the page does not mention: ${phrase}`);
    }
  });

  it("keeps the page out of search results while any blank is unfilled", () => {
    const source = read("routes/privacy.tsx");
    if (remainingPlaceholders().length > 0) {
      assert.match(source, /name:\s*"robots",\s*content:\s*"noindex"/);
    }
  });

  it("states no operator, address, provider or period of its own: those are blanks", () => {
    const text = PRIVACY_SECTIONS.flatMap((s) => s.paragraphs).join(" ");
    assert.doesNotMatch(text, /[\w.+-]+@[\w-]+\.[\w.]+/, "no email address is written into the page");
    assert.doesNotMatch(text, /https?:\/\//);
  });

  it("is linked from the calculator page, opening in a new tab so typed numbers are kept", () => {
    const home = read("routes/index.tsx");
    assert.match(home, /href="\/privacy"/);
    assert.match(home, /target="_blank"/);
  });

  it("reports the blanks that remain (a notice, like the empty lender list)", (t) => {
    const blanks = remainingPlaceholders();
    if (blanks.length > 0) {
      t.diagnostic(
        `The privacy page still has ${blanks.length} blank(s) to fill before it is final: ${blanks.join(" | ")}`,
      );
    }
  });
});

describe("placeholders", () => {
  it("are written as [ILAGAY DITO: ...] and can be listed and split out", () => {
    const paragraph = `Sumulat sa ${placeholder("email ng contact")} o sa ${placeholder("address")}.`;
    assert.deepEqual(splitPlaceholders(paragraph), [
      { text: "Sumulat sa ", blank: false },
      { text: "[ILAGAY DITO: email ng contact]", blank: true },
      { text: " o sa ", blank: false },
      { text: "[ILAGAY DITO: address]", blank: true },
      { text: ".", blank: false },
    ]);
  });

  it("split text back to the same text, and pass plain paragraphs through", () => {
    for (const paragraph of PRIVACY_SECTIONS.flatMap((s) => s.paragraphs)) {
      assert.equal(splitPlaceholders(paragraph).map((p) => p.text).join(""), paragraph);
    }
    assert.deepEqual(splitPlaceholders("walang blank"), [{ text: "walang blank", blank: false }]);
    assert.deepEqual(splitPlaceholders("[ILAGAY DITO: bukas"), [{ text: "[ILAGAY DITO: bukas", blank: false }]);
  });
});
