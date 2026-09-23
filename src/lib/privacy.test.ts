import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { copy } from "./copy.ts";
import {
  CONTACT_EMAIL,
  DRAFT_BANNER,
  placeholder,
  PRIVACY_SECTIONS,
  PRIVACY_STATUS,
  privacyHeadMeta,
  type PrivacyStatus,
  remainingPlaceholders,
  showDraftBanner,
  splitPlaceholders,
} from "./privacy-copy.ts";
import type { SignoffRecord } from "./signoff.ts";
import { handleSubscribe, isValidEmail } from "./subscribe.ts";
import { literalsIn, srcRoot } from "./test-utils/source-strings.ts";

const root = srcRoot();
const read = (file: string) => readFileSync(join(root, file), "utf8");
const section = (pattern: RegExp) => PRIVACY_SECTIONS.find((s) => pattern.test(s.heading));
const textOf = (s: { paragraphs: string[] } | undefined) => (s?.paragraphs ?? []).join(" ");
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;

/** The status the page must have: final only once it is signed and has no blanks left. */
const requiredStatus = (signed: boolean, blanks: number): PrivacyStatus =>
  signed && blanks === 0 ? "final" : "draft";

/** Whether SIGNOFF.json signs the privacy page (signoff.test.ts checks the hash still matches). */
function privacyPageSigned(): boolean {
  const record = JSON.parse(
    readFileSync(new URL("../../SIGNOFF.json", import.meta.url), "utf8"),
  ) as SignoffRecord;
  return record.items.find((item) => item.id === "privacy-page")?.signature != null;
}

describe("privacy page (DRAFT)", () => {
  it("covers what is collected, why, how to unsubscribe, and how to make contact", () => {
    for (const [name, pattern] of [
      ["what is collected", /^What we collect/i],
      ["what is not collected", /don't collect/i],
      ["why", /^Why/i],
      ["how to unsubscribe", /unsubscribe/i],
      ["contact", /^Contact/i],
    ] as const) {
      assert.ok(section(pattern), `missing section: ${name}`);
    }
  });

  it("is final exactly when it is signed in SIGNOFF.json with no blanks left, and a draft otherwise", () => {
    const required = requiredStatus(privacyPageSigned(), remainingPlaceholders().length);
    assert.equal(
      PRIVACY_STATUS,
      required,
      required === "final"
        ? "the page is signed and complete: set PRIVACY_STATUS to \"final\" to drop DRAFT and let it be indexed"
        : "a final page must be signed in SIGNOFF.json and have no blanks left",
    );
  });

  it("the status decides the banner and the head tags, on the real page", () => {
    const page = read("routes/privacy.tsx");
    // The import alone is not enough: the banner has to be rendered, behind the status.
    assert.match(page, /\{showDraftBanner\(PRIVACY_STATUS\) && \(/, "the banner shows only for a draft");
    assert.match(page, /\{DRAFT_BANNER\}/, "the page renders the banner");
    assert.match(page, /meta: privacyHeadMeta\(PRIVACY_STATUS\)/, "the head tags come from the status");
    assert.doesNotMatch(page, /noindex|\(DRAFT\)/, "no head tag is typed out on the page itself");
  });

  it("a draft says DRAFT for a lawyer, in the banner and the title, and is hidden from search", () => {
    assert.match(DRAFT_BANNER, /DRAFT/);
    assert.match(DRAFT_BANNER, /lawyer/i);
    assert.equal(showDraftBanner("draft"), true);
    const meta = privacyHeadMeta("draft");
    assert.ok(meta.some((m) => m.title?.includes("(DRAFT)")));
    assert.ok(meta.some((m) => m.name === "robots" && m.content === "noindex"));
  });

  it("the workflow succeeding: a final page drops DRAFT everywhere and can be indexed", () => {
    assert.equal(requiredStatus(true, 0), "final");
    assert.equal(requiredStatus(true, 1), "draft", "signed with a blank left is still a draft");
    assert.equal(requiredStatus(false, 0), "draft", "complete but unsigned is still a draft");
    assert.equal(showDraftBanner("final"), false);
    const meta = privacyHeadMeta("final");
    assert.ok(meta.some((m) => m.title !== undefined && !m.title.includes("DRAFT")));
    assert.ok(!meta.some((m) => m.name === "robots"), "no robots tag: indexable");
  });

  it("says the calculator's numbers are neither saved nor sent, in the same words as the calculator", () => {
    assert.ok(textOf(section(/don't collect/i)).includes(copy.noStorageNote));
  });

  it("discloses exactly what the server forwards: no more, no less", async () => {
    // What the copy says is collected, keyed by the field in the email the server sends.
    const disclosed: Record<string, string> = {
      Email: "email address",
      "Consented at": "the time you agreed",
    };
    let sent: Record<string, string> = {};
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
      {
        env: {
          RESEND_API_KEY: "re_test_key",
          SUBSCRIBE_NOTIFY_TO: "owner@inbox.example",
          SUBSCRIBE_FROM: "subscribe@peso.credit",
        },
        fetchImpl: capture,
      },
    );
    assert.equal(response.status, 200);

    // The email's other parts are the owner's settings and a fixed subject, not the visitor's data.
    assert.deepEqual(Object.keys(sent).sort(), ["from", "subject", "text", "to"]);
    const fields = sent.text.trim().split("\n").map((line) => line.split(": ")[0]);
    assert.deepEqual(fields.sort(), Object.keys(disclosed).sort(),
      "a field is sent that the privacy copy does not disclose (or the reverse)");
    const collected = textOf(section(/^What we collect/i));
    for (const phrase of Object.values(disclosed)) {
      assert.ok(collected.includes(phrase), `the page does not mention: ${phrase}`);
    }
  });

  it("an email address appears only through CONTACT_EMAIL, its one designated field", () => {
    if (CONTACT_EMAIL !== "") assert.ok(isValidEmail(CONTACT_EMAIL), "CONTACT_EMAIL is not an address");
    const text = PRIVACY_SECTIONS.flatMap((s) => s.paragraphs).join(" ");
    const shown = [...new Set(text.match(new RegExp(EMAIL.source, "g")) ?? [])];
    assert.deepEqual(shown, CONTACT_EMAIL === "" ? [] : [CONTACT_EMAIL], "an address outside CONTACT_EMAIL");
    // Nowhere else in the source either: only the CONTACT_EMAIL declaration may hold one.
    // The page's words live in the language files, so those are read too.
    const languageFiles = readdirSync(join(root, "lib/copy"))
      .filter((f) => f.endsWith(".ts"))
      .map((f) => `lib/copy/${f}`);
    assert.ok(languageFiles.includes("lib/copy/fil.ts"), "the language files are not being read");
    const literals = ["lib/privacy-copy.ts", ...languageFiles]
      .flatMap((file) => literalsIn(file, read(file)))
      .filter((l) => l.kind === "string" && EMAIL.test(l.text));
    assert.ok(literals.length <= 1 && literals.every((l) => l.text === CONTACT_EMAIL), JSON.stringify(literals));
  });

  it("the designated field fills every place the page gives an address", () => {
    // Filling in an address shows which blanks are address blanks: exactly the two it replaces.
    const sample = "requests@example.com";
    const textWith = (address: string) =>
      copy.privacySections(address).flatMap((s) => s.paragraphs).join(" ");
    const blanks = (text: string) => splitPlaceholders(text).filter((p) => p.blank).length;
    assert.equal(textWith(sample).split(sample).length - 1, 2, "the address goes in two places");
    assert.equal(blanks(textWith("")) - blanks(textWith(sample)), 2, "each is a blank until then");
    // The live page: the address in both places once supplied, and neither blank left.
    const live = PRIVACY_SECTIONS.flatMap((s) => s.paragraphs).join(" ");
    const expected = CONTACT_EMAIL === "" ? blanks(textWith("")) : blanks(textWith("")) - 2;
    assert.equal(remainingPlaceholders().length, expected);
    if (CONTACT_EMAIL !== "") assert.equal(live.split(CONTACT_EMAIL).length - 1, 2);
  });

  it("states no web address of its own", () => {
    const text = PRIVACY_SECTIONS.flatMap((s) => s.paragraphs).join(" ");
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
  it("are written as [FILL IN: ...] and can be listed and split out", () => {
    const paragraph = `Write to ${placeholder("contact email")} or to ${placeholder("address")}.`;
    assert.deepEqual(splitPlaceholders(paragraph), [
      { text: "Write to ", blank: false },
      { text: "[FILL IN: contact email]", blank: true },
      { text: " or to ", blank: false },
      { text: "[FILL IN: address]", blank: true },
      { text: ".", blank: false },
    ]);
  });

  it("split text back to the same text, and pass plain paragraphs through", () => {
    for (const paragraph of PRIVACY_SECTIONS.flatMap((s) => s.paragraphs)) {
      assert.equal(splitPlaceholders(paragraph).map((p) => p.text).join(""), paragraph);
    }
    assert.deepEqual(splitPlaceholders("no blank here"), [{ text: "no blank here", blank: false }]);
    assert.deepEqual(splitPlaceholders("[FILL IN: unclosed"), [{ text: "[FILL IN: unclosed", blank: false }]);
  });
});
